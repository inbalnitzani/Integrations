import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import type { Integration, IntegrationFilters as IntegrationFiltersType } from '../types/integration'
import IntegrationFiltersComponent from '../components/IntegrationFilters'

const ITEMS_PER_PAGE = 9

const IntegrationsList: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<IntegrationFiltersType>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch suppliers only once when component mounts
  const fetchSuppliers = useCallback(async () => {
    try {
      const { data: allIntegrations } = await supabase
        .from('integrations')
        .select('supplier')
        .order('supplier')

      const uniqueSuppliers = Array.from(
        new Set(allIntegrations?.map(integration => integration.supplier) || [])
      )
      setSuppliers(uniqueSuppliers)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const fetchIntegrations = async (filters: IntegrationFiltersType, page: number) => {
    try {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate range for pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('integrations')
        .select('*', { count: 'exact' })

      // Apply type filter
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      // Apply supplier filter
      if (filters.supplier) {
        query = query.eq('supplier', filters.supplier)
      }

      // Apply date range filter
      if (filters.dateRange?.start && filters.dateRange?.end) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end)
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data: integrationsData, error: integrationsError, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (integrationsError) throw integrationsError

      setIntegrations(integrationsData)
      setTotalCount(count || 0)
    } catch (err) {
      setError('Error loading integrations')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchIntegrations({}, 1)
  }, [])

  const handleFilterChange = (filters: IntegrationFiltersType) => {
    setCurrentFilters(filters)
    setCurrentPage(1) // Reset to first page when filters change
    fetchIntegrations(filters, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchIntegrations(currentFilters, page)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (error) {
    return <div className="p-4 sm:p-8 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Integrations</h1>
      </div>

      <IntegrationFiltersComponent
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        suppliers={suppliers}
      />

      <div className="relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!isLoading && integrations.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            No integrations found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {integrations.map(integration => (
                <div
                  key={integration.id}
                  className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">{integration.name}</h3>
                    <span className="px-2 py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded self-start">
                      {integration.type}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                    <span>{integration.supplier}</span>
                    <span>
                      {new Date(integration.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-2 sm:px-3 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`px-2 sm:px-3 py-1 text-sm rounded border ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-2 sm:px-3 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default IntegrationsList 