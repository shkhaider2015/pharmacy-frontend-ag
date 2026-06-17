import { useState } from 'react'
import { useCreateOrder, useMarkAsCompleted } from '../lib/queries/orders'
import { useProducts } from '../lib/queries/products'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { OrderType } from '@renderer/constants/enums'
import { Trash2, Plus, ArrowLeft } from 'lucide-react'

let rrData = {
  id: "89e8d941-0e91-4bd7-9260-c322ef0b2a91",
  createdAt: "2026-06-13T22:42:22.657Z",
  updatedAt: "2026-06-13T22:42:22.657Z",
  deletedAt: null,
  type: "Sales",
  status: "Pending",
  totalAmount: 100,
  items: [
    {
      id: "c3c22b7e-3655-431c-acb1-78079fa8eb93",
      createdAt: "2026-06-13T22:42:22.657Z",
      updatedAt: "2026-06-13T22:42:22.657Z",
      deletedAt: null,
      product: {
        id: "53739a39-55e6-4a96-8b26-a0b24a17bd71"
      },
      quantity: 1,
      pricePerUnit: 100,
      manufacturingDate: null,
      expiryDate: null,
      batchNumber: null
    }
  ]
}

export default function NewSaleOrder() {
  const navigate = useNavigate()
  const { data: prodData } = useProducts(1, 100)
  const createMutation = useCreateOrder()
  const markAsCompletedMutation = useMarkAsCompleted()

  const [items, setItems] = useState([{ productId: '', quantity: 1, pricePerUnit: 0 }])

  const addItem = () => {
    setItems([{ productId: '', quantity: 1, pricePerUnit: 0 }, ...items])
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
  const isSubmitDisabled = items.length === 0 || !items.every((i) => i.productId && i.quantity > 0 && i.pricePerUnit >= 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        type: OrderType.Sales,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          pricePerUnit: Number(i.pricePerUnit)
        }))
      }

      const createdOrder = await createMutation.mutateAsync(payload)
      await markAsCompletedMutation.mutateAsync(createdOrder.id)
      toast.success('Sale Order completed successfully', createdOrder)
      console.log(createdOrder)
      window.electron.ipcRenderer.invoke("print-receipt", createdOrder);
      setItems([{ productId: '', quantity: 1, pricePerUnit: 0 }])
    } catch (err) {
      console.error(err)
      toast.error('Failed to complete sale order')
    }
  }

  const dummyPrint = () => {
    window.electron.ipcRenderer.invoke("print-receipt", rrData);
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
            <h2 style={{ fontSize: '1.25rem' }}>New Sale Order</h2>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Total: ${totalPrice.toFixed(2)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={addItem}>
            <Plus size={18} /> Add Item
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={createMutation.isPending || markAsCompletedMutation.isPending || isSubmitDisabled}>
            {createMutation.isPending || markAsCompletedMutation.isPending ? 'Processing...' : 'Complete Sale'}
          </button>
          <button className="btn btn-primary" onClick={dummyPrint}>Dummy Print</button>
        </div>
      </div>

      {/* Scrollable Items Section */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }}>
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
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Subtotal</label>
                <div style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>${(item.quantity * item.pricePerUnit).toFixed(2)}</div>
              </div>
            </div>
            {items.length > 1 && (
              <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--accent-danger)', marginLeft: '1rem' }} onClick={() => removeItem(index)}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No items added. Click "Add Item" to begin.</div>}
      </div>
    </div>
  )
}
