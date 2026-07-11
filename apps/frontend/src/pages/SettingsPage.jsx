import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { providerOptions } from '../data/providerData.js'

export default function SettingsPage() {
  const { state, update, resetAll } = useWattWhen()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const provider = providerOptions.find((p) => p.id === state.provider) || providerOptions[0]

  const handleReset = () => {
    resetAll()
    setShowResetConfirm(false)
    setAnnouncement('All data has been reset')
  }

  return (
    <AppShell announcement={announcement}>
      <div className="mx-auto max-w-lg p-4 lg:p-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--sea-ink)]">Settings</h1>

        <div className="space-y-6">
          {/* Household profile */}
          <section className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Household Profile</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Address</dt>
                <dd>{state.location?.address || 'Not set'}, {state.location?.city || ''}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Housing type</dt>
                <dd className="capitalize">{state.location?.housingType || 'Not set'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Household size</dt>
                <dd>{state.location?.householdSize || '–'}</dd>
              </div>
            </dl>
          </section>

          {/* Provider */}
          <section className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Provider</h2>
            <p className="text-sm">{provider.name}</p>
            <p className="text-xs text-[var(--sea-ink-soft)]">{provider.planName} · {provider.planType}</p>
          </section>

          {/* Preference */}
          <section className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Optimization Preference</h2>
            <p className="text-sm capitalize">{state.preference || 'Balanced'}</p>
            <p className="text-xs text-[var(--sea-ink-soft)]">Convenience slider: {state.convenienceSlider ?? 50}%</p>
          </section>

          {/* Availability */}
          <section className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Availability</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Sleep</dt>
                <dd>{state.availability?.sleepStart || '23:00'} – {state.availability?.sleepEnd || '07:00'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Work</dt>
                <dd>{state.availability?.workStart || '09:00'} – {state.availability?.workEnd || '17:00'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--sea-ink-soft)]">Quiet hours</dt>
                <dd>{state.availability?.quietStart || '22:00'} – {state.availability?.quietEnd || '08:00'}</dd>
              </div>
            </dl>
          </section>

          {/* Accessibility */}
          <section className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Accessibility</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-[var(--sea-ink)]">Reduced motion</span>
                <input type="checkbox" checked={state.settings?.reducedMotion || false} onChange={(e) => update('settings', { ...state.settings, reducedMotion: e.target.checked })} className="h-4 w-4 accent-[var(--lagoon)]" />
              </label>
              <div>
                <label htmlFor="default-view" className="mb-1 block text-sm text-[var(--sea-ink)]">Default calendar view</label>
                <select id="default-view" value={state.settings?.defaultView || 'week'} onChange={(e) => update('settings', { ...state.settings, defaultView: e.target.value })} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
                  <option value="day">Day</option>
                  <option value="3-day">3-day</option>
                  <option value="week">Week</option>
                </select>
              </div>
            </div>
          </section>

          {/* Reset */}
          <section className="rounded-xl border border-red-200 bg-red-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-red-800">Reset</h2>
            <p className="mb-3 text-xs text-red-700">This will clear all your settings, preferences, and sample data.</p>
            <button onClick={() => setShowResetConfirm(true)} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
              Reset sample data
            </button>
          </section>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowResetConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="alertdialog" aria-modal="true" aria-label="Confirm reset">
            <h2 className="mb-2 text-lg font-semibold">Reset everything?</h2>
            <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">This will clear all your data and return the app to its default state. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Yes, reset</button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}
