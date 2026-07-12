import { Outlet, useNavigate, useRouterState, useSearch } from '@tanstack/react-router'
import { Check, ChevronRight, Minus } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import { appliancePresets } from '../data/applianceData.js'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { providerOptions } from '../data/providerData.js'
import { useEffect, useState } from 'react'
import { GetCountyUtilities } from '#/lib/utilities.js'

const steps = [
  ['/onboarding/location', 'Location'],
  ['/onboarding/appliances', 'Appliances'],
  ['/onboarding/availability', 'Schedule'],
  ['/onboarding/priority', 'Priority'],
]

const frequencyOptions = ['Daily', '5 times per week', '3x per week', '2 times per week', 'Once per week', 'Twice per month']
const schedulePreferences = [
  ['avoidPeak', 'Avoid peak hours when possible'], ['preferRenewable', 'Prefer renewable-heavy time slots'],
  ['quietHours', 'Respect quiet hours'], ['weekendFlex', 'More flexible on weekends'],
  ['notifyBefore', 'Notify before running appliances'], ['autoAccept', 'Auto-accept schedule suggestions'],
]

function CountyProviderPanel({ open }) {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const selected = state.providerSelection || state.provider || ''
  const choose = (value) => update('providerSelection', value)
  const continueToAppliances = async () => {
    update('provider', selected === 'generic' ? null : selected)
    update('useGenericProviderEstimate', selected === 'generic')

    foundUtilities.find((u)=>{
      return u.id === selected
    }).name

    await fetch("http://localhost:3001/api/onboard", {
      method: "POST",
      body: JSON.stringify({county: state.detectedCounty, utilityCompany: foundUtilities.find((u)=>{return u.id === selected}).name}),
      headers: {
        'Authorization': `Bearer ${state.account?.token?.trim().split(/\s+/)[0]}`,
        'Content-Type': 'application/json'
      }
    })

    navigate({ to: '/onboarding/appliances' })
  }

  const [foundUtilities, setFoundUtilities] = useState([])

  useEffect(() => {
    console.log("county changed")

    async function a() {
      console.log("state:", state.detectedCounty)
      const utils = await GetCountyUtilities(state.detectedCounty, state.account?.token?.trim().split(/\s+/)[0])
      console.log(utils)
      if(utils)
        setFoundUtilities(utils.utilities ?? [])
    }

    void a()
  },[state.detectedCounty])

  return (
    <aside className={`ww-info-panel ww-provider-panel${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open ? '' : undefined}>
      <span className="ww-kicker">LOCATION FOUND</span>
      <h2>{state.detectedCounty || '________'} County</h2>
      <p className="ww-county-caption">These are your county providers.</p>
      <p>Select the electricity provider shown on your bill.</p>
      <div className="ww-provider-list">
        {foundUtilities.map((provider) => (
          <label className={selected === provider.id ? 'selected' : ''} key={provider.id}>
            <input type="radio" name="county-provider" checked={selected === provider.id} onChange={() => choose(provider.id)} />
            <span><strong>{provider.name}</strong></span>
          </label>
        ))}
        <label className={selected === 'generic' ? 'selected' : ''}>
          <input type="radio" name="county-provider" checked={selected === 'generic'} onChange={() => choose('generic')} />
          <span><strong>None of the above</strong><small>Use a county-based generic estimate</small></span>
        </label>
      </div>
      {selected === 'generic' && <div className="ww-provider-disclaimer">We’ll use a generic estimate based on the providers offered in your county. You can update this later if your provider becomes available.</div>}
      <button onClick={continueToAppliances} disabled={!selected} className="ww-panel-button disabled:opacity-40">Continue <ChevronRight size={15} /></button>
    </aside>
  )
}

function SchedulePreferencePanel({ open }) {
  const { state, update } = useWattWhen()
  const navigate = useNavigate()
  const toggles = state.availability?.toggles || {}
  const setToggle = (key, checked) => update('availability', { ...state.availability, toggles: { ...toggles, [key]: checked } })
  return (
    <aside className={`ww-info-panel ww-schedule-panel${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open ? '' : undefined}>
      <span className="ww-kicker">FINE-TUNE YOUR PLAN</span>
      <h2>Scheduling preferences</h2>
      <p>Choose how WattWhen should balance your routine.</p>
      <div className="ww-schedule-options">
        {schedulePreferences.map(([key, label]) => <label key={key}><span>{label}</span><input type="checkbox" checked={Boolean(toggles[key])} onChange={(e) => setToggle(key, e.target.checked)} /></label>)}
      </div>
      <button onClick={() => navigate({ to: '/onboarding/priority' })} className="ww-panel-button">Continue to priority <ChevronRight size={15} /></button>
    </aside>
  )
}

function ApplianceFrequencyPanel({ open }) {
  const { state, update } = useWattWhen()
  const selected = state.selectedAppliances || []
  const configs = state.applianceConfigs || {}
  const appliances = selected
    .filter((id) => appliancePresets.some((item) => item.id === id) || id.startsWith('custom-'))
    .map((id) => appliancePresets.find((item) => item.id === id) || { id, ...configs[id] })
    .filter((item) => item.name)

  const updateConfig = (id, patch) => {
    const preset = appliancePresets.find((item) => item.id === id) || {}
    update('applianceConfigs', {
      ...configs,
      [id]: { ...preset, ...configs[id], ...patch },
    })
  }

  const removeAppliance = (id) => {
    update('selectedAppliances', selected.filter((selectedId) => selectedId !== id))
  }

  return (
    <aside className={`ww-info-panel ww-frequency-panel${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open ? '' : undefined}>
      <span className="ww-kicker">TELL US A BIT MORE</span>
      <h2>How often do you use each?</h2>
      <p>You can edit these anytime.</p>
      {appliances.length === 0 ? (
        <div className="ww-panel-empty">Select an appliance to add its usage details here.</div>
      ) : (
        <div className="ww-frequency-list">
          {appliances.map((appliance) => {
            const config = { ...appliance, ...configs[appliance.id] }
            const isPc = appliance.id === 'gaming-pc'
            const isEv = appliance.id === 'ev-charger'
            const isHourly = isPc || isEv
            return (
              <section className="ww-frequency-card" key={appliance.id}>
                <div className="ww-frequency-card-heading">
                  <h3><span>{appliance.icon}</span>{appliance.name}</h3>
                  <button type="button" onClick={() => removeAppliance(appliance.id)} aria-label={`Remove ${appliance.name}`} title={`Remove ${appliance.name}`}><Minus size={15} /></button>
                </div>
                <div className="ww-frequency-fields">
                  <label>How often?
                    <select value={config.frequency || appliance.frequency} onChange={(event) => updateConfig(appliance.id, { frequency: event.target.value })}>
                      {frequencyOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>{isPc ? 'Hours per day' : isEv ? 'Hours per charge' : 'Uses each time'}
                    <select value={config.usesPerSession || 1} onChange={(event) => updateConfig(appliance.id, { usesPerSession: Number(event.target.value) })}>
                      {[1, 2, 3, 4, 5, 6, 8].map((count) => <option key={count} value={count}>{count} {isHourly ? `hour${count > 1 ? 's' : ''}` : appliance.id === 'laundry' ? `load${count > 1 ? 's' : ''}` : `cycle${count > 1 ? 's' : ''}`}</option>)}
                    </select>
                  </label>
                </div>
                {isPc && (
                  <fieldset className="ww-subcategory-options ww-pc-profiles">
                    <legend>What kind of PC use?</legend>
                    <label className={config.pcUsage === 'light' ? 'selected' : ''}>
                      <input type="radio" name="pc-usage" checked={config.pcUsage === 'light'} onChange={() => updateConfig(appliance.id, { pcUsage: 'light', estimatedKwh: 0.2 })} />
                      <span><strong>Light use</strong><small>Casual browsing, schoolwork, email, and movie or music streaming.</small></span>
                    </label>
                    <label className={config.pcUsage === 'heavy' ? 'selected' : ''}>
                      <input type="radio" name="pc-usage" checked={config.pcUsage === 'heavy'} onChange={() => updateConfig(appliance.id, { pcUsage: 'heavy', estimatedKwh: 0.7 })} />
                      <span><strong>Heavy use</strong><small>Intense gaming, heavy video editing, 3D rendering, compiling, or other demanding workloads.</small></span>
                    </label>
                  </fieldset>
                )}
                {isEv && (
                  <fieldset className="ww-subcategory-options ww-ev-profiles">
                    <legend>How do you usually charge?</legend>
                    <label className={config.chargingType === 'wall-outlet' ? 'selected' : ''}>
                      <input type="radio" name="ev-charging-type" checked={config.chargingType === 'wall-outlet'} onChange={() => updateConfig(appliance.id, { chargingType: 'wall-outlet', estimatedKwh: 1.4 })} />
                      <span><strong>Wall outlet</strong><small>Slower Level 1 charging from a standard household outlet, usually overnight.</small></span>
                    </label>
                    <label className={config.chargingType === 'external' ? 'selected' : ''}>
                      <input type="radio" name="ev-charging-type" checked={config.chargingType === 'external'} onChange={() => updateConfig(appliance.id, { chargingType: 'external', estimatedKwh: 7.2 })} />
                      <span><strong>External charging</strong><small>Faster charging through a dedicated home unit, workplace, or public charger.</small></span>
                    </label>
                  </fieldset>
                )}
                <span className="ww-estimate">Estimated use<strong>~{config.estimatedKwh || appliance.estimatedKwh} kWh / {isHourly ? 'hour' : appliance.id === 'laundry' ? 'load' : 'cycle'}</strong></span>
              </section>
            )
          })}
        </div>
      )}
    </aside>
  )
}

export default function OnboardingLayout() {
  const { state } = useWattWhen()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const found = steps.findIndex(([path]) => pathname === path)
  const active = found < 0 ? steps.length : found
  const showLocationPanel = pathname === '/onboarding/location' && state.locationProvidersReady
  const showAppliancePanel = pathname === '/onboarding/appliances' && (state.selectedAppliances || []).length > 0
  const showSchedulePanel = pathname === '/onboarding/availability' && state.scheduleReady
  const showInfoPanel = showLocationPanel || showAppliancePanel || showSchedulePanel
  return (
    <div className="ww-onboarding">
      <div className="ww-onboarding-main">
        <header className="ww-setup-header">
          <Brand compact />
          <div className="ww-progress">
            {steps.map(([, label], index) => (
              <div className={index === active ? 'current' : index < active ? 'done' : ''} key={label}>
                <i>{index < active ? <Check size={12} /> : index + 1}</i><span>{label}</span>
              </div>
            ))}
          </div>
        </header>
        <div className={`ww-onboarding-content${showInfoPanel ? ' has-info-panel' : ''}`}>
          <div className="ww-form-scroll"><Outlet /></div>
          {pathname === '/onboarding/location' && <CountyProviderPanel open={showLocationPanel} />}
          {pathname === '/onboarding/appliances' && <ApplianceFrequencyPanel open={showAppliancePanel} />}
          {pathname === '/onboarding/availability' && <SchedulePreferencePanel open={showSchedulePanel} />}
        </div>
      </div>
    </div>
  )
}
