import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

export default function LocationPage() {
  const { state, update } = useWattWhen()
  const firstName = state.account?.name?.trim().split(/\s+/)[0]
  const [zip, setZip] = useState(state.location?.zip || '')
  const [submitted, setSubmitted] = useState(Boolean(state.locationProvidersReady))
  const [error, setError] = useState("")
  const canContinue = zip.length === 5

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const detectedCountyRef = useRef(null)

  function countyStyle(feature) {
    const name = feature.getProperty('NAME')
    const isDetected = name === detectedCountyRef.current
    return {
      clickable: false,
      fillColor: isDetected ? '#BAE371' : '#e8ecd9',
      fillOpacity: isDetected ? 0.45 : 0.15,
      strokeColor: isDetected ? '#76C20C' : '#4b5563',
      strokeWeight: isDetected ? 2.5 : 1,
      strokeOpacity: isDetected ? 0.9 : 0.5,
    }
  }

  useEffect(() => {
    let cancelled = false

    const initMap = async () => {
      setOptions({
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        v: 'weekly',
      })

      const { Map } = await importLibrary('maps')
      const { Geocoder } = await importLibrary('geocoding')
      const { Marker } = await importLibrary('marker')

      if (cancelled || !mapRef.current) return

      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 27.6, lng: -81.5 },
        zoom: 7,
        mapTypeControl: false,
      })

      mapInstance.current.data.loadGeoJson('/fl-counties.json')
      mapInstance.current.data.setStyle(countyStyle)

      const geocoder = new Geocoder()

      mapInstance.current.addListener('click', async (e) => {
        if (!e.latLng) return

        if (markerRef.current) {
          markerRef.current.setPosition(e.latLng)
        } else {
          markerRef.current = new Marker({
            position: e.latLng,
            map: mapInstance.current,
          })
        }

        const { results } = await geocoder.geocode({ location: e.latLng })
        const zipComp = results[0]?.address_components?.find(c =>
          c.types.includes('postal_code')
        )
        if (zipComp) {
          setZip(zipComp.long_name)
          setSubmitted(false)
          update('locationProvidersReady', false)
        }
      })
    }

    initMap()

    return () => { cancelled = true }
  }, [])

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
    setError(false)

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
    if(resJson && resJson.county) {
      update('detectedCounty', resJson.county)
      detectedCountyRef.current = resJson.county
      if (mapInstance.current) mapInstance.current.data.setStyle(countyStyle)
      setSubmitted(true)
      update('locationProvidersReady', true)
    } else {
      setError("Could not find your county. Please input a valid Florida ZIP code.")
    }
    console.log(resJson.county)
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-[var(--lagoon)] text-xs font-bold text-white">1</span>
        <span className="text-xs font-medium text-[var(--sea-ink-soft)]">Step 1 of 4</span>
      </div>

      {firstName && <p className="ww-personal-greeting">Hi, {firstName}.</p>}
      <h1 className="mb-1 text-xl font-bold text-[var(--sea-ink)]">What's your ZIP code?</h1>
      <p className="mb-5 text-sm text-[var(--sea-ink-soft)]">We'll detect your county and show the electricity providers available there.</p>

      <div
        ref={mapRef}
        style={{ width: '100%', height: 'clamp(260px, 38vh, 390px)', borderRadius: 8, border: '2px solid #000', marginBottom: '1.25rem' }}
      />

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
        {error != "" && <div className='text-red-700'>{error}</div>}
        <button type="submit" disabled={!canContinue} className="w-full bg-[var(--lagoon)] py-3 text-sm font-semibold disabled:opacity-40">
          Detect my county
        </button>
        
      </form>

    </div>
  )
}
