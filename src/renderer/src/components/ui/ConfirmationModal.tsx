import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  type = 'danger'
}: ConfirmationModalProps) {
  
  const iconColor = type === 'danger' ? 'var(--accent-danger)' : type === 'warning' ? 'var(--accent-warning)' : 'var(--accent-primary)';
  const confirmBtnClass = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', color: iconColor }}>
          <AlertTriangle size={48} />
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-ghost" onClick={onClose}>
          {cancelLabel}
        </button>
        <button 
          className={confirmBtnClass}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
