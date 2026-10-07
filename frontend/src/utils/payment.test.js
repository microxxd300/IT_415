import { describe, expect, it } from 'vitest'
import { MAX_CASH_PESOS, changeFor, checkCash, entryToCentavos, pressKey } from './payment.js'

function type(...keys) {
  return keys.reduce(pressKey, '')
}

describe('keypad entry', () => {
  it('builds the amount from digit keys', () => {
    expect(type('2', '0', '0')).toBe('200')
    expect(entryToCentavos('200')).toBe(20000)
  })

  it('drops leading zeros but keeps a single 0', () => {
    expect(type('0', '5')).toBe('5')
    expect(type('0', '0')).toBe('0')
  })

  it('clears and deletes the last digit', () => {
    expect(type('2', '0', '0', 'back')).toBe('20')
    expect(type('2', '0', '0', 'clear')).toBe('')
    expect(type('back')).toBe('')
  })

  it('ignores anything that is not a digit', () => {
    expect(type('1', 'x', '.', '-', '5')).toBe('15')
  })

  it(`never goes above ₱${MAX_CASH_PESOS.toLocaleString('en-US')}`, () => {
    expect(type('1', '0', '0', '0', '0', '0')).toBe('100000')
    expect(type('1', '0', '0', '0', '0', '0', '0')).toBe('100000')
    expect(type('9', '9', '9', '9', '9', '9')).toBe('99999')
  })

  it('an empty entry has no amount', () => {
    expect(entryToCentavos('')).toBeNull()
  })
})

describe('cash check (same rules as the backend)', () => {
  it('₱100 on ₱140 is rejected with the exact backend message', () => {
    expect(checkCash(10000, 14000)).toEqual({
      ok: false,
      message: 'Insufficient payment. Please enter at least ₱140.00. You are short by ₱40.00.',
    })
  })

  it('an empty entry asks for the amount', () => {
    expect(checkCash(null, 14000)).toEqual({ ok: false, message: 'Please enter the amount paid.' })
  })

  it('₱200 on ₱140 is accepted with ₱60 change', () => {
    expect(checkCash(20000, 14000).ok).toBe(true)
    expect(changeFor(20000, 14000)).toBe(6000)
  })

  it('exact payment is accepted with ₱0.00 change', () => {
    expect(checkCash(14000, 14000).ok).toBe(true)
    expect(changeFor(14000, 14000)).toBe(0)
  })

  it('shows no change while the amount is not enough', () => {
    expect(changeFor(10000, 14000)).toBeNull()
    expect(changeFor(null, 14000)).toBeNull()
  })
})
