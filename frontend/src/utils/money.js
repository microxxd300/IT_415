// All money in the app is integer centavos (4500 = ₱45.00). Convert to text only for display.

export function formatPeso(centavos) {
  if (!Number.isFinite(centavos)) return '—' // missing or invalid amount: never show "₱NaN.NaN"
  const sign = centavos < 0 ? '-' : ''
  const amount = Math.abs(Math.round(centavos))
  const pesos = Math.floor(amount / 100).toLocaleString('en-US')
  const cents = String(amount % 100).padStart(2, '0')
  return `${sign}₱${pesos}.${cents}`
}
