import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useSuppliers, Supplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../lib/queries/suppliers';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { SupplierStatus } from '@renderer/constants/enums';

export default function Suppliers() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useSuppliers(page, limit);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [formData, setFormData] = useState<{
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    status: SupplierStatus;
  }>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: SupplierStatus.ACTIVE
  });
  const [isDirty, setIsDirty] = useState(false);

  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (supplier?: Supplier) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        status: supplier.status || SupplierStatus.ACTIVE
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', status: SupplierStatus.ACTIVE });
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
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        toast.success('Supplier updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Supplier created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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
      toast.success('Supplier deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumn<Supplier>[] = [
    { header: 'Supplier Name', accessorKey: 'name' },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Status',
      cell: (item) => {
        const isActive = item.status === SupplierStatus.ACTIVE;
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Suppliers</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
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

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Supplier Name <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={e => { setFormData({ ...formData, name: e.target.value }); setIsDirty(true); }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Contact Person</label>
              <input
                type="text"
                className="input-field"
                value={formData.contactPerson}
                onChange={e => { setFormData({ ...formData, contactPerson: e.target.value }); setIsDirty(true); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={e => { setFormData({ ...formData, email: e.target.value }); setIsDirty(true); }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone}
                onChange={e => { setFormData({ ...formData, phone: e.target.value }); setIsDirty(true); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={e => { setFormData({ ...formData, status: e.target.value as any }); setIsDirty(true); }}
              >
                <option value={SupplierStatus.ACTIVE}>{SupplierStatus.ACTIVE}</option>
                <option value={SupplierStatus.INACTIVE}>{SupplierStatus.INACTIVE}</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Create Supplier'}
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
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
