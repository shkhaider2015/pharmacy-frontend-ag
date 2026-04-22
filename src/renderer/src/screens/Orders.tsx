import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useOrders, Order } from '../lib/queries/orders';

export default function Orders() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useOrders(page, limit);

  const columns: TableColumn<Order>[] = [
    { 
      header: 'Order #', 
      cell: (item) => <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.orderNumber}</span> 
    },
    { 
      header: 'Date', 
      cell: (item) => new Date(item.date).toLocaleDateString() 
    },
    { 
      header: 'Total Amount', 
      cell: (item) => <span style={{ fontWeight: 600 }}>${item.totalAmount?.toFixed(2) || '0.00'}</span> 
    },
    { 
      header: 'Status', 
      cell: (item) => {
        let color, Icon, label;
        switch (item.status) {
          case 'completed':
            color = 'var(--accent-success)';
            Icon = CheckCircle2;
            label = 'Completed';
            break;
          case 'pending':
            color = 'var(--accent-warning)';
            Icon = Clock;
            label = 'Pending';
            break;
          case 'cancelled':
            color = 'var(--accent-danger)';
            Icon = XCircle;
            label = 'Cancelled';
            break;
          default:
            color = 'var(--text-secondary)';
            Icon = Clock;
            label = 'Unknown';
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color }}>
            <Icon size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Orders</h2>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Order
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load orders: {(error as Error)?.message}</div>
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
