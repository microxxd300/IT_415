// Pure cart functions: each takes a cart and returns a NEW cart, never changing the old one.
// A cart line is { productId, name, unitPrice, qty }; unitPrice is integer centavos.

export function addItem(cart, product) {
  const inCart = cart.some((line) => line.productId === product.id)
  if (inCart) return increaseQty(cart, product.id)
  return [...cart, { productId: product.id, name: product.name, unitPrice: product.price, qty: 1 }]
}

export function increaseQty(cart, productId) {
  return cart.map((line) => (line.productId === productId ? { ...line, qty: line.qty + 1 } : line))
}

// Decreasing from 1 removes the line, so a quantity can never reach 0 or go negative.
export function decreaseQty(cart, productId) {
  return cart
    .map((line) => (line.productId === productId ? { ...line, qty: line.qty - 1 } : line))
    .filter((line) => line.qty > 0)
}

export function removeItem(cart, productId) {
  return cart.filter((line) => line.productId !== productId)
}

// Subtotal = unit price × quantity
export function lineSubtotal(line) {
  return line.unitPrice * line.qty
}

// Total = sum of all subtotals
export function cartTotal(cart) {
  return cart.reduce((sum, line) => sum + lineSubtotal(line), 0)
}

export function itemCount(cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0)
}

// "1 item", "3 items"
export function formatItemCount(count) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}
