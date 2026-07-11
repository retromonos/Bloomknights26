import { createContext, useContext, useState, useEffect } from 'react'

const WattWhenContext = createContext(null)

const STORAGE_KEY = 'wattwhen-state'

const defaultState = {
  onboardingComplete: false,
  location: { address: '', city: '', stateCode: '', zip: '', housingType: 'house', householdSize: 2 },
  provider: 'pge-tou',
  preference: 'balanced',
  convenienceSlider: 50,
  selectedAppliances: [],
  applianceConfigs: {},
  availability: {
    sleepStart: '23:00',
    sleepEnd: '07:00',
    workStart: '09:00',
    workEnd: '17:00',
    quietStart: '22:00',
    quietEnd: '08:00',
    customBlocks: [],
    toggles: {
      avoidPeak: true,
      preferRenewable: true,
      quietHours: true,
      weekendFlex: true,
      notifyBefore: true,
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
