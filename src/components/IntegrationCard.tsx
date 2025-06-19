import React from 'react'

export type IntegrationCardProps = {
  name: string
  description: string
  config?: string
  logo_url?: string
  integration_type: string
  supplier: string
  tags: string
  api_docs_url?: string
  created_at: string
  author: string
  onClick?: () => void
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  config,
  logo_url,
  integration_type,
  supplier,
  tags,
  api_docs_url,
  created_at,
  author,
  onClick
}) => (
  <div
    className="bg-white rounded-xl shadow-lg p-5 sm:p-7 hover:shadow-2xl transition-shadow cursor-pointer border border-gray-100 flex flex-col gap-3 h-full"
    onClick={onClick}
  >
    <div className="flex items-center gap-4 mb-1">
      {logo_url && (
        <img
          src={logo_url}
          alt={`${name} logo`}
          className="w-12 h-12 object-contain rounded bg-gray-50 border"
        />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{name}</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">{integration_type}</span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">{supplier}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-sm mb-1 line-clamp-3">{description}</p>
    {tags && (
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.split(',').map(tag => (
          <span key={tag.trim()} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{tag.trim()}</span>
        ))}
      </div>
    )}
    {api_docs_url && (
      <a
        href={api_docs_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-xs mb-1"
      >
        API Documentation
      </a>
    )}
    {config && (
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-1 border border-gray-200">
        {config}
      </pre>
    )}
    <div className="flex justify-between items-center mt-auto pt-2 text-xs text-gray-500">
      <span>By {author}</span>
      <span>{new Date(created_at).toLocaleDateString()}</span>
    </div>
  </div>
)

export default IntegrationCard 