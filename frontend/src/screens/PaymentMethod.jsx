import { useOrder, useToast } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import '../styles/ordering.css'

const METHODS = [
  { screen: 'cash', icon: '💵', label: 'Cash', description: 'Pay with bills and coins. We calculate your change.' },
  { screen: 'qr', icon: '📱', label: 'QR Payment', description: 'Scan a QR code with your payment app.' },
  { screen: 'card', icon: '💳', label: 'Credit/Debit Card', description: 'Tap, insert, or swipe your card.' },
]

export default function PaymentMethod() {
  const { goTo, cartTotal } = useOrder()
  const showToast = useToast()

  function choose(method) {
    showToast(`${method.label} selected`)
    goTo(method.screen)
  }

  return (
    <section className="screen method-screen">
      <div>
        <h2 className="screen-title">How would you like to pay?</h2>
        <p className="screen-subtitle">Choose a payment method.</p>
      </div>

      <div className="amount-due">
        <span>Amount due</span>
        <strong>{formatPeso(cartTotal)}</strong>
      </div>

      <div className="method-list">
        {METHODS.map((method) => (
          <button key={method.screen} type="button" className="method-button" onClick={() => choose(method)}>
            <span className="method-icon" aria-hidden="true">
              {method.icon}
            </span>
            <span className="method-text">
              <span className="method-label">{method.label}</span>
              <span className="method-description">{method.description}</span>
            </span>
            <span className="method-arrow" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('summary')}>
          ← Back to Order
        </button>
      </div>
    </section>
  )
}
