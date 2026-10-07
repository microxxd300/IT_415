import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Laiza replaces this screen in Step 5.
export default function QrPayment() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">QR Payment</h2>
      <p className="screen-subtitle">Placeholder — the QR placeholder and instructions come in Step 5.</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')}>
          Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => goTo('success')}>
          Confirm Payment
        </button>
      </div>
    </section>
  )
}
