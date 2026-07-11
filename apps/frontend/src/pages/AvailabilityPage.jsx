import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

const toggleDefs = [
  { key: 'avoidPeak', label: 'Avoid peak hours when possible' },
  { key: 'preferRenewable', label: 'Prefer renewable-heavy time slots' },
  { key: 'quietHours', label: 'Respect quiet hours' },
  { key: 'weekendFlex', label: 'More flexible on weekends' },
  { key: 'notifyBefore', label: 'Notify before running appliances' },
  { key: 'autoAccept', label: 'Auto-accept schedule suggestions' },
]

export default function AvailabilityPage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const avail = state.availability || {}

  const [sleepStart, setSleepStart] = useState(avail.sleepStart || '23:00')
  const [sleepEnd, setSleepEnd] = useState(avail.sleepEnd || '07:00')
  const [workStart, setWorkStart] = useState(avail.workStart || '09:00')
  const [workEnd, setWorkEnd] = useState(avail.workEnd || '17:00')
  const [quietStart, setQuietStart] = useState(avail.quietStart || '22:00')
  const [quietEnd, setQuietEnd] = useState(avail.quietEnd || '08:00')
  const [customBlocks, setCustomBlocks] = useState(avail.customBlocks || [])
  const [toggles, setToggles] = useState(avail.toggles || {
    avoidPeak: true, preferRenewable: true, quietHours: true,
    weekendFlex: true, notifyBefore: true, autoAccept: false,
  })

  const addBlock = () => {
    setCustomBlocks((prev) => [...prev, { id: Date.now(), label: '', start: '12:00', end: '13:00' }])
  }

  const removeBlock = (id) => {
    setCustomBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const updateBlock = (id, field, value) => {
    setCustomBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b))
  }

  const handleNext = () => {
    update('availability', { sleepStart, sleepEnd, workStart, workEnd, quietStart, quietEnd, customBlocks, toggles })
    navigate({ to: '/onboarding/generate' })
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">4</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 4 of 5</span>
      </div>

      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">When are you unavailable?</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">We'll avoid scheduling anything during these times.</p>

      <div className="space-y-5">
        {/* Sleep */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Sleep schedule</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="sleep-start" className="mb-1 block text-xs font-medium">Bedtime</label>
              <input id="sleep-start" type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="sleep-end" className="mb-1 block text-xs font-medium">Wake up</label>
              <input id="sleep-end" type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        {/* Work */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Work or class hours</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="work-start" className="mb-1 block text-xs font-medium">Start</label>
              <input id="work-start" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="work-end" className="mb-1 block text-xs font-medium">End</label>
              <input id="work-end" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        {/* Quiet hours */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Quiet hours</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="quiet-start" className="mb-1 block text-xs font-medium">Start</label>
              <input id="quiet-start" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="quiet-end" className="mb-1 block text-xs font-medium">End</label>
              <input id="quiet-end" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        {/* Custom blocks */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Custom unavailable blocks</h2>
          {customBlocks.map((block) => (
            <div key={block.id} className="mb-2 flex items-end gap-2">
              <div className="flex-1">
                <input value={block.label} onChange={(e) => updateBlock(block.id, 'label', e.target.value)} placeholder="Label" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              </div>
              <input type="time" value={block.start} onChange={(e) => updateBlock(block.id, 'start', e.target.value)} className="w-24 rounded-lg border border-[var(--line)] px-2 py-2 text-sm" />
              <span className="pb-2 text-xs text-[var(--sea-ink-soft)]">to</span>
              <input type="time" value={block.end} onChange={(e) => updateBlock(block.id, 'end', e.target.value)} className="w-24 rounded-lg border border-[var(--line)] px-2 py-2 text-sm" />
              <button onClick={() => removeBlock(block.id)} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label="Remove block"><X size={16} /></button>
            </div>
          ))}
          <button onClick={addBlock} className="flex items-center gap-1 text-sm font-medium text-[var(--lagoon-deep)] hover:underline">
            <Plus size={14} /> Add block
          </button>
        </section>

        {/* Toggles */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Preferences</h2>
          <div className="space-y-2">
            {toggleDefs.map((t) => (
              <label key={t.key} className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2">
                <span className="text-sm text-[var(--sea-ink)]">{t.label}</span>
                <input type="checkbox" checked={toggles[t.key] || false} onChange={(e) => setToggles({ ...toggles, [t.key]: e.target.checked })} className="h-4 w-4 accent-[var(--lagoon)]" />
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate({ to: '/onboarding/appliances' })} className="flex items-center gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--sea-ink)]">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={handleNext} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)]">
          Generate my plan <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
