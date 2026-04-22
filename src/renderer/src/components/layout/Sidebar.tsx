import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Users, 
  PackageSearch, 
  Tags, 
  Truck, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inventory', icon: PackageSearch, path: '/inventory' },
    { name: 'Products', icon: ShoppingBag, path: '/products' },
    { name: 'Categories', icon: Tags, path: '/categories' },
    { name: 'Suppliers', icon: Truck, path: '/suppliers' },
    { name: 'Orders', icon: ShoppingBag, path: '/orders' },
    { name: 'Users', icon: Users, path: '/users' },
  ];

  return (
    <aside className="glass-panel" style={{ 
      width: '260px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRight: '1px solid var(--border-light)',
      borderRadius: '0', /* override glass-panel radius for sidebar */
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none'
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>P</span>
          </div>
          PharmaDB
        </h2>
      </div>

      <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--bg-glass-hover)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              transition: 'all var(--transition-fast)'
            })}
          >
            <item.icon size={20} style={{ color: 'inherit' }} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
        <button onClick={handleSignOut} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-danger)' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
