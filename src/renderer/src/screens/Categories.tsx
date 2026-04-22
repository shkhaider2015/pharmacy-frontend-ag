import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCategories, Category } from '../lib/queries/categories';

export default function Categories() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useCategories(page, limit);

  const columns: TableColumn<Category>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description' },
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Categories</h2>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load categories: {(error as Error)?.message}</div>
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
