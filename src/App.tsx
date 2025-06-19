import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import IntegrationsList from './pages/IntegrationsList'
import CreateIntegration from './pages/CreateIntegration'
import { supabase } from './supabaseClient'
import type { AuthSession } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const handleSession = async (session: AuthSession | null) => {
    setSession(session)
    if (session) {
      try {
        // First check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist - create it
          const storedUsername = localStorage.getItem('pendingUsername')
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              username: storedUsername || session.user.email?.split('@')[0] // Fallback to email if no stored username
            })
          
          if (insertError) {
            console.error('Error creating profile:', insertError)
          } else {
            // After creating profile, fetch it again
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .single()
            setUsername(newProfile?.username || null)
            // Clear the stored username after successful profile creation
            localStorage.removeItem('pendingUsername')
          }
        } else if (profile) {
          setUsername(profile.username)
        }
      } catch (err) {
        console.error('Error in handleSession:', err)
      }
    } else {
      setUsername(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session", session)
      if (mounted) handleSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
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
