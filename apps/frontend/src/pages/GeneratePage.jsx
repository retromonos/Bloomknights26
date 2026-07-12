import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Leaf, Zap, AlertTriangle } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { DuckMark } from '../components/Brand.jsx'
import { generateSchedule } from '../lib/scheduler.ts'
import { frequencyToNumber, minutesToHours } from '../lib/devices.ts'
import { appliancePresets } from '../data/applianceData.js'

const REFERENCE_DATE = '2024-01-07'

const stockNameMap = {
  'laundry': 'laundry',
  'dishwasher': 'dishwasher',
  'gaming-pc': 'pc-gaming',
  'ev-charger': 'ev-charging-wall',
  'cooking': 'cooking',
  'device-charging': 'device-charging',
}

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

function buildTimeBlocks(type, start, end) {
  if (!start || !end) return []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const wrapsMidnight = endMinutes <= startMinutes
  const blocks = []
  for (let day = 0; day < 7; day++) {
    const endDay = wrapsMidnight ? (day + 1) % 7 : day
    blocks.push({
      startTime: `${REFERENCE_DATE}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00.000Z`,
      endTime: `${REFERENCE_DATE}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00.000Z`,
      startDayOfWeek: day,
      endDayOfWeek: endDay,
      type,
    })
  }
  return blocks
}

function preferenceToStrategy(preference) {
  switch (preference) {
    case 'cleaner': return 'environmental'
    case 'lower-cost': return 'cost'
    case 'balanced': return 'balanced'
    default: return 'cost'
  }
}

function buildScheduleRequest(state) {
  const configs = state.applianceConfigs || {}
  const devices = (state.selectedAppliances || [])
    .map((id) => {
      const preset = appliancePresets.find((p) => p.id === id)
      const stockName = stockNameMap[id]
      if (!stockName) return null
      const cfg = { ...preset, ...(configs[id] || {}) }
      return {
        stockName,
        frequency: frequencyToNumber(cfg.frequency),
        duration: minutesToHours(cfg.duration),
        isCustom: false,
      }
    })
    .filter(Boolean)

  const avail = state.availability || {}
  const timeBlocks = [
    ...buildTimeBlocks('sleep', avail.sleepStart, avail.sleepEnd),
    ...buildTimeBlocks('work', avail.workStart, avail.workEnd),
    ...buildTimeBlocks('quiet', avail.quietStart, avail.quietEnd),
    ...(avail.customBlocks || []).flatMap((block) => buildTimeBlocks('custom', block.start, block.end)),
  ]

  return { devices, timeBlocks, strategy: preferenceToStrategy(state.preference) }
}

export default function GeneratePage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [tip, setTip] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const apiDone = useRef(false)
  const animDone = useRef(false)

  const householdName = state.account?.name?.split(/\s+/)[0] || 'Your'
  const warnings = state.scheduleResult?.warnings || []

  const markDone = () => {
    if (apiDone.current && animDone.current) {
      update('onboardingComplete', true)
      setDone(true)
    }
  }

  useEffect(() => {
    let cancelled = false
    const request = buildScheduleRequest(state)
    generateSchedule(request)
      .then((result) => {
        if (cancelled) return
        update('scheduleResult', result)
        apiDone.current = true
        markDone()
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Failed to generate schedule')
        apiDone.current = true
        markDone()
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep((value) => value + 1)
        setTip((value) => (value + 1) % tips.length)
      } else {
        animDone.current = true
        markDone()
      }
    }, 900)
    return () => clearTimeout(timer)
  }, [step, done])

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

          {warnings.length > 0 && (
            <div className="ww-plan-warnings">
              {warnings.map((w, i) => (
                <div key={i} className="ww-plan-warning">
                  <AlertTriangle size={14} />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="ww-plan-summary-grid">
            <article className="ww-plan-card ww-plan-card-usage">
              <div className="ww-plan-card-icon"><Zap size={34} /></div>
              <div className="ww-plan-card-copy">
                <strong>{state.scheduleResult?.scheduleItems?.length || 0} tasks</strong>
                <span>scheduled for the week</span>
                <small>optimised for cost and availability</small>
              </div>
            </article>
          </div>

          <div className="ww-plan-footnote">
            <Leaf size={15} />
            <span>You&apos;ll find the full schedule and suggested shifts on your calendar.</span>
          </div>

          <div className="ww-plan-actions">
            <button onClick={() => navigate({ to: '/week' })} className="ww-plan-primary">
              View my schedule <ArrowRight size={16} />
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
          {error && <small className="text-red-500">{error}</small>}
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
