import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient, errorMessage, getToken, setToken } from '../api/client.js'
import { syncLocalHistory } from '../utils/historyStore.js'

const AuthContext = createContext(null)

function toUser(profile, authUser) {
  return {
    id: profile?.id || authUser?.id,
    email: profile?.email || authUser?.email,
    name: profile?.full_name || authUser?.user_metadata?.full_name || 'User',
    stateName: profile?.state_name || '',
    districtName: profile?.district_name || '',
    talukaName: profile?.taluka_name || '',
    soilType: profile?.soil_type || '',
    farmSizeAcres: profile?.farm_size_acres ?? null,
    mainCrops: profile?.main_crops || [],
    preferredLanguage: profile?.preferred_language || '',
    waterSource: profile?.water_source || '',
    irrigationType: profile?.irrigation_type || '',
    budget: profile?.budget ?? null,
    soilN: profile?.soil_n ?? null,
    soilP: profile?.soil_p ?? null,
    soilK: profile?.soil_k ?? null,
    soilPh: profile?.soil_ph ?? null,
    profileComplete: Boolean(profile?.profile_complete),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const startSession = useCallback((result) => {
    setToken(result?.session?.access_token || '')
    const next = toUser(result?.profile, result?.user)
    setUser(next)
    // Upload results saved in this browser before login (ignored if DB is offline).
    syncLocalHistory().catch(() => {})
    return next
  }, [])

  // Restore the session on page load by validating the saved token.
  useEffect(() => {
    let active = true
    if (!getToken()) {
      setLoading(false)
      return undefined
    }
    apiClient
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(toUser(data.profile, data.user))
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Token rejected by the backend (expired / password changed elsewhere).
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('cropAi:logout', onLogout)
    return () => window.removeEventListener('cropAi:logout', onLogout)
  }, [])

  const signup = useCallback(
    async ({ name, email, password, stateName, districtName, ...extra }) => {
      try {
        const { data } = await apiClient.post('/auth/signup', {
          name,
          email,
          password,
          state_name: stateName || '',
          district_name: districtName || '',
          taluka_name: extra.talukaName,
          soil_type: extra.soilType,
          farm_size_acres: extra.farmSizeAcres,
          main_crops: extra.mainCrops,
          preferred_language: extra.preferredLanguage,
          water_source: extra.waterSource,
          irrigation_type: extra.irrigationType,
          budget: extra.budget,
          soil_n: extra.soilN,
          soil_p: extra.soilP,
          soil_k: extra.soilK,
          soil_ph: extra.soilPh,
        })
        return startSession(data)
      } catch (err) {
        throw new Error(errorMessage(err, 'Signup failed'))
      }
    },
    [startSession],
  )

  const login = useCallback(
    async ({ email, password }) => {
      try {
        const { data } = await apiClient.post('/auth/login', { email, password })
        return startSession(data)
      } catch (err) {
        throw new Error(errorMessage(err, 'Login failed'))
      }
    },
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // token is dropped locally either way
    }
    setToken('')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (changes) => {
    try {
      const { data } = await apiClient.put('/auth/profile', changes)
      const next = toUser(data.profile)
      setUser(next)
      return next
    } catch (err) {
      throw new Error(errorMessage(err, 'Profile update failed'))
    }
  }, [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), loading, login, signup, logout, updateProfile }),
    [user, loading, login, signup, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
