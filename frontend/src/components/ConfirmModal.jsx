import { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

/**
 * ConfirmModal — replaces native window.confirm() with a styled dialog.
 *
 * Props:
 *   isOpen       {boolean}  — whether the modal is visible
 *   onConfirm    {function} — callback when user clicks the confirm button
 *   onCancel     {function} — callback when user dismisses
 *   title        {string}   — modal headline
 *   message      {string}   — supporting body text
 *   confirmLabel {string}   — label for the confirm button (default: 'Confirm')
 *   isDanger     {boolean}  — if true, renders confirm button in danger red
 */
export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  isDanger = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31, 31, 31, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            transition: 'var(--transition-smooth)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F0EDEA')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-primary)')}
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: isDanger ? 'rgba(188, 71, 73, 0.1)' : 'rgba(107, 112, 92, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {isDanger ? (
            <Trash2 size={26} color="var(--color-error)" />
          ) : (
            <AlertTriangle size={26} color="var(--color-warning)" />
          )}
        </div>

        {/* Content */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, borderRadius: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn"
            style={{
              flex: 1,
              borderRadius: '14px',
              background: isDanger ? 'var(--color-error)' : 'var(--color-accent)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: isDanger
                ? '0 4px 15px rgba(188,71,73,0.25)'
                : '0 4px 15px var(--color-accent-glow)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
