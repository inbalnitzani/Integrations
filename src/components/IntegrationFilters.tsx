import React from 'react'
import type { IntegrationType, IntegrationFilters } from '../types/integration'

interface IntegrationFiltersProps {
  filters: IntegrationFilters
  onFilterChange: (filters: IntegrationFilters) => void
  suppliers: string[]
}

const IntegrationFiltersComponent: React.FC<IntegrationFiltersProps> = ({
  filters,
  onFilterChange,
  suppliers,
}) => {

  const handleIntegrationTypeChange = (integration_type: IntegrationType | '') => {
    onFilterChange({ ...filters, integration_type: integration_type || undefined })
  }

  const handleSupplierChange = (supplier: string) => {
    onFilterChange({ ...filters, supplier: supplier || undefined })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = {
      ...filters.dateRange,
      [field]: value,
    }
    if (newDateRange.start && newDateRange.end) {
      onFilterChange({
        ...filters,
        dateRange: newDateRange as { start: string; end: string },
      })
    } else {
      onFilterChange({
        ...filters,
        dateRange: undefined,
      })
    }
  }

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search })
  }

  const handleClearFilters = () => {
    onFilterChange({})
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Search integrations..."
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={filters.integration_type || ''}
            onChange={e => handleIntegrationTypeChange(e.target.value as IntegrationType)}
          >
            <option value="">All Types</option>
            <option value="Invoicing & Billing">Invoicing & Billing</option>
            <option value="SMS & Messaging">SMS & Messaging</option>
            <option value="Chat & Instant Messaging">Chat & Instant Messaging</option>
            <option value="Major CRMs">Major CRMs</option>
            <option value="Email Services">Email Services</option>
            <option value="Payment Processors">Payment Processors</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={filters.supplier || ''}
            onChange={e => handleSupplierChange(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="px-3 py-2 border rounded-md"
              value={filters.dateRange?.start || ''}
              onChange={e => handleDateRangeChange('start', e.target.value)}
            />
            <input
              type="date"
              className="px-3 py-2 border rounded-md"
              value={filters.dateRange?.end || ''}
              onChange={e => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default IntegrationFiltersComponent 