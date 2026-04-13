import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // We still use supabase client for session management on the frontend
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    try {
      // In this setup, we still fetch profile from Supabase directly for speed,
      // but we could also create a backend endpoint for this.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) throw error

      setUser({
        id: authUser.id,
        email: authUser.email,
        name: data.full_name,
        stateName: data.state_name,
        districtName: data.district_name,
      })
    } catch (err) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || 'User',
      })
    } finally {
      setLoading(false)
    }
  }

  async function signup({ name, email, password, stateName, districtName }) {
    // Calling our NEW Python Backend Signup Route
    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        state_name: stateName,
        district_name: districtName
      })
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || 'Signup failed')

    // After backend signup, we sign in on the frontend to establish session
    await login({ email, password })
    return result.user
  }

  async function login({ email, password }) {
    // Calling our NEW Python Backend Login Route
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || 'Login failed')

    // Sign in locally with supabase to persist session in browser
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) throw authError

    return result.user
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value = useMemo(() => ({ 
    user, 
    isLoggedIn: Boolean(user), 
    loading,
    login, 
    signup, 
    logout 
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
