import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { FarmProfileForm, emptyFarm, farmToProfile, validateFarm } from '../components/FarmProfileForm.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

/** Edit the farm profile. Changes immediately refresh every personalised report. */
export function ProfilePage() {
  const nav = useNavigate()
  const { user, isLoggedIn, updateProfile } = useAuth()
  const [farm, setFarm] = useState(() => emptyFarm(user))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ next: '/profile' }} />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const problem = validateFarm(farm)
    if (problem) return setError(problem)
    setSaving(true)
    try {
      await updateProfile(farmToProfile(farm))
      nav('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {saving ? <SpinnerOverlay label="Saving your farm profile..." /> : null}
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <Card title="My Farm Profile">
          {!user.profileComplete ? (
            <div className="error" style={{ marginBottom: 12, background: '#fffbeb', color: '#92400e', borderColor: '#fcd34d' }}>
              Complete your farm details once so all reports are made for your farm.
            </div>
          ) : null}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
            <FarmProfileForm farm={farm} onChange={setFarm} />
            {error ? <div className="error">{error}</div> : null}
            <div className="actions">
              <button className="btn btn-ghost" type="button" onClick={() => nav(-1)}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>Save profile</button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
