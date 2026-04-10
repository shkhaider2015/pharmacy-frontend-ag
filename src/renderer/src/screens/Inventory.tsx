import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface InventoryItem {
  id: string;
  productName: string;
  batchNumber: string;
  stock: number;
  expiryDate: string;
  status: 'good' | 'near-expiry' | 'expired';
}

const mockData: InventoryItem[] = [
  { id: '1', productName: 'Paracetamol 500mg', batchNumber: 'B202301', stock: 500, expiryDate: '2025-12-01', status: 'good' },
  { id: '2', productName: 'Amoxicillin 250mg', batchNumber: 'B202209', stock: 120, expiryDate: '2024-05-15', status: 'near-expiry' },
  { id: '3', productName: 'Ibuprofen 400mg', batchNumber: 'B202111', stock: 45, expiryDate: '2023-11-20', status: 'expired' },
];

export default function Inventory() {
  const [page, setPage] = useState(1);

  const columns: TableColumn<InventoryItem>[] = [
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Batch', accessorKey: 'batchNumber' },
    { header: 'Stock', accessorKey: 'stock' },
    { header: 'Expiry Date', accessorKey: 'expiryDate' },
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
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Inventory Status (FEFO)</h2>
      </div>

      <GenericTable 
        data={mockData} 
        columns={columns} 
        meta={{ page, limit: 10, total: 3, totalPages: 1 }}
        onPageChange={setPage}
      />
    </div>
  );
}
