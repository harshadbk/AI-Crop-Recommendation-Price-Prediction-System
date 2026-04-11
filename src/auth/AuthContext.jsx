import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const USERS_KEY = 'cropAi:users'
const SESSION_KEY = 'cropAi:session'

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function readUsers() {
  return safeJsonParse(localStorage.getItem(USERS_KEY), {})
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession() {
  return safeJsonParse(localStorage.getItem(SESSION_KEY), null)
}

function writeSession(session) {
  if (!session) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession()?.user || null)

  useEffect(() => {
    function onStorage(e) {
      if (e.key === SESSION_KEY) setUser(readSession()?.user || null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  async function signup({ name, email, password }) {
    const cleanName = String(name || '').trim()
    const cleanEmail = normalizeEmail(email)
    const cleanPassword = String(password || '')

    if (!cleanName) throw new Error('Please enter your name.')
    if (!cleanEmail) throw new Error('Please enter your email.')
    if (cleanPassword.length < 6) throw new Error('Password must be at least 6 characters.')

    const users = readUsers()
    if (users[cleanEmail]) throw new Error('Account already exists. Please login.')

    users[cleanEmail] = { name: cleanName, email: cleanEmail, password: cleanPassword }
    writeUsers(users)

    const session = { user: { name: cleanName, email: cleanEmail }, createdAt: new Date().toISOString() }
    writeSession(session)
    setUser(session.user)

    return session.user
  }

  async function login({ email, password }) {
    const cleanEmail = normalizeEmail(email)
    const cleanPassword = String(password || '')

    if (!cleanEmail) throw new Error('Please enter your email.')
    if (!cleanPassword) throw new Error('Please enter your password.')

    const users = readUsers()
    const record = users[cleanEmail]
    if (!record) throw new Error('Account not found. Please sign up first.')
    if (record.password !== cleanPassword) throw new Error('Incorrect password.')

    const session = { user: { name: record.name, email: cleanEmail }, createdAt: new Date().toISOString() }
    writeSession(session)
    setUser(session.user)

    return session.user
  }

  function logout() {
    writeSession(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, isLoggedIn: Boolean(user), login, signup, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

