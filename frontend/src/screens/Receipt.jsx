import { useCallback, useEffect, useState } from 'react'
import { getTransaction } from '../api/client.js'
import NoTransaction from '../components/NoTransaction.jsx'
import { useOrder } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import '../styles/receipt.css'

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
}

export default function Receipt() {
  const { state, newTransaction } = useOrder()
  const paidTransaction = state.transaction // the receipt the server returned when the payment succeeded
  const reference = paidTransaction?.reference
  const [receipt, setReceipt] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  // The receipt is loaded from the server, which proves the transaction was really saved.
  const loadReceipt = useCallback(
    async (isCurrent = () => true) => {
      if (!reference) return
      setStatus('loading')
      try {
        const saved = await getTransaction(reference)
        if (!isCurrent()) return
        setReceipt(saved)
        setStatus('ready')
      } catch (error) {
        if (!isCurrent()) return
        // The server can forget a receipt (restart, or another serverless instance). The payment
        // already succeeded, so show the receipt the server returned at payment time instead.
        if (error.status === 404) {
          setReceipt(paidTransaction)
          setStatus('ready')
          return
        }
        setErrorMessage(error.message)
        setStatus('error')
      }
    },
    [reference, paidTransaction],
  )

  useEffect(() => {
    let current = true
    loadReceipt(() => current)
    return () => {
      current = false
    }
  }, [loadReceipt])

  if (!reference) return <NoTransaction />

  if (status === 'loading') {
    return <p className="status-message">Loading receipt…</p>
  }

  if (status === 'error') {
    return (
      <div className="status-message status-error" role="alert">
        <p>{errorMessage}</p>
        <div className="receipt-error-actions">
          <button type="button" className="btn btn-secondary" onClick={() => loadReceipt()}>
            Try again
          </button>
          <button type="button" className="btn btn-primary" onClick={newTransaction}>
            New Transaction
          </button>
        </div>
      </div>
    )
  }

  const summary = [
    ['Total', formatPeso(receipt.total)],
    ['Payment method', receipt.payment_method_label],
    ['Amount paid', formatPeso(receipt.amount_paid)],
    ['Change', formatPeso(receipt.change)],
    ['Status', receipt.status],
  ]

  return (
    <section className="receipt-layout">
      <article className="receipt-paper" aria-labelledby="receipt-title">
        <header className="receipt-head">
          <h2 id="receipt-title">CAMPUS STORE POS</h2>
          <p>Self-service kiosk</p>
        </header>

        <dl className="receipt-meta">
          <div>
            <dt>Transaction No.</dt>
            <dd>{receipt.reference}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDate(receipt.created_at)}</dd>
          </div>
        </dl>

        <table className="receipt-items">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col" className="num">
                Qty × price
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item) => (
              <tr key={item.product_id}>
                <th scope="row">{item.name}</th>
                <td className="num">
                  {item.quantity} × {formatPeso(item.unit_price)}
                </td>
                <td className="num">{formatPeso(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="receipt-summary">
          {summary.map(([label, value]) => (
            <div key={label} className={label === 'Total' ? 'is-total' : ''}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="receipt-thanks">Thank you for your purchase!</p>
      </article>

      <aside className="receipt-side">
        <h2 className="screen-title">Your receipt</h2>
        <p className="screen-subtitle">Keep this receipt as proof of payment.</p>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          🖨 Print receipt
        </button>
        <button type="button" className="btn btn-accent" onClick={newTransaction}>
          New Transaction
        </button>
      </aside>
    </section>
  )
}
