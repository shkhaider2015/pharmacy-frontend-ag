import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useProducts, Product } from '../lib/queries/products';

export default function Products() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useProducts(page, limit);

  const columns: TableColumn<Product>[] = [
    { 
      header: 'Product Name', 
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-dark-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={18} color="var(--accent-primary)" />
          </div>
          <span style={{ fontWeight: 500 }}>{item.name}</span>
        </div>
      )
    },
    { 
      header: 'Category', 
      cell: (item) => item.category?.name || 'Uncategorized' 
    },
    { 
      header: 'SKU / Barcode', 
      cell: (item) => <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.sku || 'N/A'}</span> 
    },
    { 
      header: 'Unit Price', 
      cell: (item) => <span style={{ fontWeight: 600 }}>${item.unitPrice?.toFixed(2) || '0.00'}</span> 
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Products</h2>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load products: {(error as Error)?.message}</div>
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
