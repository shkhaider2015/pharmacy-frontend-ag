import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export default function GenericTable<T>({ 
  data, 
  columns, 
  meta, 
  onPageChange,
  isLoading 
}: GenericTableProps<T>) {
  
  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-dark-soft)' }}>
              {columns.map((col, index) => (
                <th key={index} style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  style={{ 
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem', 
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-dark-soft)'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '0.25rem' }}
              disabled={meta.page <= 1}
              onClick={() => onPageChange && onPageChange(meta.page - 1)}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0 0.5rem' }}>
              Page {meta.page} of {meta.totalPages}
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '0.25rem' }}
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange && onPageChange(meta.page + 1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
