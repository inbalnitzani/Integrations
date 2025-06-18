export type IntegrationType = 'Invoicing & Billing' | 'SMS & Messaging' | 'Chat & Instant Messaging' | 'Major CRMs' | 'Email Services' | 'Payment Processors' | 'other'
export type IntegrationStatus = 'active' | 'inactive' | 'deprecated'
export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual'
export interface Integration {
  id: string
  name: string
  type: IntegrationType
  supplier: string
  description: string
  tags: string
  status: IntegrationStatus
  last_sync: string | null
  sync_frequency: SyncFrequency
  api_docs_url?: string
  config_example?: string
  credentials: Record<string, any>
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by: string
}

export interface IntegrationFilters {
  type?: IntegrationType
  supplier?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
} 