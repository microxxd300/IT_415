import { describe, expect, it } from 'vitest'
import { addItem, cartTotal, decreaseQty, increaseQty, itemCount, lineSubtotal, removeItem } from './cart.js'

// Same products and centavo prices as the backend.
const COFFEE = { id: 1, name: 'Coffee', price: 4500, category: 'Drinks' }
const SANDWICH = { id: 2, name: 'Sandwich', price: 5000, category: 'Food' }
const SOFT_DRINK = { id: 3, name: 'Soft Drink', price: 3500, category: 'Drinks' }

function subtotalOf(cart, productId) {
  return lineSubtotal(cart.find((line) => line.productId === productId))
}

// Coffee ×2 + Sandwich ×1 + Soft Drink ×1
function sampleOrder() {
  let cart = []
  cart = addItem(cart, COFFEE)
  cart = addItem(cart, COFFEE)
  cart = addItem(cart, SANDWICH)
  cart = addItem(cart, SOFT_DRINK)
  return cart
}

describe('acceptance tests 1–3', () => {
  it('1: Coffee×2 + Sandwich + Soft Drink → ₱90 / ₱50 / ₱35, total ₱175', () => {
    const cart = sampleOrder()

    expect(subtotalOf(cart, COFFEE.id)).toBe(9000)
    expect(subtotalOf(cart, SANDWICH.id)).toBe(5000)
    expect(subtotalOf(cart, SOFT_DRINK.id)).toBe(3500)
    expect(cartTotal(cart)).toBe(17500)
  })

  it('2: Coffee 2→3 → ₱135, total ₱220; back to 2 → ₱175', () => {
    const three = increaseQty(sampleOrder(), COFFEE.id)
    expect(subtotalOf(three, COFFEE.id)).toBe(13500)
    expect(cartTotal(three)).toBe(22000)

    const two = decreaseQty(three, COFFEE.id)
    expect(subtotalOf(two, COFFEE.id)).toBe(9000)
    expect(cartTotal(two)).toBe(17500)
  })

  it('3: removing Soft Drink → total ₱140', () => {
    const cart = removeItem(sampleOrder(), SOFT_DRINK.id)

    expect(cart.some((line) => line.productId === SOFT_DRINK.id)).toBe(false)
    expect(cartTotal(cart)).toBe(14000)
  })
})

describe('cart rules', () => {
  it('adding the same product again increases its quantity instead of adding a new line', () => {
    const cart = addItem(addItem([], COFFEE), COFFEE)

    expect(cart).toEqual([{ productId: 1, name: 'Coffee', unitPrice: 4500, qty: 2 }])
  })

  it('decreasing from 1 removes the line, so quantity never becomes 0 or negative', () => {
    const cart = decreaseQty(addItem([], SANDWICH), SANDWICH.id)

    expect(cart).toEqual([])
    expect(decreaseQty(cart, SANDWICH.id)).toEqual([])
  })

  it('counts items by quantity', () => {
    expect(itemCount(sampleOrder())).toBe(4)
  })

  it('an empty cart totals ₱0.00 with 0 items', () => {
    expect(cartTotal([])).toBe(0)
    expect(itemCount([])).toBe(0)
  })

  it('never changes the cart it was given', () => {
    const original = sampleOrder()
    const snapshot = structuredClone(original)

    increaseQty(original, COFFEE.id)
    decreaseQty(original, COFFEE.id)
    removeItem(original, SANDWICH.id)
    addItem(original, SOFT_DRINK)

    expect(original).toEqual(snapshot)
  })
})
