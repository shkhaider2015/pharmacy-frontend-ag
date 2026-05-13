import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useProducts, Product, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../lib/queries/products';
import { useCategories } from '../lib/queries/categories';
import { useSuppliers } from '../lib/queries/suppliers';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

export default function Products() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useProducts(page, limit);
  const { data: catData } = useCategories(1, 100);
  const { data: supData } = useSuppliers(1, 100);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    description: '',
    categoryId: [''],
    supplierId: ''
  });
  const [isDirty, setIsDirty] = useState(false);

  // Discard & Delete states
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (product?: Product & { unitPrice?: number }) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        price: product.unitPrice || 0, // Map backend unitPrice to form price
        description: product.description || '',
        categoryId: [...product.categories.map(i => i.id)],
        supplierId: product.supplier?.id || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', sku: '', price: 0, description: '', categoryId: [''], supplierId: '' });
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
        sku: formData.sku,
        price: Number(formData.price),
        description: formData.description
      };

      if (formData.categoryId) payload.categoryIds = formData.categoryId.filter(i => i);
      if (formData.supplierId) payload.supplierId = formData.supplierId;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Product created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      console.error(err);
    }
  };

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
      cell: (item) => item.categories.map(i => i.name).join(", ") || 'Uncategorized'
    },
    {
      header: 'SKU / Barcode',
      cell: (item) => <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.sku || 'N/A'}</span>
    },
    {
      header: 'Unit Price',
      cell: (item: any) => <span style={{ fontWeight: 600 }}>${item.unitPrice?.toFixed(2) || '0.00'}</span>
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

  console.log("Data ", data)

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Manage Products</h2>
        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
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

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>SKU <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.sku}
                onChange={e => { setFormData({ ...formData, sku: e.target.value }); setIsDirty(true); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input
                type="number"
                step="0.01"
                required
                className="input-field"
                value={formData.price}
                onChange={e => { setFormData({ ...formData, price: Number(e.target.value) }); setIsDirty(true); }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
              <select
                className="input-field"
                value={formData.categoryId}
                onChange={e => { setFormData({ ...formData, categoryId: formData.categoryId.includes(e.target.value) ? [...formData.categoryId.filter(id => id != e.target.value)] : [...formData.categoryId, e.target.value] }); setIsDirty(true); }}
              >
                <option value="">Select Category</option>
                {catData?.data?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{`${formData.categoryId.includes(cat.id) ? '✓' : ""} ${cat.name} `}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Supplier</label>
              <select
                className="input-field"
                value={formData.supplierId}
                onChange={e => { setFormData({ ...formData, supplierId: e.target.value }); setIsDirty(true); }}
              >
                <option value="">Select Supplier</option>
                {supData?.data?.map((sup: any) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
            <textarea
              className="input-field"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={formData.description}
              onChange={e => { setFormData({ ...formData, description: e.target.value }); setIsDirty(true); }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Go Back</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Create Product'}
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
