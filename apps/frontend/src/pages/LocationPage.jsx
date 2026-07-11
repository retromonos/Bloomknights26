import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { MapPin, ChevronRight } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { providerPlaceholder, providerOptions } from '../data/providerData.js'

export default function LocationPage() {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    address: state.location?.address || '',
    city: state.location?.city || '',
    stateCode: state.location?.stateCode || '',
    zip: state.location?.zip || '',
    housingType: state.location?.housingType || 'house',
    householdSize: state.location?.householdSize || 2,
  })

  const [provider, setProvider] = useState(state.provider || providerPlaceholder.id)
  const [submitted, setSubmitted] = useState(false)

  const canContinue = form.zip.length >= 5

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleNext = () => {
    update('location', form)
    update('provider', provider)
    navigate({ to: '/onboarding/preferences' })
  }

  const selectedProvider = providerOptions.find((p) => p.id === provider) || providerPlaceholder

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lagoon)] text-xs font-bold text-white">1</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 1 of 5</span>
      </div>

      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">Where do you live?</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">
        We use your location to find your energy provider and estimate rates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="loc-address" className="mb-1 block text-xs font-medium">Street address</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]" aria-hidden="true" />
            <input id="loc-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" className="w-full rounded-lg border border-[var(--line)] py-2 pl-9 pr-3 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-2">
            <label htmlFor="loc-city" className="mb-1 block text-xs font-medium">City</label>
            <input id="loc-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="loc-state" className="mb-1 block text-xs font-medium">State</label>
            <input id="loc-state" value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} maxLength={2} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label htmlFor="loc-zip" className="mb-1 block text-xs font-medium">ZIP</label>
            <input id="loc-zip" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value.replace(/\D/g, '').slice(0, 5) })} inputMode="numeric" maxLength={5} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="loc-housing" className="mb-1 block text-xs font-medium">Housing type</label>
          <select id="loc-housing" value={form.housingType} onChange={(e) => setForm({ ...form, housingType: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
            <option value="house">House</option>
            <option value="apartment">Apartment / Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="mobile">Mobile home</option>
          </select>
        </div>

        <div>
          <label htmlFor="loc-size" className="mb-1 block text-xs font-medium">People in household</label>
          <input id="loc-size" type="number" min={1} max={10} value={form.householdSize} onChange={(e) => setForm({ ...form, householdSize: Number(e.target.value) })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
        </div>

        {!submitted && (
          <button type="submit" disabled={!canContinue} className="mt-2 w-full rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-[var(--lagoon-deep)]">
            Find my provider
          </button>
        )}
      </form>

      {submitted && (
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--foam)] p-4">
          <p className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">Your energy provider</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--sea-ink)]">{selectedProvider.name}</p>
              <p className="text-xs text-[var(--sea-ink-soft)]">{selectedProvider.planName} · {selectedProvider.planType}</p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Auto-detected</span>
          </div>

          <label htmlFor="loc-provider" className="mt-3 mb-1 block text-xs font-medium text-[var(--sea-ink-soft)]">Not right? Choose manually:</label>
          <select id="loc-provider" value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm">
            {providerOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name} – {p.planName}</option>
            ))}
          </select>

          <button onClick={handleNext} className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-[var(--lagoon)] py-3 text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)]">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
