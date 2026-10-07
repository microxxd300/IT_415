import { useOrder } from '../state/OrderContext.jsx'

const STEPS = [
  { label: 'Order', screens: ['selection'] },
  { label: 'Review', screens: ['summary'] },
  { label: 'Payment', screens: ['method', 'cash', 'qr', 'card'] },
  { label: 'Receipt', screens: ['success', 'receipt'] },
]

export default function StepIndicator() {
  const { state } = useOrder()
  const current = STEPS.findIndex((step) => step.screens.includes(state.screen))

  return (
    <ol className="steps" aria-label="Progress">
      {STEPS.map((step, index) => {
        const status = index < current ? 'is-done' : index === current ? 'is-current' : ''
        return (
          <li key={step.label} className={`step ${status}`} aria-current={index === current ? 'step' : undefined}>
            <span className="step-number">{index < current ? '✓' : index + 1}</span>
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}
