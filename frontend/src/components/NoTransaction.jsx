import { useOrder } from '../state/OrderContext.jsx'

// Shown by the Success and Receipt screens if they are opened without a completed payment.
export default function NoTransaction() {
  const { newTransaction } = useOrder()

  return (
    <section className="screen success-screen">
      <h2 className="screen-title">No completed payment</h2>
      <p className="screen-subtitle">There is no payment to show. Please start a new transaction.</p>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={newTransaction}>
          New Transaction
        </button>
      </div>
    </section>
  )
}
