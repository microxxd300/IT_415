import { useOrder } from '../state/OrderContext.jsx'

// Placeholder: Cheny replaces this screen in Step 3.
export default function ItemSelection() {
  const { state, goTo } = useOrder()

  return (
    <section className="screen">
      <h2 className="screen-title">Item Selection</h2>
      <p className="screen-subtitle">Placeholder — {state.products.length} products loaded. Product cards and the cart come in Step 3.</p>
      <div className="actions">
        <button type="button" className="btn btn-accent" onClick={() => goTo('summary')}>
          Proceed to Payment
        </button>
      </div>
    </section>
  )
}
