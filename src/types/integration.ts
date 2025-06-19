export type IntegrationType = 'Invoicing & Billing' | 'SMS & Messaging' | 'Chat & Instant Messaging' | 'Major CRMs' | 'Email Services' | 'Payment Processors' | 'other'
export interface Integration {
  id: string
  name: string
  integration_type: IntegrationType
  supplier: string
  description: string
  tags: string
  api_docs_url?: string
  config_example?: string
  created_at: string
  updated_at: string
  author: string
  logo_url?: string
}

export interface IntegrationFilters {
  integration_type?: IntegrationType
  supplier?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
} 