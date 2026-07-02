import { useParams, useNavigate } from 'react-router-dom'
import { User as UserIcon, Shield, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { useUser } from '../lib/queries/users'

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: user, isLoading, isError, error } = useUser(id || '')

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading user details...</div>
  }

  if (isError || !user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
        Failed to load user: {(error as Error)?.message || 'User not found'}
      </div>
    )
  }

  const isAdmin = user.role === 'Admin'
  const isActive = user.status === 'active'

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        className="btn btn-ghost" 
        onClick={() => navigate('/users')} 
        style={{ marginBottom: '1.5rem', padding: '0.5rem' }}
      >
        <ArrowLeft size={18} /> Back to Users
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-dark-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={40} color="var(--text-secondary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{user.name}</h2>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: isAdmin ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
              {isAdmin && <Shield size={18} />}
              {user.role}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: isActive ? 'var(--accent-success)' : 'var(--text-muted)' }}>
              {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Account Created</label>
            <div style={{ fontSize: '1.125rem' }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>User ID</label>
            <div style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              {user.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
