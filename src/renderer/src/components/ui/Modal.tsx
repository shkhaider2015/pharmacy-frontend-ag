import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 50,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-slide-up"
        style={{ 
          width: '100%', 
          maxWidth, 
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          zIndex: 51
        }}
        onClick={e => e.stopPropagation()} // prevent clicks from closing modal
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
          <button 
            className="btn btn-ghost" 
            style={{ padding: '0.25rem' }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
