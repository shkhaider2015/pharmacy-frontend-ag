import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useInventory, InventoryItem, useCreateInventoryBatch, useUpdateInventoryBatch, useDeleteInventoryBatch } from '../lib/queries/inventory';
import { useProducts } from '../lib/queries/products';
import { useSuppliers } from '../lib/queries/suppliers';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

export default function Inventory() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useInventory(page, limit);
  const { data: prodData } = useProducts(1, 100);
  const { data: supData } = useSuppliers(1, 100);

  const createMutation = useCreateInventoryBatch();
  const updateMutation = useUpdateInventoryBatch();
  const deleteMutation = useDeleteInventoryBatch();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Data states
  const [formData, setFormData] = useState({ 
    productId: '', 
    quantity: 0, 
    manufacturingDate: '', 
    expiryDate: '',
    batchNumber: '',
    supplierId: ''
  });
  const [isDirty, setIsDirty] = useState(false);
  
  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (item?: InventoryItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        productId: item.product?.id || '', 
        quantity: item.stock || 0, 
        manufacturingDate: '', 
        expiryDate: item.expiryDate?.split('T')[0] || '',
        batchNumber: item.batchNumber || '',
        supplierId: ''
      });
    } else {
      setEditingId(null);
      setFormData({ productId: '', quantity: 0, manufacturingDate: '', expiryDate: '', batchNumber: '', supplierId: '' });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        manufacturingDate: formData.manufacturingDate ? new Date(formData.manufacturingDate).toISOString() : new Date().toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : new Date().toISOString()
      };
      if (formData.batchNumber) payload.batchNumber = formData.batchNumber;
      if (formData.supplierId) payload.supplierId = formData.supplierId;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success('Inventory batch updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Inventory batch created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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
      toast.success('Inventory batch deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumn<InventoryItem>[] = [
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Batch', accessorKey: 'batchNumber' },
    { header: 'Stock', accessorKey: 'stock' },
    { 
      header: 'Expiry Date', 
      cell: (item) => item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A' 
    },
    {
      header: 'Status',
      cell: (item) => {
        let color = 'var(--text-secondary)';
        let Icon = CheckCircle2;
        let label = 'Good';

        if (item.status === 'expired') {
          color = 'var(--accent-danger)';
          Icon = AlertCircle;
          label = 'Expired';
        } else if (item.status === 'near-expiry') {
          color = 'var(--accent-warning)';
          Icon = Clock;
          label = 'Expiring Soon';
        } else {
          color = 'var(--accent-success)';
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color, fontWeight: 500 }}>
            <Icon size={16} />
            {label}
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Inventory Status (FEFO)</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          <Plus size={18} />
          Add Batch
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load inventory: {(error as Error)?.message}</div>
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
        title={editingId ? 'Edit Inventory Batch' : 'Add Inventory Batch'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <select 
                required
                className="input-field" 
                value={formData.productId}
                onChange={e => { setFormData({ ...formData, productId: e.target.value }); setIsDirty(true); }}
              >
                <option value="">Select Product...</option>
                {prodData?.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input 
                type="number" 
                required
                className="input-field" 
                value={formData.quantity}
                onChange={e => { setFormData({ ...formData, quantity: Number(e.target.value) }); setIsDirty(true); }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Batch Number</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.batchNumber}
                onChange={e => { setFormData({ ...formData, batchNumber: e.target.value }); setIsDirty(true); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Supplier</label>
              <select 
                className="input-field" 
                value={formData.supplierId}
                onChange={e => { setFormData({ ...formData, supplierId: e.target.value }); setIsDirty(true); }}
              >
                <option value="">Select Supplier...</option>
                {supData?.data?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Manufacturing Date <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input 
                type="date" 
                required
                className="input-field" 
                value={formData.manufacturingDate}
                onChange={e => { setFormData({ ...formData, manufacturingDate: e.target.value }); setIsDirty(true); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Expiry Date <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input 
                type="date" 
                required
                className="input-field" 
                value={formData.expiryDate}
                onChange={e => { setFormData({ ...formData, expiryDate: e.target.value }); setIsDirty(true); }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Create Batch'}
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
        title="Delete Inventory Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
