import { useCurrentToast } from '../state/OrderContext.jsx'

export default function Toast() {
  const toast = useCurrentToast()

  // The region is always rendered so screen readers announce each new message.
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
