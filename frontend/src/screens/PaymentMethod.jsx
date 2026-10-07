import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Cheny replaces this screen in Step 3.
export default function PaymentMethod() {
  const { goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Payment Method</h2>
      <p className="screen-subtitle">Placeholder — large payment buttons with descriptions come in Step 3.</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('summary')}>
          Back to Order
        </button>
        <button type="button" className="btn btn-primary" onClick={() => goTo('cash')}>
          Cash
        </button>
        <button type="button" className="btn btn-primary" onClick={() => goTo('qr')}>
          QR Payment
        </button>
        <button type="button" className="btn btn-primary" onClick={() => goTo('card')}>
          Credit/Debit Card
        </button>
      </div>
    </section>
  )
}
