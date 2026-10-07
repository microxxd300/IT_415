// Cash payment helpers. The keypad types whole pesos; everything else is integer centavos.
// The backend checks the payment again — these only give the customer instant feedback.

import { formatPeso } from './money.js'

export const MAX_CASH_PESOS = 100000 // ₱100,000

// Returns the new keypad entry (a string of digits) after a key press: '0'–'9', 'clear' or 'back'.
export function pressKey(entry, key) {
  if (key === 'clear') return ''
  if (key === 'back') return entry.slice(0, -1)
  if (!/^\d$/.test(key)) return entry

  const next = (entry + key).replace(/^0+(?=\d)/, '') // "05" → "5", but "0" stays "0"
  return Number(next) > MAX_CASH_PESOS ? entry : next
}

export function entryToCentavos(entry) {
  return entry === '' ? null : Number(entry) * 100
}

// Same rule and wording as the backend, so the customer sees the same message either way.
export function checkCash(paidCentavos, totalCentavos) {
  if (paidCentavos === null) {
    return { ok: false, message: 'Please enter the amount paid.' }
  }
  if (paidCentavos < totalCentavos) {
    return {
      ok: false,
      message:
        `Insufficient payment. Please enter at least ${formatPeso(totalCentavos)}. ` +
        `You are short by ${formatPeso(totalCentavos - paidCentavos)}.`,
    }
  }
  return { ok: true, message: '' }
}

// The body for POST /api/transactions. Only ids and quantities are sent: the server sets the prices.
export function buildPaymentRequest(cart, paymentMethod, amountPaid = null) {
  const request = {
    items: cart.map((line) => ({ product_id: line.productId, quantity: line.qty })),
    payment_method: paymentMethod,
  }
  if (paymentMethod === 'cash') request.amount_paid = amountPaid
  return request
}

// Change = amount paid − total, or null while the amount is not enough yet.
export function changeFor(paidCentavos, totalCentavos) {
  if (paidCentavos === null || paidCentavos < totalCentavos) return null
  return paidCentavos - totalCentavos
}
