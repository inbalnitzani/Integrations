import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { Integration } from '../types/integration'

interface CreateIntegrationProps {
  onClose: () => void
  onSuccess: () => void
  integration?: Integration
}

const CreateIntegration: React.FC<CreateIntegrationProps> = ({
  onClose,
  onSuccess,
  integration,
}) => {
  const isEditMode = !!integration
  const [formData, setFormData] = useState<Partial<Integration>>(
    integration || {
      name: '',
      integration_type: undefined,
      supplier: '',
      description: '',
      api_docs_url: '',
      config_example: '',
      tags: '',
      logo_url: '',
    }
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = await supabase.auth.getUser()
      const email = user.data.user?.email
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('integrations')
          .update(formData)
          .eq('id', integration.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('integrations')
          .insert([{ ...formData, author: email }])

        if (insertError) throw insertError
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(isEditMode ? 'Failed to update integration' : 'Failed to create integration')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditMode) return

    if (!window.confirm('Are you sure you want to delete this integration?')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integration.id)

      if (deleteError) throw deleteError

      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to delete integration')
      console.error('Error deleting integration:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAIFields = async () => {
    setIsAIGenerating(true)
    setError(null)

    try {
      const response = await fetch('https://wsgtrssaixhihlicfcpn.functions.supabase.co/generate-integration-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name }),
      })

      const data = await response.json()
      console.log(data)
      setFormData(prev => ({
        ...prev,
        description: data.result.description || prev.description,
        api_docs_url: data.result.api_docs_url || prev.api_docs_url,
        config_example: data.result.sample_config || prev.config_example,
        logo_url: data.result.logo_url || prev.logo_url,
        tags: data.result.tags || prev.tags,
        supplier: data.result.supplier || prev.supplier,
        integration_type: data.result.integration_type || prev.integration_type,
      }))
    } catch (err) {
      setError('Failed to generate AI fields')
      console.error('Error:', err)
    } finally {
      setIsAIGenerating(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"             required
            />
          </div>
          <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handleAIFields}
            disabled={isAIGenerating || !formData.name}
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
          >
            {isAIGenerating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            Generate with AI
          </button>
        </div>
          <div>
            <label htmlFor="integration_type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="integration_type"
              name="integration_type"
              value={formData.integration_type || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"              required
            >
              <option value="">Select a type</option>
              <option value="Invoicing & Billing">Invoicing & Billing</option>
              <option value="SMS & Messaging">SMS & Messaging</option>
              <option value="Chat & Instant Messaging">Chat & Instant Messaging</option>
              <option value="Major CRMs">Major CRMs</option>
              <option value="Email Services">Email Services</option>
              <option value="Payment Processors">Payment Processors</option>
            </select>

          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"              required
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"              placeholder="tag1, tag2, tag3"
            />
          </div>

          
        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input
            type="url"
            id="logo_url"
            name="logo_url"
            value={formData.logo_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"            />
        </div>
        </div>



        <div>
          <label htmlFor="api_docs_url" className="block text-sm font-medium text-gray-700">
            API Documentation URL
          </label>
          <input
            type="url"
            id="api_docs_url"
            name="api_docs_url"
            value={formData.api_docs_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"            />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"              required
            />
          </div>

          <div>
            <label htmlFor="configuration_example" className="block text-sm font-medium text-gray-700">
              Configuration Example
            </label>
            <textarea
              id="config_example"
              name="config_example"
              value={formData.config_example || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 text-base py-2.5 px-3 leading-normal"            />
          </div>
        </div>


        <div className="flex justify-between items-center pt-4">
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Integration'}
            </button>
          )}

          <div className={`flex gap-3 ${!isEditMode ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Integration')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateIntegration 