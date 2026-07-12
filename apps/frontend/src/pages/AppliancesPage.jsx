import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Check, Plus, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { appliancePresets } from '../data/applianceData.js'
import { getDevices, createDevice, createDeviceInstance, frequencyToNumber, minutesToHours } from '../lib/devices.ts'

const stockNameMap = {
  'laundry': 'laundry',
  'dishwasher': 'dishwasher',
  'gaming-pc': 'pc-gaming',
  'ev-charger': 'ev-charging-wall',
  'cooking': 'cooking',
  'device-charging': 'device-charging',
}

export default function AppliancesPage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(state.selectedAppliances || [])
  const [editing, setEditing] = useState(null)
  const [configs, setConfigs] = useState(state.applianceConfigs || {})
  const [showCustom, setShowCustom] = useState(false)
  const [backendDevices, setBackendDevices] = useState([])

  useEffect(() => {
    getDevices().then(setBackendDevices)
  }, [])

  useEffect(() => {
    setSelected(state.selectedAppliances || [])
  }, [state.selectedAppliances])

  const toggleAppliance = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    setSelected(next)
    update('selectedAppliances', next)
  }

  const handleNext = async () => {
    update('selectedAppliances', selected)
    update('applianceConfigs', { ...(state.applianceConfigs || {}), ...configs })

    for (const id of selected) {
      const cfg = { ...appliancePresets.find((p) => p.id === id), ...(configs[id] || {}) }
      const stockName = stockNameMap[id]

      if (stockName) {
        const device = backendDevices.find((d) => d.stockName === stockName)
        if (device) {
          await createDeviceInstance({
            deviceId: device.id,
            frequency: frequencyToNumber(cfg.frequency),
            duration: minutesToHours(cfg.duration),
          })
        }
      } else {
        const custom = await createDevice({ name: cfg.name, powerDraw: cfg.estimatedKwh || 1.0 })
        await createDeviceInstance({
          deviceId: custom.id,
          frequency: frequencyToNumber(cfg.frequency),
          duration: minutesToHours(cfg.duration),
        })
      }
    }

    navigate({ to: '/onboarding/availability' })
  }

  const saveConfig = (id, cfg) => {
    setConfigs((prev) => ({ ...prev, [id]: cfg }))
    update('applianceConfigs', { ...(state.applianceConfigs || {}), [id]: cfg })
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">3</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 2 of 4</span>
      </div>

      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">Select your appliances</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">Choose the appliances you'd like us to schedule. You can customise details for each one.</p>

      <div className="ww-appliance-grid">
        {appliancePresets.map((ap) => {
          const isSelected = selected.includes(ap.id)
          return (
            <div key={ap.id} className={`ww-appliance-card ${isSelected ? 'selected' : ''}`}>
              <input type="checkbox" id={`ap-${ap.id}`} checked={isSelected} onChange={() => toggleAppliance(ap.id)} className="ww-appliance-check accent-[var(--lagoon)]" />
              <label htmlFor={`ap-${ap.id}`} className="flex flex-1 cursor-pointer flex-col items-center text-center">
                <span className="text-3xl">{ap.icon}</span>
                <div className="mt-2 flex-1">
                  <p className="text-sm font-medium text-[var(--sea-ink)]">{ap.name}</p>
                  <p className="text-[11px] text-[var(--sea-ink-soft)]">{ap.estimatedKwh} kWh (placeholder) · {ap.frequency}</p>
                </div>
              </label>
              {isSelected && (
                <button onClick={() => setEditing(ap)} className="mt-2 px-2 py-1 text-[10px] font-bold uppercase text-[var(--lagoon-deep)]">
                  Edit
                </button>
              )}
              {isSelected && <Check size={15} className="ww-card-checkmark" />}
            </div>
          )
        })}

        <button onClick={() => setShowCustom(true)} className="ww-appliance-card ww-add-appliance flex items-center justify-center gap-1 text-sm text-[var(--sea-ink-soft)]">
          <Plus size={16} /> Add custom appliance
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">{selected.length} appliance{selected.length !== 1 ? 's' : ''} selected</p>

      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate({ to: '/onboarding/location' })} className="flex items-center gap-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--sea-ink)]">
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
              const customConfig = { name: fd.get('name'), estimatedKwh: Number(fd.get('kwh')), frequency: fd.get('freq'), duration: 60, flexibility: 'anytime', icon: '⚡' }
              const nextSelected = [...selected, id]
              setSelected(nextSelected)
              setConfigs((prev) => ({ ...prev, [id]: customConfig }))
              update('selectedAppliances', nextSelected)
              update('applianceConfigs', { ...(state.applianceConfigs || {}), [id]: customConfig })
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
