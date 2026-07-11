import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

export default function LocationPage() {
  const { state, update } = useWattWhen()
  const firstName = state.account?.name?.trim().split(/\s+/)[0]
  const [zip, setZip] = useState(state.location?.zip || '')
  const [submitted, setSubmitted] = useState(Boolean(state.locationProvidersReady))
  const canContinue = zip.length === 5

  const handleZipChange = (event) => {
    const nextZip = event.target.value.replace(/\D/g, '').slice(0, 5)
    setZip(nextZip)
    setSubmitted(false)
    update('locationProvidersReady', false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canContinue) return
    update('location', { ...state.location, zip })
    update('locationProvidersReady', true)
    setSubmitted(true)

    console.log(state.account?.token)

    const countyRes = await fetch("http://localhost:3001/api/zip", {
      method: "POST",
      body: JSON.stringify({
        zipCode: zip
      }),
      headers: {
        'Authorization': `Bearer ${state.account?.token?.trim().split(/\s+/)[0]}`,
        'Content-Type': 'application/json'
      }
    })

    const resJson = await countyRes.json()
    console.log(resJson.county)
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-[var(--lagoon)] text-xs font-bold text-white">1</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 1 of 4</span>
      </div>

      {firstName && <p className="ww-personal-greeting">Hi, {firstName}.</p>}
      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">What’s your ZIP code?</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">We’ll detect your county and show the electricity providers available there.</p>

      <div className="ww-map-placeholder ww-map-placeholder-large" role="img" aria-label="Google Maps county preview placeholder">
        <div className="ww-map-grid" />
        <span className="ww-map-road road-one" />
        <span className="ww-map-road road-two" />
        <MapPin size={38} />
        <small>{submitted ? `County detected for ${zip}` : 'County map preview'}</small>
      </div>

      <form onSubmit={handleSubmit} className="ww-zip-form">
        <label htmlFor="location-zip">ZIP code</label>
        <div className="ww-zip-input-wrap">
          <MapPin size={20} aria-hidden="true" />
          <input
            id="location-zip"
            value={zip}
            onChange={handleZipChange}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="Enter 5-digit ZIP"
            aria-describedby="zip-help"
          />
        </div>
        <small id="zip-help">Your ZIP is only used to identify your county and provider options.</small>
        <button type="submit" disabled={!canContinue} className="w-full bg-[var(--lagoon)] py-3 text-sm font-semibold disabled:opacity-40">
          Detect my county
        </button>
      </form>

    </div>
  )
}
