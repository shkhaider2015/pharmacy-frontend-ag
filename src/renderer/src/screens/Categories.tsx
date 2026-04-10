import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
}

const mockData: Category[] = [
  { id: '1', name: 'Antibiotics', description: 'Medicines that destroy or slow down the growth of bacteria.' },
  { id: '2', name: 'Painkillers', description: 'Drugs used to relieve pain.' },
  { id: '3', name: 'Vitamins', description: 'Organic molecules that are an essential micronutrient.' },
];

export default function Categories() {
  const [page, setPage] = useState(1);

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

      <GenericTable 
        data={mockData} 
        columns={columns} 
        meta={{ page, limit: 10, total: 3, totalPages: 1 }}
        onPageChange={setPage}
      />
    </div>
  );
}
