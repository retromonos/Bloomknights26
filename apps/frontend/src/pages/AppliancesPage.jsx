import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Check, Plus, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { appliancePresets } from '../data/applianceData.js'

export default function AppliancesPage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(state.selectedAppliances || [])
  const [editing, setEditing] = useState(null)
  const [configs, setConfigs] = useState(state.applianceConfigs || {})
  const [showCustom, setShowCustom] = useState(false)

  const toggleAppliance = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleNext = () => {
    update('selectedAppliances', selected)
    update('applianceConfigs', configs)
    navigate({ to: '/onboarding/availability' })
  }

  const saveConfig = (id, cfg) => {
    setConfigs((prev) => ({ ...prev, [id]: cfg }))
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">3</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 3 of 5</span>
      </div>

      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">Select your appliances</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">Choose the appliances you'd like us to schedule. You can customise details for each one.</p>

      <div className="space-y-2">
        {appliancePresets.map((ap) => {
          const isSelected = selected.includes(ap.id)
          return (
            <div key={ap.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isSelected ? 'border-[var(--lagoon)] bg-[var(--foam)]' : 'border-[var(--line)]'}`}>
              <input type="checkbox" id={`ap-${ap.id}`} checked={isSelected} onChange={() => toggleAppliance(ap.id)} className="h-4 w-4 accent-[var(--lagoon)]" />
              <label htmlFor={`ap-${ap.id}`} className="flex flex-1 cursor-pointer items-center gap-3">
                <span className="text-lg">{ap.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--sea-ink)]">{ap.name}</p>
                  <p className="text-[11px] text-[var(--sea-ink-soft)]">{ap.estimatedKwh} kWh (placeholder) · {ap.frequency}</p>
                </div>
              </label>
              {isSelected && (
                <button onClick={() => setEditing(ap)} className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--lagoon-deep)] hover:bg-[var(--sand)]">
                  Edit
                </button>
              )}
              {isSelected && <Check size={16} className="text-[var(--lagoon)]" />}
            </div>
          )
        })}

        <button onClick={() => setShowCustom(true)} className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--line)] p-3 text-sm text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)] hover:text-[var(--lagoon)]">
          <Plus size={16} /> Add custom appliance
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">{selected.length} appliance{selected.length !== 1 ? 's' : ''} selected</p>

      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate({ to: '/onboarding/preferences' })} className="flex items-center gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--sea-ink)]">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={handleNext} disabled={selected.length === 0} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[var(--lagoon-deep)]">
          Continue <ChevronRight size={16} />
        </button>
      </div>

      {/* Appliance editor dialog */}
      {editing && (
        <ApplianceEditor appliance={editing} config={configs[editing.id] || editing} onSave={(cfg) => saveConfig(editing.id, cfg)} onClose={() => setEditing(null)} />
      )}

      {/* Custom appliance dialog */}
      {showCustom && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowCustom(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Add custom appliance">
            <h2 className="mb-4 text-lg font-semibold">Add custom appliance</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const id = `custom-${Date.now()}`
              setSelected((prev) => [...prev, id])
              setConfigs((prev) => ({ ...prev, [id]: { name: fd.get('name'), estimatedKwh: Number(fd.get('kwh')), frequency: fd.get('freq'), duration: 60, flexibility: 'anytime', icon: '⚡' } }))
              setShowCustom(false)
            }} className="space-y-3">
              <input name="name" placeholder="Appliance name" required className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="kwh" type="number" step="0.1" placeholder="Est. kWh per use" defaultValue="1.0" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <select name="freq" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
                <option>Daily</option><option>3x per week</option><option>Weekly</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Add</button>
                <button type="button" onClick={() => setShowCustom(false)} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

function ApplianceEditor({ appliance, config, onSave, onClose }) {
  const [form, setForm] = useState({
    name: config.name || appliance.name,
    duration: config.duration || appliance.duration,
    frequency: config.frequency || appliance.frequency,
    preferredTime: config.preferredTime || appliance.preferredTime || '10:00',
    earliestTime: config.earliestTime || appliance.earliestTime || '00:00',
    latestTime: config.latestTime || appliance.latestTime || '23:59',
    flexibility: config.flexibility || appliance.flexibility,
  })

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-96 lg:rounded-none" role="dialog" aria-modal="true" aria-label={`Edit ${appliance.name}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{appliance.icon} {appliance.name}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Duration (minutes)</label>
            <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Frequency</label>
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              <option>Daily</option><option>3x per week</option><option>Weekly</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Preferred time</label>
            <input type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Earliest</label>
              <input type="time" value={form.earliestTime} onChange={(e) => setForm({ ...form, earliestTime: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Latest</label>
              <input type="time" value={form.latestTime} onChange={(e) => setForm({ ...form, latestTime: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Flexibility</label>
            <select value={form.flexibility} onChange={(e) => setForm({ ...form, flexibility: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              <option value="fixed">Fixed (must run at this time)</option>
              <option value="within-1h">Within 1 hour</option>
              <option value="within-3h">Within 3 hours</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <p className="text-[11px] text-[var(--sea-ink-soft)]">Electricity use placeholder — verified calculations will appear here later.</p>

          <button onClick={() => onSave(form)} className="w-full rounded-xl bg-[var(--lagoon)] py-2.5 text-sm font-semibold text-white">
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
