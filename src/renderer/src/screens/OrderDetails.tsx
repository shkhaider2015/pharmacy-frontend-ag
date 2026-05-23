import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, OrderItem } from '../lib/queries/orders';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { OrderType } from '@renderer/constants/enums';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, error } = useOrder(id || '');

  console.log(order);
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading order details...</div>;
  }

  if (isError || !order) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
        Failed to load order details: {(error as Error)?.message || 'Order not found'}
      </div>
    );
  }

  let statusColor = 'var(--text-secondary)';
  let StatusIcon = Clock;

  switch (order.status) {
    case 'Completed':
      statusColor = 'var(--accent-success)';
      StatusIcon = CheckCircle2;
      break;
    case 'Pending':
      statusColor = 'var(--accent-warning)';
      StatusIcon = Clock;
      break;
    case 'Cancelled':
      statusColor = 'var(--accent-danger)';
      StatusIcon = XCircle;
      break;
  }

  const columns: TableColumn<OrderItem>[] = [
    {
      header: 'Product',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: 'var(--bg-dark-soft)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Package size={16} color="var(--text-muted)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product?.name || 'Unknown Product'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.product?.sku || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Quantity',
      cell: (item) => <span style={{ fontWeight: 600 }}>{item.quantity}</span>
    },
    {
      header: 'Unit Price',
      cell: (item) => <span>${item.pricePerUnit}</span>
    },
    {
      header: 'Total',
      cell: (item) => <span style={{ fontWeight: 600 }}>${(item.quantity * item.pricePerUnit)}</span>
    }
  ];

  if (order.type === OrderType.Purchase) {
    columns.push({
      header: 'Batch Number',
      cell: (item) => <span>{item.batchNumber || '-'}</span>
    });
    columns.push({
      header: 'Mfg Date',
      cell: (item) => <span>{item.manufacturingDate ? new Date(item.manufacturingDate).toLocaleDateString() : '-'}</span>
    });
    columns.push({
      header: 'Expiry Date',
      cell: (item) => <span>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</span>
    });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/orders')}
            style={{ padding: '0.5rem', borderRadius: '50%' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              Order {order.id.slice(0, 8).toUpperCase()}...
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--bg-dark-soft)',
                borderRadius: '4px',
                color: 'var(--text-secondary)'
              }}>
                {order.type}
              </span>
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Created on {new Date(order.createdAt || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Amount</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            ${order.totalAmount || '0.00'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <StatusIcon size={16} color={statusColor} />
            <span style={{ color: statusColor, fontWeight: 500, fontSize: '0.875rem' }}>{order.status}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Order Items ({order.items.length})</h3>
        <GenericTable
          data={order.items || []}
          columns={columns}
          isLoading={false}
        />
      </div>
    </div>
  );
}
