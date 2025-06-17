import React from 'react'

type IntegrationCardProps = {
  name: string
  description: string
  config?: string
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, description, config }) => (
  <div className="bg-white rounded shadow p-4 mb-4">
    <h2 className="text-xl font-semibold mb-2">{name}</h2>
    <p className="mb-2 text-gray-700">{description}</p>
    {config && <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{config}</pre>}
  </div>
)

export default IntegrationCard 