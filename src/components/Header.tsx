import React from 'react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  username?: string | null
  onLogout?: () => void
  isLoggedIn: boolean
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, isLoggedIn }) => (
  <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
    <span className="font-bold text-lg">Integrations App</span>
    <nav className="space-x-4 flex items-center">
      <Link to="/" className="hover:underline">Home</Link>
      {!isLoggedIn && <Link to="/login" className="hover:underline">Login</Link>}
      {isLoggedIn && (
        <>
          {username && <span className="ml-2">Hello, {username}!</span>}
          <button
            className="ml-4 bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
            onClick={onLogout}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  </header>
)

export default Header 