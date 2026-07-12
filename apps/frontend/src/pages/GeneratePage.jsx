import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, Leaf, PiggyBank, Zap } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { DuckMark } from '../components/Brand.jsx'
import { providerOptions } from '../data/providerData.js'
import { savingsSummary } from '../data/savingsData.js'
import { weeklySummary } from '../data/scheduleData.js'

const steps = [
  'Matching your electricity provider',
  'Estimating appliance electricity use',
  'Mapping unavailable times',
  'Comparing candidate time windows',
  'Checking household task overlap',
  'Building your weekly schedule',
]

const tips = [
  'Dishwashers are generally most efficient when run with a full load.',
  'Avoiding several high-energy tasks at once can reduce household demand spikes.',
  'WattWhen never moves tasks that you marked as fixed.',
  'Cold-water laundry cycles may reduce electricity used for water heating.',
  'Sleep mode can reduce unnecessary computer electricity use.',
  'Charging an EV overnight often avoids the busiest household demand window.',
]

export default function GeneratePage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [tip, setTip] = useState(0)
  const [done, setDone] = useState(false)

  const householdName = state.account?.name?.split(/\s+/)[0] || 'Your'
  const selectedAppliances = state.selectedAppliances?.length || 0
  const selectedProviderId = state.providerSelection || state.provider
  const providerName = providerOptions.find((provider) => provider.id === selectedProviderId)?.name || 'your provider'
  const monthlySavings = Math.round(savingsSummary.thisMonth)
  const weeklyUsage = weeklySummary.totalKwh
  const shiftedKwh = weeklySummary.shiftedKwh
  const baselineWeeklyUsage = Math.round(weeklyUsage + shiftedKwh)

  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep((value) => value + 1)
        setTip((value) => (value + 1) % tips.length)
      } else {
        update('onboardingComplete', true)
        setDone(true)
      }
    }, 900)
    return () => clearTimeout(timer)
  }, [step, done, update])

  if (done) {
    return (
      <div className="ww-generate-page ww-generate-complete">
        <div className="ww-generate-complete-shell">
          <div className="ww-plan-ready-mark">
            <DuckMark size={74} />
            <span className="ww-kicker">PLAN READY</span>
          </div>
          <h1>{householdName} is ready to save.</h1>
          <p className="ww-plan-intro">
            Based on your location, provider, appliance mix, and schedule preferences, we mapped out a week that uses cleaner and cheaper energy hours more often.
          </p>
          <p className="ww-plan-context">
            Your plan reflects {providerName}, {selectedAppliances} selected appliances, and the timing windows you marked as available during onboarding.
          </p>

          <div className="ww-plan-summary-grid">
            <article className="ww-plan-card ww-plan-card-savings">
              <div className="ww-plan-card-icon"><PiggyBank size={34} /></div>
              <div className="ww-plan-card-copy">
                <strong>${monthlySavings}</strong>
                <span>estimated monthly savings</span>
                <small>on your electric bill</small>
              </div>
            </article>

            <article className="ww-plan-card ww-plan-card-usage">
              <div className="ww-plan-card-icon"><Zap size={34} /></div>
              <div className="ww-plan-card-copy">
                <strong>{weeklyUsage.toFixed(1)} kWh</strong>
                <span>estimated weekly usage</span>
                <small>down from {baselineWeeklyUsage} kWh/week</small>
                <em>{shiftedKwh.toFixed(0)} kWh shifted to cleaner energy hours</em>
              </div>
            </article>

            <article className="ww-plan-card ww-plan-card-peak">
              <div className="ww-plan-card-icon"><Zap size={34} /></div>
              <div className="ww-plan-card-copy">
                <strong>22%</strong>
                <span>less peak-hour usage</span>
                <small>Your flexible tasks move into cleaner, cheaper time windows.</small>
              </div>
            </article>
          </div>

          <div className="ww-plan-footnote">
            <Leaf size={15} />
            <span>You&apos;ll find the full schedule, suggested shifts, and savings breakdown on your dashboard.</span>
          </div>

          <div className="ww-plan-actions">
            <button onClick={() => navigate({ to: '/home' })} className="ww-plan-primary">
              Open my dashboard <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="ww-generate-page">
      <section className="ww-generate-progress">
        <div>
          <span className="ww-kicker">BUILDING YOUR PLAN</span>
          <h1>Finding better electricity windows...</h1>
          <div className="ww-generate-steps">
            {steps.map((label, index) => (
              <div className={index < step ? 'complete' : index === step ? 'active' : ''} key={label}>
                <i>{index < step ? <Check size={12} /> : index === step ? <b /> : null}</i>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="ww-generate-bar"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          <small>Simulated recommendations using placeholder electricity data.</small>
        </div>
      </section>
      <aside className="ww-generate-tips">
        <DuckMark size={68} inverse />
        <span>Did you know?</span>
        <p key={tip} className="ww-tip-transition">{tips[tip]}</p>
        <div>{tips.map((_, index) => <i className={index === tip ? 'active' : ''} key={index} />)}</div>
      </aside>
    </div>
  )
}
