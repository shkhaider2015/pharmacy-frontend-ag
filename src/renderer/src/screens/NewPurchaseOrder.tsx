import { useState } from 'react'
import { useCreateOrder, useMarkAsCompleted } from '../lib/queries/orders'
import { useProducts } from '../lib/queries/products'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { OrderType } from '@renderer/constants/enums'
import { Trash2, Plus, ArrowLeft } from 'lucide-react'

export default function NewPurchaseOrder() {
  const navigate = useNavigate()
  const { data: prodData } = useProducts(1, 100)
  const createMutation = useCreateOrder()
  const markAsCompletedMutation = useMarkAsCompleted()

  const [items, setItems] = useState([{ productId: '', quantity: 1, pricePerUnit: 0, manufacturingDate: '', expiryDate: '', batchNumber: '' }])

  const addItem = () => {
    setItems([{ productId: '', quantity: 1, pricePerUnit: 0, manufacturingDate: '', expiryDate: '', batchNumber: '' }, ...items])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems: any[] = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const selectItem = (id: string, index: number) => {
    if (!prodData) return
    const item = prodData.data.find((item) => item.id === id)
    if (item) {
      const newItems: any[] = [...items]
      newItems[index].productId = item.id
      newItems[index].pricePerUnit = item.price
      setItems(newItems)
    }
  }

  const totalPrice = items.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0)
  const isSubmitDisabled = items.length === 0 || !items.every((i) => i.productId && i.quantity > 0 && i.pricePerUnit >= 0 && i.manufacturingDate && i.expiryDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log(items)
      const payload: any = {
        type: OrderType.Purchase,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          pricePerUnit: Number(i.pricePerUnit),
          manufacturingDate: i.manufacturingDate ? new Date(i.manufacturingDate).toISOString() : undefined,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : undefined,
          batchNumber: i.batchNumber
        }))
      }

      const createdOrder = await createMutation.mutateAsync(payload)
      await markAsCompletedMutation.mutateAsync(createdOrder.id)

      toast.success('Purchase Order completed successfully')
      setItems([{ productId: '', quantity: 1, pricePerUnit: 0, manufacturingDate: '', expiryDate: '', batchNumber: '' }])
    } catch (err) {
      console.error(err)
      toast.error('Failed to complete purchase order')
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Fixed Top Section */}
      <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => navigate('/orders')}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem' }}>New Purchase Order</h2>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Total: ${totalPrice.toFixed(2)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={addItem}>
            <Plus size={18} /> Add Item
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={createMutation.isPending || markAsCompletedMutation.isPending || isSubmitDisabled}>
            {createMutation.isPending || markAsCompletedMutation.isPending ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </div>

      {/* Scrollable Items Section */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '1rem', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Product</label>
                <select required className="input-field" value={item.productId} onChange={(e) => selectItem(e.target.value, index)}>
                  <option value="">Select Product...</option>
                  {prodData?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Quantity</label>
                <input type="number" required min="1" placeholder="Qty" className="input-field" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Unit Price</label>
                <input type="number" required step="0.01" placeholder="Price" className="input-field" value={item.pricePerUnit} onChange={(e) => updateItem(index, 'pricePerUnit', e.target.value)} />
              </div>

              {items.length > 1 && (
                <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--accent-danger)', marginTop: '1.25rem' }} onClick={() => removeItem(index)}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Mfg Date</label>
                <input type="date" required className="input-field" value={item.manufacturingDate} onChange={(e) => updateItem(index, 'manufacturingDate', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Expiry Date</label>
                <input type="date" required className="input-field" value={item.expiryDate} onChange={(e) => updateItem(index, 'expiryDate', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Batch Number</label>
                <input type="text" required className="input-field" value={item.batchNumber} onChange={(e) => updateItem(index, 'batchNumber', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Subtotal</label>
                <div style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>${(item.quantity * item.pricePerUnit).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No items added. Click "Add Item" to begin.</div>}
      </div>
    </div>
  )
}
