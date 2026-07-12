import { createContext, useContext, useState, useEffect } from 'react'

const WattWhenContext = createContext(null)

const STORAGE_KEY = 'wattwhen-state-v5'

const defaultState = {
  account: null,
  onboardingComplete: false,
  location: { zip: '' },
  locationProvidersReady: false,
  detectedCounty: '',
  provider: null,
  providerSelection: null,
  useGenericProviderEstimate: false,
  preference: '',
  convenienceSlider: null,
  selectedAppliances: [],
  applianceConfigs: {},
  scheduleReady: false,
  scheduleResult: null,
  availability: {
    sleepStart: '',
    sleepEnd: '',
    workStart: '',
    workEnd: '',
    quietStart: '',
    quietEnd: '',
    customBlocks: [],
    toggles: {
      avoidPeak: false,
      preferRenewable: false,
      quietHours: false,
      weekendFlex: false,
      notifyBefore: false,
      autoAccept: false,
    },
  },
  settings: { reducedMotion: false, defaultView: 'week' },
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState
  } catch {
    return defaultState
  }
}

export function WattWhenProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const update = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ ...defaultState })
  }

  return (
    <WattWhenContext.Provider value={{ state, update, resetAll }}>
      {children}
    </WattWhenContext.Provider>
  )
}

export function useWattWhen() {
  const ctx = useContext(WattWhenContext)
  if (!ctx) throw new Error('useWattWhen must be used within WattWhenProvider')
  return ctx
}
