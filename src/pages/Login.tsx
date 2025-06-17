import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('') // Only used for signup
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    if (isSignup) {
      // Sign up: create user, then insert username after login
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      setLoading(false)
      setIsSignup(false)
      setUsername('')
      setPassword('')
      setEmail('')
      setInfo(
        data.user && !data.session
          ? 'Signup successful! Please check your email to confirm your account before logging in.'
          : 'Signup successful! You can now log in.'
      )
      return
    } else {
      // Login: look up email by username, then sign in
      const { data: userProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('email, id')
        .eq('username', username)
        .single()

      if (profileLookupError || !userProfile) {
        setError('Username not found')
        setLoading(false)
        return
      }
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password,
      })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      // After successful login, ensure profile exists (for first login after signup)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', signInData.user?.id)
        .single()
      if (!existingProfile && signInData.user) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: signInData.user.id,
          username,
          email: userProfile.email,
        })
        if (insertError) {
          setError('Profile creation failed: ' + insertError.message)
          setLoading(false)
          return
        }
      }
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <input
                className="w-full px-3 py-2 border rounded"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full px-3 py-2 border rounded"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </>
          ) : (
            <input
              className="w-full px-3 py-2 border rounded"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          )}
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {info && <div className="text-green-600 mt-2">{info}</div>}
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => { setIsSignup(!isSignup); setError(null); setInfo(null); }}
            type="button"
          >
            {isSignup
              ? 'Already have an account? Login'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login 