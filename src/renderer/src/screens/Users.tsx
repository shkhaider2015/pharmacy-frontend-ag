import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useUsers, User, useCreateUser, useUpdateUser, useDeleteUser } from '../lib/queries/users';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

export default function Users() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useUsers(page, limit);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'active'
  });
  const [isDirty, setIsDirty] = useState(false);

  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      // Try to split name for editing if the backend only gives "name"
      const parts = (user.name || '').split(' ');
      setFormData({
        name: parts[0] || '',
        email: user.email || '',
        password: '', // default empty on edit
        role: user.role || 'Staff',
        status: user.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role: 'Staff', status: 'active' });
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
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      if (formData.password) payload.password = formData.password;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success('User updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('User created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumn<User>[] = [
    {
      header: 'Name',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={18} color="var(--text-secondary)" />
          </div>
          <span style={{ fontWeight: 500 }}>{item.name || ''}</span>
        </div>
      )
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Role',
      cell: (item) => {
        const isAdmin = item.role === 'Admin';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: isAdmin ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            {isAdmin && <Shield size={14} />}
            <span style={{ fontSize: '0.875rem', fontWeight: isAdmin ? 600 : 400 }}>{item.role}</span>
          </div>
        );
      }
    },
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Users</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          <Plus size={18} />
          Add User
        </button>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load users: {(error as Error)?.message}</div>
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
        title={editingId ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={e => { setFormData({ ...formData, name: e.target.value }); setIsDirty(true); }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={e => { setFormData({ ...formData, email: e.target.value }); setIsDirty(true); }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Password {editingId && <span style={{ color: 'var(--text-muted)' }}>(leave blank to keep current)</span>}
              {!editingId && <span style={{ color: 'var(--accent-danger)' }}>*</span>}
            </label>
            <input
              type="password"
              required={!editingId}
              className="input-field"
              value={formData.password}
              onChange={e => { setFormData({ ...formData, password: e.target.value }); setIsDirty(true); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
              <select
                className="input-field"
                value={formData.role}
                onChange={e => { setFormData({ ...formData, role: e.target.value }); setIsDirty(true); }}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={e => { setFormData({ ...formData, status: e.target.value }); setIsDirty(true); }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Create User'}
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
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
