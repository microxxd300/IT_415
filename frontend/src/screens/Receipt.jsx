import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Laiza replaces this screen in Step 6.
export default function Receipt() {
  const { newTransaction } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Receipt</h2>
      <p className="screen-subtitle">Placeholder — the digital receipt comes in Step 6.</p>
      <div className="actions">
        <button type="button" className="btn btn-accent" onClick={newTransaction}>
          New Transaction
        </button>
      </div>
    </section>
  )
}
