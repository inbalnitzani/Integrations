import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import IntegrationsList from './pages/IntegrationsList'
import CreateIntegration from './pages/CreateIntegration'
import { supabase } from './supabaseClient'
import type { AuthSession } from '@supabase/supabase-js'

function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setSession(session)
      if (session) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (mounted) setUsername(data?.username || null)
          })
      } else {
        setUsername(null)
      }
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUsername(data?.username || null))
      } else {
        setUsername(null)
      }
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUsername(null)
  }

  return { session, username, loading, logout }
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="p-8">Loading...</div>
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

const App: React.FC = () => {
  const { session, username, loading, logout } = useAuth()

  return (
    <Router>
      <Header username={username} onLogout={logout} isLoggedIn={!!session} />
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <IntegrationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateIntegration />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
