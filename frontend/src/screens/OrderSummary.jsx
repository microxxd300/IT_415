import { useOrder } from '../state/OrderContext.jsx'
import { formatItemCount, lineSubtotal } from '../utils/cart.js'
import { formatPeso } from '../utils/money.js'
import '../styles/ordering.css'

export default function OrderSummary() {
  const { state, goTo, cartTotal, itemCount } = useOrder()

  if (state.cart.length === 0) {
    return (
      <section className="screen">
        <h2 className="screen-title">Order Summary</h2>
        <p className="screen-subtitle">Your order is empty. Add at least one item first.</p>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => goTo('selection')}>
            ← Back to Menu
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="screen summary-screen">
      <div>
        <h2 className="screen-title">Review your order</h2>
        <p className="screen-subtitle">{formatItemCount(itemCount)} · Check everything before you pay.</p>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col" className="num">
              Qty
            </th>
            <th scope="col" className="num">
              Unit price
            </th>
            <th scope="col" className="num">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {state.cart.map((line) => (
            <tr key={line.productId}>
              <th scope="row">{line.name}</th>
              <td className="num">{line.qty}</td>
              <td className="num">{formatPeso(line.unitPrice)}</td>
              <td className="num">{formatPeso(lineSubtotal(line))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td className="num summary-total">{formatPeso(cartTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => goTo('selection')}>
          ← Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => goTo('method')}>
          Continue to Payment
        </button>
      </div>
    </section>
  )
}
