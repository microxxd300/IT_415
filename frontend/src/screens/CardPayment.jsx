import { usePayment } from '../hooks/usePayment.js'
import { useOrder } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import '../styles/payment.css'

const PROCESSING_MS = 2000 // simulated card terminal

export default function CardPayment() {
  const { cartTotal, goTo } = useOrder()
  const { isPaying, errorMessage, pay } = usePayment('card')

  return (
    <section className="screen payment-screen">
      <div>
        <h2 className="screen-title">Credit/Debit card</h2>
        <p className="screen-subtitle">Use the card reader below the screen.</p>
      </div>

      <div className={`card-terminal ${isPaying ? 'is-processing' : ''}`} aria-live="polite">
        <span className="card-icon" aria-hidden="true">
          💳
        </span>
        <div className="amount-row">
          <span>Amount due</span>
          <strong>{formatPeso(cartTotal)}</strong>
        </div>
        <p className="card-instruction">{isPaying ? 'Processing payment…' : 'Please tap, insert, or swipe your card.'}</p>
        {isPaying && <span className="spinner" aria-hidden="true" />}
        {errorMessage && (
          <p className="change-panel is-short payment-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')} disabled={isPaying}>
          ← Back
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => pay({ processingMs: PROCESSING_MS })}
          disabled={isPaying}
        >
          {isPaying ? 'Processing payment…' : 'Process Payment'}
        </button>
      </div>
    </section>
  )
}
