import { formatPeso } from '../utils/money.js'

const PRODUCT_ICONS = {
  Coffee: '☕',
  Sandwich: '🥪',
  'Soft Drink': '🥤',
  Cookies: '🍪',
  'Bottled Water': '💧',
  Chocolate: '🍫',
}
const CATEGORY_ICONS = { Drinks: '🥤', Food: '🍽️', Snacks: '🍪' }

// The whole card is one large button: tapping anywhere on it adds the product.
export default function ProductCard({ product, quantityInCart, onAdd }) {
  const icon = PRODUCT_ICONS[product.name] ?? CATEGORY_ICONS[product.category] ?? '🛒'
  const inOrder = quantityInCart > 0 ? `, ${quantityInCart} in your order` : ''

  return (
    <button
      type="button"
      className="product-card"
      onClick={() => onAdd(product)}
      aria-label={`Add ${product.name}, ${formatPeso(product.price)}${inOrder}`}
    >
      {quantityInCart > 0 && <span className="product-badge">{quantityInCart}</span>}
      <span className="product-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="product-name">{product.name}</span>
      <span className="product-category">{product.category}</span>
      <span className="product-footer">
        <span className="product-price">{formatPeso(product.price)}</span>
        <span className="product-add" aria-hidden="true">
          +
        </span>
      </span>
    </button>
  )
}
