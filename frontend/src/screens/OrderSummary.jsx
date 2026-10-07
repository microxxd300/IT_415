import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Cheny replaces this screen in Step 3.
export default function OrderSummary() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Order Summary</h2>
      <p className="screen-subtitle">Placeholder — the order table comes in Step 3.</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('selection')}>
          Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => goTo('method')}>
          Continue to Payment
        </button>
      </div>
    </section>
  )
}
