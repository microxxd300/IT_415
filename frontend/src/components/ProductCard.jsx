import { useState } from 'react'
import { formatPeso } from '../utils/money.js'

// Pictures in public/assets/menu/. If one is missing, the emoji below is shown instead.
const PRODUCT_IMAGES = {
  Coffee: 'coffee.png',
  Sandwich: 'sandwich.png',
  'Soft Drink': 'soda.png',
  Cookies: 'cookies.png',
  'Bottled Water': 'water.png',
  Chocolate: 'chocolate.png',
}

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
  const [imageFailed, setImageFailed] = useState(false)
  const image = PRODUCT_IMAGES[product.name]
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
        {image && !imageFailed ? (
          <img src={`/assets/menu/${image}`} alt="" onError={() => setImageFailed(true)} />
        ) : (
          icon
        )}
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
