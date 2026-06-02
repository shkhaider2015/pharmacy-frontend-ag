import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Trash2, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { useOrders, Order, useDeleteOrder, useMarkAsCompleted, useMarkAsCancelled } from '../lib/queries/orders';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { OrderStatus, Role, OrderType } from '@renderer/constants/enums';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@renderer/store/authStore';

export default function Orders() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10;
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | OrderType>('all');

  const userRole = useAuthStore(state => state.user?.role);
  const { data, isLoading, isError, error } = useOrders(
    page,
    limit,
    filterType === 'all' ? undefined : filterType
  );

  const handleFilterChange = (type: 'all' | OrderType) => {
    setFilterType(type);
    setPage(1);
  };

  const deleteMutation = useDeleteOrder();
  const markAsCompletedMutation = useMarkAsCompleted();
  const markAsCancelledMutation = useMarkAsCancelled();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Completed:
        await handleComplete(id);
        break;
      case OrderStatus.Cancelled:
        await handleCancel(id);
        break;
      default:
        toast.error('Invalid order status');
        break;
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await markAsCompletedMutation.mutateAsync(id);
      toast.success('Order marked as completed successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await markAsCancelledMutation.mutateAsync(id);
      toast.success('Order marked as cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumn<Order>[] = [
    {
      header: 'Order #',
      cell: (item) => <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.id.slice(0, 8) + "..."}</span>
    },
    {
      header: 'Order Type',
      cell: (item) => <span style={{ fontWeight: 600 }} >{item.type}</span>
    },
    {
      header: 'Date',
      cell: (item) => new Date(item?.createdAt || 0).toLocaleDateString()
    },
    {
      header: 'Total Item',
      cell: (item) => <span style={{ fontWeight: 600 }}>{item.items.length}</span>
    },
    {
      header: 'Total Amount',
      cell: (item) => <span style={{ fontWeight: 600 }}>${item.totalAmount || '0.00'}</span>
    },
    {
      header: 'Status',
      cell: (item) => {
        let color, Icon;
        switch (item.status) {
          case 'Completed':
            color = 'var(--accent-success)';
            Icon = CheckCircle2;
            break;
          case 'Pending':
            color = 'var(--accent-warning)';
            Icon = Clock;
            break;
          case 'Cancelled':
            color = 'var(--accent-danger)';
            Icon = XCircle;
            break;
          default:
            color = 'var(--text-secondary)';
            Icon = Clock;
        }

        const statusOptions = Object.values(OrderStatus).map((status) => ({
          value: status,
          label: status,
        }));

        const StatusSelect = () => {
          return (
            <select
              value={item.status}
              onChange={(e) => {
                e.stopPropagation();
                updateStatus(item.id, e.target.value as OrderStatus);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ color, cursor: 'pointer', backgroundColor: 'var(--bg-card)', padding: '0.5rem', border: 'none', outline: 'none' }}
              disabled={item.status !== OrderStatus.Pending} // Usually only Pending orders can change status
            >
              {statusOptions.map((option) => {
                return <option key={option.value} value={option.value} style={{ color: 'var(--text-primary)' }}>
                  {option.label}
                </option>
              })}
            </select>
          );
        };

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon size={16} color={color} />
            <StatusSelect />
          </div>
        );
      }
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}
            onClick={(e) => {
              e.stopPropagation();
              setDeletingId(item.id);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const filteredOrders = (data?.data || []).filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      order.id?.toLowerCase().includes(query) ||
      order.type?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Manage Orders</h2>
          <div className="segment-control">
            <button
              className={`segment-item ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`segment-item ${filterType === OrderType.Sales ? 'active' : ''}`}
              onClick={() => handleFilterChange(OrderType.Sales)}
            >
              Sales
            </button>
            <button
              className={`segment-item ${filterType === OrderType.Purchase ? 'active' : ''}`}
              onClick={() => handleFilterChange(OrderType.Purchase)}
            >
              Purchase
            </button>
          </div>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="input-field"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-dark-soft)' }}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/orders/new-sale')}>
            <Plus size={18} />
            New Sale
          </button>
          {
            (userRole === Role.Manager || userRole === Role.Admin) && (
              <button className="btn btn-primary" onClick={() => navigate('/orders/new-purchase')}>
                <Plus size={18} />
                New Purchase
              </button>
            )
          }
        </div>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load orders: {(error as Error)?.message}</div>
      ) : (
        <GenericTable
          data={filteredOrders}
          columns={columns}
          meta={data?.meta || { page, limit, total: 0, totalPages: 1 }}
          onPageChange={setPage}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/orders/${item.id}`)}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
