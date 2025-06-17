import React from 'react'

const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Login / Signup</h2>
        {/* TODO: Add login/signup form with username support */}
        <form className="space-y-4">
          <input className="w-full px-3 py-2 border rounded" placeholder="Email" />
          <input className="w-full px-3 py-2 border rounded" placeholder="Password" type="password" />
          {/* Username field for signup */}
          <input className="w-full px-3 py-2 border rounded" placeholder="Username (for signup)" />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default Login 