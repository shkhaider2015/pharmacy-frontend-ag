import { useState } from 'react';
import GenericTable, { TableColumn } from '../components/ui/GenericTable';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useInventory, InventoryItem } from '../lib/queries/inventory';

export default function Inventory() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useInventory(page, limit);

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
    </div>
  );
}
