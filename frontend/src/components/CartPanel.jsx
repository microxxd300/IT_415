import { useOrder, useToast } from '../state/OrderContext.jsx'
import { formatItemCount, lineSubtotal } from '../utils/cart.js'
import { formatPeso } from '../utils/money.js'

export default function CartPanel() {
  const { state, increase, decrease, remove, goTo, cartTotal, itemCount } = useOrder()
  const showToast = useToast()
  const isEmpty = state.cart.length === 0

  function handleIncrease(line) {
    increase(line.productId)
    showToast(`${line.name} quantity: ${line.qty + 1}`)
  }

  function handleDecrease(line) {
    decrease(line.productId)
    showToast(line.qty === 1 ? `${line.name} removed` : `${line.name} quantity: ${line.qty - 1}`)
  }

  function handleRemove(line) {
    remove(line.productId)
    showToast(`${line.name} removed`)
  }

  return (
    <aside className="cart-panel" aria-labelledby="cart-title">
      <div className="cart-header">
        <h2 id="cart-title">Your Order</h2>
        <span className="cart-count">{formatItemCount(itemCount)}</span>
      </div>

      {isEmpty ? (
        <div className="cart-empty">
          <span className="cart-empty-icon" aria-hidden="true">
            🛒
          </span>
          <p>Your order is empty.</p>
          <p className="cart-hint">Tap a product to add it.</p>
        </div>
      ) : (
        <ul className="cart-lines">
          {state.cart.map((line) => (
            <li key={line.productId} className="cart-line">
              <div className="cart-line-info">
                <span className="cart-line-name">{line.name}</span>
                <span className="cart-line-price">{formatPeso(line.unitPrice)} each</span>
              </div>
              <button
                type="button"
                className="btn btn-danger cart-remove"
                onClick={() => handleRemove(line)}
                aria-label={`Remove ${line.name}`}
              >
                Remove
              </button>
              <div className="qty-control">
                <button
                  type="button"
                  className="btn btn-secondary qty-btn"
                  onClick={() => handleDecrease(line)}
                  aria-label={`Decrease ${line.name}`}
                >
                  −
                </button>
                <span className="qty-value" aria-label={`Quantity ${line.qty}`}>
                  {line.qty}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary qty-btn"
                  onClick={() => handleIncrease(line)}
                  aria-label={`Increase ${line.name}`}
                >
                  +
                </button>
              </div>
              <span className="cart-line-subtotal">{formatPeso(lineSubtotal(line))}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <strong>{formatPeso(cartTotal)}</strong>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-block"
          disabled={isEmpty}
          onClick={() => goTo('summary')}
          aria-describedby={isEmpty ? 'proceed-hint' : undefined}
        >
          Proceed to Payment
        </button>
        {isEmpty && (
          <p id="proceed-hint" className="cart-hint">
            Add at least one item to continue.
          </p>
        )}
      </div>
    </aside>
  )
}
