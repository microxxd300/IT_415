import { useCallback, useEffect, useState } from 'react'
import { getProducts } from './api/client.js'
import Header from './components/Header.jsx'
import StepIndicator from './components/StepIndicator.jsx'
import Toast from './components/Toast.jsx'
import CardPayment from './screens/CardPayment.jsx'
import CashPayment from './screens/CashPayment.jsx'
import ItemSelection from './screens/ItemSelection.jsx'
import OrderSummary from './screens/OrderSummary.jsx'
import PaymentMethod from './screens/PaymentMethod.jsx'
import PaymentSuccess from './screens/PaymentSuccess.jsx'
import QrPayment from './screens/QrPayment.jsx'
import Receipt from './screens/Receipt.jsx'
import { OrderProvider, ToastProvider, useOrder } from './state/OrderContext.jsx'

// No router: the current screen lives in state, so going Back never loses the cart.
const SCREENS = {
  selection: ItemSelection,
  summary: OrderSummary,
  method: PaymentMethod,
  cash: CashPayment,
  qr: QrPayment,
  card: CardPayment,
  success: PaymentSuccess,
  receipt: Receipt,
}

function Kiosk() {
  const { state, setProducts } = useOrder()
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  // isCurrent() is false once a newer load has started, so a late answer cannot overwrite it.
  const loadProducts = useCallback(
    async (isCurrent = () => true) => {
      setStatus('loading')
      try {
        const products = await getProducts()
        if (!isCurrent()) return
        setProducts(products)
        setStatus('ready')
      } catch (error) {
        if (!isCurrent()) return
        setErrorMessage(error.message)
        setStatus('error')
      }
    },
    [setProducts],
  )

  useEffect(() => {
    let current = true
    loadProducts(() => current)
    return () => {
      current = false // React StrictMode runs effects twice in development; ignore the first load.
    }
  }, [loadProducts])

  const Screen = SCREENS[state.screen]

  return (
    <div className="kiosk">
      <Header />
      <StepIndicator />
      <main className="kiosk-main">
        {status === 'loading' && <p className="status-message">Loading products…</p>}
        {status === 'error' && (
          <div className="status-message status-error" role="alert">
            <p>{errorMessage}</p>
            <button type="button" className="btn btn-primary" onClick={() => loadProducts()}>
              Try again
            </button>
          </div>
        )}
        {status === 'ready' && <Screen />}
      </main>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <OrderProvider>
        <Kiosk />
      </OrderProvider>
    </ToastProvider>
  )
}
