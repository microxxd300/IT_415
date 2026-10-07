import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Laiza replaces this screen in Step 5.
export default function CardPayment() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Credit/Debit Card</h2>
      <p className="screen-subtitle">Placeholder — card instructions and processing state come in Step 5.</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')}>
          Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => goTo('success')}>
          Process Payment
        </button>
      </div>
    </section>
  )
}
