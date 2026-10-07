import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Laiza replaces this screen in Step 5.
export default function CashPayment() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Cash Payment</h2>
      <p className="screen-subtitle">Placeholder — keypad, quick amounts and change come in Step 5.</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')}>
          Change payment method
        </button>
        <button type="button" className="btn btn-accent" onClick={() => goTo('success')}>
          Pay Now
        </button>
      </div>
    </section>
  )
}
