import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Laiza replaces this screen in Step 6.
export default function PaymentSuccess() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Payment Successful</h2>
      <p className="screen-subtitle">Placeholder — amount, change, method and reference come in Step 6.</p>
      <div className="actions">
        <button type="button" className="btn btn-accent" onClick={() => goTo('receipt')}>
          View Receipt
        </button>
      </div>
    </section>
  )
}
