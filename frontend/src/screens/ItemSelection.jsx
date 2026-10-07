import CartPanel from '../components/CartPanel.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useOrder, useToast } from '../state/OrderContext.jsx'
import '../styles/ordering.css'

const CATEGORIES = ['All', 'Drinks', 'Food', 'Snacks']

export default function ItemSelection() {
  const { state, addItem, setCategory } = useOrder()
  const showToast = useToast()

  const visibleProducts =
    state.category === 'All' ? state.products : state.products.filter((p) => p.category === state.category)
  const quantityById = new Map(state.cart.map((line) => [line.productId, line.qty]))

  function countIn(category) {
    return category === 'All' ? state.products.length : state.products.filter((p) => p.category === category).length
  }

  function handleAdd(product) {
    addItem(product)
    showToast(`Product added — ${product.name}`, 'success')
  }

  return (
    <div className="ordering-layout">
      <section className="menu" aria-labelledby="menu-title">
        <div>
          <h2 id="menu-title" className="screen-title">
            Menu
          </h2>
          <p className="screen-subtitle">Tap a product to add it to your order.</p>
        </div>

        <div className="category-tabs" aria-label="Categories">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`tab ${state.category === category ? 'is-active' : ''}`}
              aria-pressed={state.category === category}
              onClick={() => setCategory(category)}
            >
              {category}
              <span className="tab-count">{countIn(category)}</span>
            </button>
          ))}
        </div>

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantityInCart={quantityById.get(product.id) ?? 0}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </section>

      <CartPanel />
    </div>
  )
}
