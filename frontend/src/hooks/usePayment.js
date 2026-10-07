// Shared "send the payment" logic for the Cash, QR and Card screens.

import { useState } from 'react'
import { createTransaction } from '../api/client.js'
import { useOrder, useToast } from '../state/OrderContext.jsx'
import { buildPaymentRequest } from '../utils/payment.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function usePayment(paymentMethod) {
  const { state, goTo, setTransaction } = useOrder()
  const showToast = useToast()
  const [isPaying, setIsPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function showError(message) {
    setErrorMessage(message)
    showToast(message, 'error')
  }

  // processingMs simulates the card terminal before the payment is sent.
  async function pay({ amountPaid = null, processingMs = 0 } = {}) {
    if (isPaying) return
    setIsPaying(true) // the screens disable every button while this is true: no double payment
    setErrorMessage('')
    try {
      await wait(processingMs)
      const receipt = await createTransaction(buildPaymentRequest(state.cart, paymentMethod, amountPaid))
      setTransaction(receipt)
      showToast('Transaction completed successfully', 'success')
      goTo('success')
    } catch (error) {
      showError(error.message) // stay on the payment screen; nothing was paid
      setIsPaying(false)
    }
  }

  return { isPaying, errorMessage, setErrorMessage, showError, pay }
}
