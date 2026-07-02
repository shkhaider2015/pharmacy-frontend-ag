import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, Mail, Save } from 'lucide-react'
import { useProfile, useUpdateProfile, useChangePassword, useRequestEmailChange } from '../lib/queries/users'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const { data: profile, isLoading } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const requestEmailChangeMutation = useRequestEmailChange()
  const updateUser = useAuthStore((state) => state.setUser)

  const [activeTab, setActiveTab] = useState<'basic' | 'password' | 'email'>('basic')

  // Basic Info Form
  const [name, setName] = useState('')
  // Password Form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Email Form
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    if (profile) {
      console.log(profile)
      setName(profile.name || '')
    }
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await updateProfileMutation.mutateAsync({ name })
      toast.success('Profile updated successfully')
      if (res) {
        updateUser(res)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await changePasswordMutation.mutateAsync({ oldPassword, newPassword })
      toast.success('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) return
    try {
      await requestEmailChangeMutation.mutateAsync({ newEmail })
      toast.success('Email change request submitted to admin')
      setNewEmail('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request email change')
    }
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Profile Settings</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'basic' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('basic')}
        >
          <UserIcon size={18} /> Basic Info
        </button>
        <button
          className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={18} /> Change Password
        </button>
        {
          profile?.role !== 'Admin' && (
            <button
              className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={18} /> Change Email
            </button>
          )
        }
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {activeTab === 'basic' && (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Basic Information</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Current Email</label>
              <input
                type="email"
                disabled
                className="input-field"
                value={profile?.email || ''}
                style={{ maxWidth: '400px', opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                Email can only be changed via the Change Email tab.
              </span>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isPending}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Change Password</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Old Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>New Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Confirm New Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={changePasswordMutation.isPending}>
                <Lock size={18} /> Update Password
              </button>
            </div>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={handleRequestEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Request Email Change</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Changing your email address requires admin approval. Once approved, your login email will be updated.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>New Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={requestEmailChangeMutation.isPending}>
                <Mail size={18} /> Request Change
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
