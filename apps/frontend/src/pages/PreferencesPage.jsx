import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Leaf, DollarSign, Scale, ChevronRight, ChevronLeft } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

const options = [
  { id: 'cleaner', label: 'Cleaner timing', desc: 'Prioritise lower-carbon time windows', icon: Leaf, color: 'text-green-600' },
  { id: 'lower-cost', label: 'Lower-cost timing', desc: 'Prioritise cheapest time-of-use rates', icon: DollarSign, color: 'text-amber-600' },
  { id: 'balanced', label: 'Balanced', desc: 'Optimise for both savings and sustainability', icon: Scale, color: 'text-[var(--lagoon)]' },
]

export default function PreferencesPage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()

  const [preference, setPreference] = useState(state.preference || 'balanced')
  const [slider, setSlider] = useState(state.convenienceSlider ?? 50)

  const handleNext = () => {
    update('preference', preference)
    update('convenienceSlider', slider)
    navigate({ to: '/onboarding/appliances' })
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">2</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 2 of 5</span>
      </div>

      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">What matters most?</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">This helps us balance your schedule between cost savings and sustainability.</p>

      <fieldset className="space-y-2">
        <legend className="sr-only">Optimisation preference</legend>
        {options.map((opt) => {
          const Icon = opt.icon
          const isActive = preference === opt.id
          return (
            <label key={opt.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${isActive ? 'border-[var(--lagoon)] bg-[var(--foam)]' : 'border-[var(--line)] hover:border-[var(--lagoon-deep)]'}`}>
              <input type="radio" name="preference" value={opt.id} checked={isActive} onChange={() => setPreference(opt.id)} className="sr-only" />
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ${opt.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--sea-ink)]">{opt.label}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">{opt.desc}</p>
              </div>
              <div className={`mt-1 h-4 w-4 rounded-full border-2 ${isActive ? 'border-[var(--lagoon)] bg-[var(--lagoon)]' : 'border-gray-300'}`}>
                {isActive && <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-white" />}
              </div>
            </label>
          )
        })}
      </fieldset>

      <div className="mt-6">
        <label htmlFor="conv-slider" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">Convenience vs. sustainability</label>
        <input id="conv-slider" type="range" min={0} max={100} value={slider} onChange={(e) => setSlider(Number(e.target.value))} className="w-full accent-[var(--lagoon)]" />
        <div className="flex justify-between text-[11px] text-[var(--sea-ink-soft)]">
          <span>Max convenience</span>
          <span>Max sustainability</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate({ to: '/onboarding/location' })} className="flex items-center gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--sea-ink)]">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={handleNext} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)]">
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
