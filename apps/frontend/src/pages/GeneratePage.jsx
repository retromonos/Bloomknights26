import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import SustainabilityTip from '../components/SustainabilityTip.jsx'

const steps = [
  'Reviewing your provider…',
  'Reviewing your appliances…',
  'Reviewing your availability…',
  'Preparing your calendar…',
  'Building your sample plan…',
]

export default function GeneratePage() {
  const { update } = useWattWhen()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1200)
      return () => clearTimeout(timer)
    } else {
      update('onboardingComplete', true)
      setDone(true)
    }
  }, [currentStep])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center p-4 py-16">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">5</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 5 of 5</span>
      </div>

      <h1 className="mb-6 text-xl font-bold text-[var(--sea-ink)]">
        {done ? 'Your plan is ready!' : 'Generating your plan…'}
      </h1>

      <div className="mb-8 w-full space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              i < currentStep ? 'bg-[var(--lagoon)] text-white' :
              i === currentStep ? 'border-2 border-[var(--lagoon)] text-[var(--lagoon)]' :
              'border-2 border-[var(--line)] text-[var(--sea-ink-soft)]'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i < currentStep ? 'text-[var(--sea-ink)]' : i === currentStep ? 'font-medium text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink-soft)]'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {!done && (
        <p className="mb-4 text-center text-xs text-[var(--sea-ink-soft)]">
          This is a simulated loading sequence. No real calculations are being performed.
        </p>
      )}

      {!done && <SustainabilityTip />}

      {done && (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--foam)] p-3 text-center">
              <p className="text-lg font-bold text-[var(--lagoon)]">12</p>
              <p className="text-[11px] text-[var(--sea-ink-soft)]">Scheduled tasks</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--foam)] p-3 text-center">
              <p className="text-lg font-bold text-[var(--lagoon)]">82</p>
              <p className="text-[11px] text-[var(--sea-ink-soft)]">Timing score</p>
            </div>
          </div>
          <button onClick={() => navigate({ to: '/home' })} className="flex w-full items-center justify-center gap-1 rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)]">
            Open my dashboard
          </button>
        </div>
      )}
    </div>
  )
}
