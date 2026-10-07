import NoTransaction from '../components/NoTransaction.jsx'
import { useOrder } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import '../styles/receipt.css'

export default function PaymentSuccess() {
  const { state, goTo } = useOrder()
  const transaction = state.transaction // the receipt returned by the server; nothing is recalculated here

  if (!transaction) return <NoTransaction />

  const details = [
    ['Transaction amount', formatPeso(transaction.total)],
    ['Amount paid', formatPeso(transaction.amount_paid)],
    ['Change', formatPeso(transaction.change)],
    ['Payment method', transaction.payment_method_label],
  ]

  return (
    <section className="screen success-screen">
      <div className="success-header">
        <span className="success-check" aria-hidden="true">
          ✓
        </span>
        <h2 className="screen-title">Payment Successful</h2>
        <p className="screen-subtitle">Thank you! Your payment has been received.</p>
      </div>

      <div className="success-reference">
        <span>Transaction no.</span>
        <strong>{transaction.reference}</strong>
      </div>

      <dl className="success-details">
        {details.map(([label, value]) => (
          <div key={label} className="success-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="actions">
        <button type="button" className="btn btn-accent" onClick={() => goTo('receipt')}>
          View Receipt
        </button>
      </div>
    </section>
  )
}
