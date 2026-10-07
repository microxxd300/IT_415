import { useState } from 'react'
import { createTransaction } from '../api/client.js'
import Keypad from '../components/Keypad.jsx'
import { useOrder, useToast } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import { buildPaymentRequest, changeFor, checkCash, entryToCentavos, pressKey } from '../utils/payment.js'
import '../styles/payment.css'

const QUICK_AMOUNTS = [20000, 50000, 100000] // ₱200, ₱500, ₱1,000

function shortPeso(centavos) {
  return `₱${(centavos / 100).toLocaleString('en-US')}`
}

export default function CashPayment() {
  const { state, cartTotal, goTo, setTransaction } = useOrder()
  const showToast = useToast()
  const [entry, setEntry] = useState('') // whole pesos typed on the keypad
  const [errorMessage, setErrorMessage] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  const paid = entryToCentavos(entry)
  const change = changeFor(paid, cartTotal)
  const shortBy = paid !== null && paid < cartTotal ? cartTotal - paid : null

  function handleKey(key) {
    setEntry((current) => pressKey(current, key))
    setErrorMessage('')
  }

  function chooseAmount(centavos) {
    setEntry(String(Math.ceil(centavos / 100)))
    setErrorMessage('')
  }

  function showError(message) {
    setErrorMessage(message)
    showToast(message, 'error')
  }

  async function handlePay() {
    // Instant check on the kiosk; the backend checks the payment again.
    const check = checkCash(paid, cartTotal)
    if (!check.ok) {
      showError(check.message)
      return
    }

    setIsPaying(true) // disables every button so the customer cannot pay twice
    try {
      const receipt = await createTransaction(buildPaymentRequest(state.cart, 'cash', paid))
      setTransaction(receipt)
      showToast('Transaction completed successfully', 'success')
      goTo('success')
    } catch (error) {
      showError(error.message) // stay on this screen; nothing was paid
      setIsPaying(false)
    }
  }

  return (
    <section className="screen payment-screen">
      <div>
        <h2 className="screen-title">Cash payment</h2>
        <p className="screen-subtitle">Enter the amount you will pay, then tap Pay Now.</p>
      </div>

      <div className="cash-layout">
        <div className="cash-summary">
          <div className="amount-row">
            <span>Total due</span>
            <strong>{formatPeso(cartTotal)}</strong>
          </div>
          <div className={`amount-row amount-paid ${paid === null ? 'is-empty' : ''}`}>
            <span>Amount paid</span>
            <strong aria-live="polite">{formatPeso(paid ?? 0)}</strong>
          </div>

          {/* One panel for feedback: the error after Pay Now, otherwise the live change or shortfall. */}
          {errorMessage ? (
            <p className="change-panel is-short payment-error" role="alert">
              {errorMessage}
            </p>
          ) : (
            <div
              className={`change-panel ${change !== null ? 'is-ok' : ''} ${shortBy !== null ? 'is-short' : ''}`}
              aria-live="polite"
            >
              {change !== null && (
                <>
                  <span>Change</span>
                  <strong>{formatPeso(change)}</strong>
                </>
              )}
              {shortBy !== null && (
                <>
                  <span>Short by</span>
                  <strong>{formatPeso(shortBy)}</strong>
                </>
              )}
              {paid === null && <span>Enter the amount paid</span>}
            </div>
          )}

          <div className="quick-amounts" role="group" aria-label="Quick amounts">
            <button type="button" className="btn btn-secondary" onClick={() => chooseAmount(cartTotal)} disabled={isPaying}>
              Exact
            </button>
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className="btn btn-secondary"
                onClick={() => chooseAmount(amount)}
                disabled={isPaying || amount < cartTotal}
              >
                {shortPeso(amount)}
              </button>
            ))}
          </div>
        </div>

        <Keypad onKey={handleKey} disabled={isPaying} />
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')} disabled={isPaying}>
          ← Change payment method
        </button>
        <button type="button" className="btn btn-accent" onClick={handlePay} disabled={isPaying}>
          {isPaying ? 'Processing…' : 'Pay Now'}
        </button>
      </div>
    </section>
  )
}
