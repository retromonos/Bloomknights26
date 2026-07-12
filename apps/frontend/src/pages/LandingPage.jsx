import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Lock } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

export default function LandingPage() {
  const navigate = useNavigate()
  const { update } = useWattWhen()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState({ loading: false, error: '' })

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '' })
    await new Promise((resolve) => setTimeout(resolve, 350))
    update('account', { name: form.name.trim(), email: form.email.trim(), isDemo: true })
    navigate({ to: '/onboarding/location' })
  }

  return (
    <main className="ww-welcome ww-account-landing">
      <aside className="ww-footprints ww-footprints-left">
        <img className="ww-footprints-art" src="/assets/duck-pattern.png" alt="" aria-hidden="true" />
        <div className="ww-footprint-copy">
          <h1>Small shifts.<br />Big impact.</h1>
          <p>Schedule flexible energy use at cleaner, cheaper times - for your wallet and the planet.</p>
          <Link to="/week" className="ww-sample-link">Explore a sample week <ArrowRight size={14} /></Link>
        </div>
      </aside>
      <section className="ww-welcome-copy">
        <div className="ww-welcome-inner ww-signup-inner">
          <Brand link={false} />
          <div className="ww-signup-grid">
            <form className="ww-signup-card" onSubmit={submit}>
              <span className="ww-kicker">QUICK START</span>
              <h2>Create your account</h2>
              <p>We'll use your name to personalize setup.</p>
              <label>Name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
              <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
              <label>Password<input required type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
              {status.error && <div className="ww-signup-error" role="alert">{status.error}</div>}
              <button disabled={status.loading} type="submit" className="ww-button ww-button-primary">
                {status.loading ? 'Creating account...' : <>Create account <ArrowRight size={16} /></>}
              </button>
              <small><Lock size={11} /> Demo account only. Your password is not sent or stored anywhere.</small>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
