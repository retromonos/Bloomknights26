import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Lock } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import handleSignup, { handleSignin } from '#/lib/auth.js'

export default function LandingPage() {
  const navigate = useNavigate()
  const { update } = useWattWhen()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState({ loading: false, error: '' })
  const [signInInstead, setSignInInstead] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '' })

    const acc = { name: form.name.trim(), email: form.email.trim(), password: form.password.trim()}
    
    if(signInInstead) {
      const signin = await handleSignin(acc.email, acc.password, acc.name)
      if(signin) {
        update('account', { name: signin.user.name, email: signin.user.email, token: signin.token, isDemo: true })
        navigate({to: "/home"})
      }
    } else {
      const signup = await handleSignup(acc.email, acc.password, acc.name)
      update('account', { name: signup.user.name, email: signup.user.email, token: signup.token, isDemo: true })
      navigate({ to: '/onboarding/location' })
    }

    
  }

  return (
    <main className="ww-welcome ww-account-landing">
      <aside className="ww-footprints ww-footprints-left">
        <img className="ww-footprints-art" src="/assets/duck-pattern.png" alt="" aria-hidden="true" />
        <div className="ww-footprint-copy">
          <h1>Save watts.<br />Save money.</h1>
          <p>Schedule flexible energy use at cleaner, cheaper times — for your wallet and the planet.</p>
        </div>
      </aside>
      <section className="ww-welcome-copy">
        <div className="ww-welcome-inner ww-signup-inner">
          <Brand link={false} />
          <div className="ww-signup-grid">
            <form className="ww-signup-card" onSubmit={submit}>
              <h2>{signInInstead ? "Sign In" : "Create your account"}</h2>
              {!signInInstead && <label>Name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}
              <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
              <label>Password<input required type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
              {status.error && <div className="ww-signup-error" role="alert">{status.error}</div>}
              <button disabled={status.loading} type="submit" className="ww-button ww-button-primary">
                {status.loading ? 'Processing...' : signInInstead ? <>Sign In <ArrowRight size={16} /></> : <>Create account <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
        <button type="button" className="ww-button" onClick={() => setSignInInstead(!signInInstead)}>
          {signInInstead ? "Click to Sign Up" : "Sign In Instead"}
        </button>
      </section>
    </main>
  )
}
