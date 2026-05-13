import { useState, useEffect } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCategories, Category, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../lib/queries/categories';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

export default function Categories() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, isError, error } = useCategories(page, limit);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Data states
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isDirty, setIsDirty] = useState(false);
  
  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, description: category.description });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
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
        toast.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Category created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsFormOpen(false);
      setIsDirty(false);
    } catch (err) {
      // Toast displayed globally via API interceptor, or we can handle specifics here
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: TableColumn<Category>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description' },
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
        <h2 style={{ fontSize: '1.25rem' }}>Manage Categories</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
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

      <Modal 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        title={editingId ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
            <input 
              type="text" 
              required
              className="input-field" 
              value={formData.name}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value });
                setIsDirty(true);
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={formData.description}
              onChange={e => {
                setFormData({ ...formData, description: e.target.value });
                setIsDirty(true);
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Create Category'}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
