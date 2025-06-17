import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => (
  <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
    <span className="font-bold text-lg">Integrations App</span>
    <nav className="space-x-4">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/create" className="hover:underline">Create</Link>
      <Link to="/login" className="hover:underline">Login</Link>
    </nav>
  </header>
)

export default Header 