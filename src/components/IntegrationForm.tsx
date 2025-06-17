import React from 'react'

type IntegrationFormProps = {
  onSubmit: (data: { name: string; description: string; config: string }) => void
  initialValues?: { name: string; description: string; config: string }
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ onSubmit, initialValues }) => {
  // TODO: Implement form state and handlers
  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); /* call onSubmit */ }}>
      <input className="w-full px-3 py-2 border rounded" placeholder="Name" defaultValue={initialValues?.name} />
      <textarea className="w-full px-3 py-2 border rounded" placeholder="Description" defaultValue={initialValues?.description} />
      <textarea className="w-full px-3 py-2 border rounded" placeholder="Config (JSON)" defaultValue={initialValues?.config} />
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save</button>
    </form>
  )
}

export default IntegrationForm 