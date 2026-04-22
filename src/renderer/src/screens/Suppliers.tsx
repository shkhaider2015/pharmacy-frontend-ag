import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useSuppliers, Supplier } from '../lib/queries/suppliers';

export default function Suppliers() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useSuppliers(page, limit);

  const columns: TableColumn<Supplier>[] = [
    { header: 'Supplier Name', accessorKey: 'name' },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone', accessorKey: 'phone' },
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Suppliers</h2>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load suppliers: {(error as Error)?.message}</div>
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
