import { useState } from 'react'
import GenericTable, { TableColumn } from '../components/ui/GenericTable'
import { Mail, Check, X, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useEmailChangeRequests, useUpdateEmailChangeRequest, EmailChangeRequest } from '../lib/queries/users'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'

export default function EmailRequests() {
  const { data: requests, isLoading, isError, error } = useEmailChangeRequests()
  const updateMutation = useUpdateEmailChangeRequest()
  const queryClient = useQueryClient()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<{ id: string, status: 'approved' | 'rejected' } | null>(null)

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    setSelectedRequest({ id, status })
    setIsConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedRequest) return
    try {
      await updateMutation.mutateAsync({ id: selectedRequest.id, status: selectedRequest.status })
      toast.success(`Request ${selectedRequest.status} successfully`)
      queryClient.invalidateQueries({ queryKey: ['email-change-requests'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsConfirmOpen(false)
      setSelectedRequest(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${selectedRequest.status} request`)
    }
  }

  const columns: TableColumn<EmailChangeRequest>[] = [
    {
      header: 'User',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} color="var(--text-secondary)" />
          </div>
          <div>
            <span style={{ fontWeight: 500, display: 'block' }}>{item.user?.name || 'Unknown User'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user?.email || ''}</span>
          </div>
        </div>
      )
    },
    { header: 'New Email Request', accessorKey: 'new_email' },
    {
      header: 'Status',
      cell: (item) => {
        let Icon = Clock
        let color = 'var(--text-muted)'
        if (item.status === 'approved') {
          Icon = CheckCircle2
          color = 'var(--accent-success)'
        } else if (item.status === 'rejected') {
          Icon = XCircle
          color = 'var(--accent-danger)'
        }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color }}>
            <Icon size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{item.status}</span>
          </div>
        )
      }
    },
    {
      header: 'Date',
      cell: (item) => (
        <span style={{ fontSize: '0.875rem' }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {item.status === 'pending' ? (
            <>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.5rem', color: 'var(--accent-success)' }}
                onClick={() => handleAction(item.id, 'approved')}
                title="Approve"
              >
                <Check size={16} />
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}
                onClick={() => handleAction(item.id, 'rejected')}
                title="Reject"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Processed</span>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Email Change Requests</h2>
      </div>

      {isError ? (
        <div style={{ color: 'var(--accent-danger)' }}>Failed to load requests: {(error as Error)?.message}</div>
      ) : (
        <GenericTable 
          data={requests || []} 
          columns={columns} 
          meta={{ page: 1, limit: 100, total: requests?.length || 0, totalPages: 1 }} 
          isLoading={isLoading} 
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`${selectedRequest?.status === 'approved' ? 'Approve' : 'Reject'} Request`}
        message={`Are you sure you want to ${selectedRequest?.status === 'approved' ? 'approve' : 'reject'} this email change request?`}
        confirmLabel={selectedRequest?.status === 'approved' ? 'Approve' : 'Reject'}
        onConfirm={confirmAction}
      />
    </div>
  )
}
