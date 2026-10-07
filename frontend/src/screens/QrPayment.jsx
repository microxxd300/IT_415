import { usePayment } from '../hooks/usePayment.js'
import { useOrder } from '../state/OrderContext.jsx'
import { formatPeso } from '../utils/money.js'
import '../styles/payment.css'

const SIZE = 21 // modules per side, like a version-1 QR code

// A fixed, QR-looking pattern for the placeholder. It encodes nothing: payment is simulated.
function placeholderModules() {
  const isFinder = (x, y) => (x < 7 && y < 7) || (x >= SIZE - 7 && y < 7) || (x < 7 && y >= SIZE - 7)
  const finderDark = (x, y) => {
    const fx = x % (SIZE - 7) === x ? x : x - (SIZE - 7)
    const fy = y % (SIZE - 7) === y ? y : y - (SIZE - 7)
    const ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3))
    return ring !== 2
  }
  let seed = 415
  const modules = []
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      seed = (seed * 1103515245 + 12345) % 2147483648
      const dark = isFinder(x, y) ? finderDark(x, y) : seed % 3 === 0
      if (dark) modules.push(`M${x} ${y}h1v1h-1z`)
    }
  }
  return modules.join('')
}

const QR_PATH = placeholderModules()

export default function QrPayment() {
  const { cartTotal, goTo } = useOrder()
  const { isPaying, errorMessage, pay } = usePayment('qr')

  return (
    <section className="screen payment-screen">
      <div>
        <h2 className="screen-title">QR payment</h2>
        <p className="screen-subtitle">Pay with your phone, then confirm below.</p>
      </div>

      <div className="qr-layout">
        <figure className="qr-box">
          <svg viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`} role="img" aria-label="QR code placeholder for a simulated payment">
            <rect x="-2" y="-2" width={SIZE + 4} height={SIZE + 4} fill="#ffffff" />
            <path d={QR_PATH} fill="#1d1d1b" />
          </svg>
          <figcaption>Sample QR · simulated</figcaption>
        </figure>

        <div className="qr-info">
          <div className="amount-row">
            <span>Amount to pay</span>
            <strong>{formatPeso(cartTotal)}</strong>
          </div>
          <ol className="payment-steps">
            <li>Scan the QR code using your supported payment application.</li>
            <li>Check that the amount is {formatPeso(cartTotal)} and approve the payment in the app.</li>
            <li>Tap Confirm Payment below.</li>
          </ol>
          {errorMessage && (
            <p className="change-panel is-short payment-error" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('method')} disabled={isPaying}>
          ← Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => pay()} disabled={isPaying}>
          {isPaying ? 'Confirming…' : 'Confirm Payment'}
        </button>
      </div>
    </section>
  )
}
