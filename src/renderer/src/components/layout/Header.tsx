import { Bell, Search, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) 
    : 'Dashboard';

  return (
    <header className="glass-panel" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1rem 1.5rem', 
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: '0',
      zIndex: 10
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{title}</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Overview of your {title.toLowerCase()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="input-field"
            style={{ paddingLeft: '2.5rem', width: '250px', background: 'var(--bg-dark-soft)' }}
          />
        </div>

        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <Bell size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'Admin User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || 'Administrator'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
