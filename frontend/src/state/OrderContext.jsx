// Shared kiosk state: current screen, products, cart and the finished transaction, plus toast messages.
// Money is integer centavos everywhere (unitPrice 4500 = ₱45.00).

import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react'

const OrderContext = createContext(null)
const ToastContext = createContext(null)

const TOAST_DURATION_MS = 2500

const initialState = {
  screen: 'selection',
  category: 'All',
  products: [],
  cart: [], // [{ productId, name, unitPrice, qty }]
  transaction: null, // the receipt returned by the backend after a successful payment
}

function orderReducer(state, action) {
  switch (action.type) {
    case 'setProducts':
      return { ...state, products: action.products }
    case 'add': {
      const { product } = action
      const inCart = state.cart.some((line) => line.productId === product.id)
      const cart = inCart
        ? state.cart.map((line) => (line.productId === product.id ? { ...line, qty: line.qty + 1 } : line))
        : [...state.cart, { productId: product.id, name: product.name, unitPrice: product.price, qty: 1 }]
      return { ...state, cart }
    }
    case 'increase':
      return {
        ...state,
        cart: state.cart.map((line) => (line.productId === action.id ? { ...line, qty: line.qty + 1 } : line)),
      }
    case 'decrease':
      // Decreasing from 1 removes the line, so a quantity can never reach 0 or go negative.
      return {
        ...state,
        cart: state.cart
          .map((line) => (line.productId === action.id ? { ...line, qty: line.qty - 1 } : line))
          .filter((line) => line.qty > 0),
      }
    case 'remove':
      return { ...state, cart: state.cart.filter((line) => line.productId !== action.id) }
    case 'setCategory':
      return { ...state, category: action.category }
    case 'goTo':
      return { ...state, screen: action.screen }
    case 'setTransaction':
      return { ...state, transaction: action.transaction }
    case 'newTransaction':
      // Everything from the previous customer is cleared; only the loaded products stay.
      return { ...initialState, products: state.products }
    default:
      throw new Error(`Unknown order action: ${action.type}`)
  }
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message, type })
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }, [])

  const value = useMemo(() => ({ toast, showToast }), [toast, showToast])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState)
  const showToast = useToast()

  // Created once, so components and effects can depend on these functions safely.
  const actions = useMemo(
    () => ({
      setProducts: (products) => dispatch({ type: 'setProducts', products }),
      addItem: (product) => dispatch({ type: 'add', product }),
      increase: (id) => dispatch({ type: 'increase', id }),
      decrease: (id) => dispatch({ type: 'decrease', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      setCategory: (category) => dispatch({ type: 'setCategory', category }),
      goTo: (screen) => {
        dispatch({ type: 'goTo', screen })
        window.scrollTo(0, 0)
      },
      setTransaction: (transaction) => dispatch({ type: 'setTransaction', transaction }),
      newTransaction: () => {
        dispatch({ type: 'newTransaction' })
        window.scrollTo(0, 0)
        showToast('New transaction started — previous order cleared', 'info')
      },
    }),
    [showToast],
  )

  const value = useMemo(() => {
    const cartTotal = state.cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
    const itemCount = state.cart.reduce((sum, line) => sum + line.qty, 0)
    return { state, ...actions, cartTotal, itemCount }
  }, [state, actions])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrder must be used inside <OrderProvider>')
  return context
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context.showToast
}

// Used only by the Toast component to read the message currently shown.
export function useCurrentToast() {
  return useContext(ToastContext).toast
}
