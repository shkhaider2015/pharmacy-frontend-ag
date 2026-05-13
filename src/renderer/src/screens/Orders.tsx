import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useOrders, Order, useCreateOrder, useUpdateOrder, useDeleteOrder } from '../lib/queries/orders';
import { useProducts } from '../lib/queries/products';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { OrderStatus, OrderType } from '@renderer/constants/enums';

export default function Orders() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useOrders(page, limit);
  const { data: prodData } = useProducts(1, 100);

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [formData, setFormData] = useState({
    type: OrderType.Sales,
    items: [{ productId: '', quantity: 1, pricePerUnit: 0 }]
  });
  const [isDirty, setIsDirty] = useState(false);

  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (order?: Order) => {
    if (order) {
      setEditingId(order.id);
      setFormData({
        type: OrderType.Sales, // Or fetch from order if available
        items: [{ productId: '', quantity: 1, pricePerUnit: 0 }] // Simplifying item edit to prevent extreme complexity without real data
      });
    } else {
      setEditingId(null);
      setFormData({ type: OrderType.Sales, items: [{ productId: '', quantity: 1, pricePerUnit: 0 }] });
    }
    setIsDirty(false);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      setIsFormOpen(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, pricePerUnit: 0 }]
    });
    setIsDirty(true);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems: any[] = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
    setIsDirty(true);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setIsDirty(true);
  };

  const selectItem = (id: string, index: number) => {
    if (!prodData) return;
    const item = prodData.data.find((item) => item.id === id);
    if (item) {
      const newItems: any[] = [...formData.items];
      newItems[index].productId = item.id;
      newItems[index].pricePerUnit = item.price;
      setFormData({ ...formData, items: newItems });
      setIsDirty(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        type: formData.type,
        items: formData.items.map(i => ({
          ...i,
          quantity: Number(i.quantity),
          pricePerUnit: Number(i.pricePerUnit)
        }))
      };

      console.log(payload);

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success('Order updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Order created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsFormOpen(false);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    }
  };

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
    try {
      await updateMutation.mutateAsync({ id, data: { status: status } });
      toast.success('Order status updated successfully');
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
        let color, Icon, label;
        switch (item.status) {
          case 'Completed':
            color = 'var(--accent-success)';
            Icon = CheckCircle2;
            label = 'Completed';
            break;
          case 'Pending':
            color = 'var(--accent-warning)';
            Icon = Clock;
            label = 'Pending';
            break;
          case 'Cancelled':
            color = 'var(--accent-danger)';
            Icon = XCircle;
            label = 'Cancelled';
            break;
          default:
            color = 'var(--text-secondary)';
            Icon = Clock;
            label = 'Unknown';
        }
        // make it select for status
        const statusOptions = Object.values(OrderStatus).map((status) => ({
          value: status,
          label: status,
        }));
        const StatusSelect = () => {
          return (
            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value as OrderStatus)}
              style={{ color, cursor: 'pointer', backgroundColor: 'var(--bg-card)', padding: '0.5rem', border: 'none', outline: 'none' }}
            >
              {statusOptions.map((option) => {
                return <option key={option.value} value={option.value} style={{ color: 'var(--text-primary)' }}>
                  {option.label}
                </option>
              })}
            </select>
          );
        };
        return <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon size={16} color={color} />
            <StatusSelect />
          </div>
        </>;
      }
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.5rem' }}
            onClick={() => handleOpenForm(item)}
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}
            onClick={() => {
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

  console.log(data);
  console.log("prod data ", prodData);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Manage Orders</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
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

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Order' : 'New Order'}
        maxWidth="800px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Order Type</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={e => { setFormData({ ...formData, type: e.target.value as OrderType }); setIsDirty(true); }}
              >
                <option value={OrderType.Sales}>Outbound (Stock Out)</option>
                <option value={OrderType.Purchase}>Inbound (Stock In)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Order Items</label>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={addItem}>
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 2 }}>
                  <select
                    required
                    className="input-field"
                    value={item.productId}
                    onChange={e => selectItem(e.target.value, index)}
                  >
                    <option value="">Select Product...</option>
                    {prodData?.data?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Qty"
                    className="input-field"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="Price"
                    className="input-field"
                    value={item.pricePerUnit}
                    onChange={e => updateItem(index, 'pricePerUnit', e.target.value)}
                  />
                </div>
                {formData.items.length > 1 && (
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--accent-danger)' }} onClick={() => removeItem(index)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 2 }}>

              </div>
              <div style={{ flex: 1, padding: '0.625rem 1rem' }}>
                {formData.items.filter((item: any) => item.productId).length > 0 && "Total:"}
              </div>
              <div style={{ flex: 1 }}>
                {/* Total Price */}
                {
                  formData.items.filter((item: any) => item.productId).length > 0 && (
                    <input
                      type="number"
                      required={false}
                      step="0.01"
                      placeholder="Price"
                      className="input-field"
                      value={formData.items.reduce((acc, item) => acc + (item.pricePerUnit * item.quantity), 0).toFixed(2)}
                      disabled
                    />
                  )
                }
              </div>
              {
                formData.items.length > 1 && (
                  <div style={{ width: 'calc(0.5rem + 22px)' }} ></div>
                )
              }
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending || formData.items.length === 0}>
              {editingId ? 'Save Changes' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        title="Discard Changes"
        message="Are you sure you want to discard changes? Your unsaved data will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setIsDirty(false);
          setIsFormOpen(false);
        }}
      />

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
