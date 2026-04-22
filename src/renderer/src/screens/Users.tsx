import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useUsers, User } from '../lib/queries/users';

export default function Users() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useUsers(page, limit);

  const columns: TableColumn<User>[] = [
    { 
      header: 'Name', 
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={18} color="var(--text-secondary)" />
          </div>
          <span style={{ fontWeight: 500 }}>{item.name}</span>
        </div>
      )
    },
    { header: 'Email', accessorKey: 'email' },
    { 
      header: 'Role', 
      cell: (item) => {
        const isAdmin = item.role === 'Admin';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: isAdmin ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            {isAdmin && <Shield size={14} />}
            <span style={{ fontSize: '0.875rem', fontWeight: isAdmin ? 600 : 400 }}>{item.role}</span>
          </div>
        );
      } 
    },
    { 
      header: 'Status', 
      cell: (item) => {
        const isActive = item.status === 'active';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: isActive ? 'var(--accent-success)' : 'var(--text-muted)' }}>
            {isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        );
      } 
    },
    { 
      header: 'Actions', 
      cell: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><Edit2 size={16} /></button>
          <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}><Trash2 size={16} /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Manage Users</h2>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load users: {(error as Error)?.message}</div>
      ) : (
        <GenericTable 
          data={data?.data || []} 
          columns={columns} 
          meta={data?.meta || { page, limit, total: 0, totalPages: 1 }}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
