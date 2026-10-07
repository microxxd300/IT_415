// On-screen number pad, so the customer never needs a keyboard.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

const LABELS = { clear: 'Clear', back: '⌫' }
const SPOKEN = { clear: 'Clear amount', back: 'Delete last digit' }

export default function Keypad({ onKey, disabled = false }) {
  return (
    <div className="keypad" role="group" aria-label="Number keypad">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`keypad-key ${LABELS[key] ? 'keypad-action' : ''}`}
          onClick={() => onKey(key)}
          disabled={disabled}
          aria-label={SPOKEN[key] ?? key}
        >
          {LABELS[key] ?? key}
        </button>
      ))}
    </div>
  )
}
