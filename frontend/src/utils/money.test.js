import { describe, expect, it } from 'vitest'
import { formatPeso } from './money.js'

describe('formatPeso', () => {
  it('formats zero as ₱0.00', () => {
    expect(formatPeso(0)).toBe('₱0.00')
  })

  it('formats whole peso amounts', () => {
    expect(formatPeso(4500)).toBe('₱45.00')
    expect(formatPeso(17500)).toBe('₱175.00')
  })

  it('keeps the centavos', () => {
    expect(formatPeso(5)).toBe('₱0.05')
    expect(formatPeso(123456)).toBe('₱1,234.56')
  })

  it('adds thousands separators to large amounts', () => {
    expect(formatPeso(100000000)).toBe('₱1,000,000.00')
  })

  it('puts the minus sign before the peso sign', () => {
    expect(formatPeso(-2500)).toBe('-₱25.00')
  })

  it('shows a dash instead of NaN for missing or invalid amounts', () => {
    expect(formatPeso(undefined)).toBe('—')
    expect(formatPeso(null)).toBe('—')
    expect(formatPeso('4500')).toBe('—')
    expect(formatPeso(NaN)).toBe('—')
  })
})
