export type IntegrationType = 'Invoicing & Billing' | 'SMS & Messaging' | 'Chat & Instant Messaging' | 'Major CRMs' | 'Email Services' | 'Payment Processors' | 'other'

export interface Integration {
  id: string
  name: string
  description: string
  type: IntegrationType
  supplier: string
  created_at: string
  updated_at: string
  config: Record<string, any>
  
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