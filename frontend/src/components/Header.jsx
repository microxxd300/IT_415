import { useState } from 'react'

export default function Header() {
  const [logoFailed, setLogoFailed] = useState(false) // fall back to "CS" if the logo file is missing

  return (
    <header className="kiosk-header">
      <span className={`brand-mark ${logoFailed ? '' : 'has-logo'}`} aria-hidden="true">
        {logoFailed ? 'CS' : <img src="/assets/logo/logo.png" alt="" onError={() => setLogoFailed(true)} />}
      </span>
      <h1 className="brand-name">
        Campus Store <span className="brand-tagline">· Self-service kiosk</span>
      </h1>
    </header>
  )
}
