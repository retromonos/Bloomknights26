import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Info, X } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { impactSummary, demandChartData, applianceChartData, timeDistributionData, scoreBreakdown, methodologyText, dataQualityItems } from '../data/impactData.js'

export default function ImpactPage() {
  const [showMethodology, setShowMethodology] = useState(false)

  return (
    <AppShell>
      <div className="p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--sea-ink)]">Impact</h1>
          <button onClick={() => setShowMethodology(true)} className="flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--sand)]">
            <Info size={14} /> How this will be calculated
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Est. weekly kWh', value: impactSummary.estimatedWeeklyKwh },
            { label: 'Flexible kWh', value: impactSummary.flexibleKwh },
            { label: 'Shifted kWh', value: impactSummary.shiftedKwh },
            { label: 'Timing score', value: impactSummary.timingScore },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[var(--line)] bg-white p-4 text-center">
              <div className="text-2xl font-bold text-[var(--lagoon)]">{card.value}</div>
              <div className="text-xs text-[var(--sea-ink-soft)]">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Original vs Optimized */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Original vs Optimized Usage</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={demandChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="original" stroke="#ef4444" name="Original" strokeWidth={2} />
                <Line type="monotone" dataKey="optimized" stroke="var(--lagoon)" name="Optimized" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By appliance */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Electricity by Appliance</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={applianceChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="kwh" fill="var(--lagoon)" name="kWh" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time distribution */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Before vs After Time Windows</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="before" fill="#ef4444" name="Before" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="var(--lagoon)" name="After" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score breakdown */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Score Breakdown</h2>
            <div className="space-y-3">
              {scoreBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[var(--sea-ink)]">{item.label}</span>
                    <span className="font-semibold text-[var(--lagoon)]">{item.score}/{item.max}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-[var(--lagoon)]" style={{ width: `${(item.score / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data quality */}
        <div className="mt-6 rounded-xl border border-[var(--line)] bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Data Quality</h2>
          <div className="space-y-2">
            {dataQualityItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2">
                <div>
                  <span className="text-sm text-[var(--sea-ink)]">{item.label}</span>
                  <p className="text-[11px] text-[var(--sea-ink-soft)]">{item.note}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === 'placeholder' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology drawer */}
      {showMethodology && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowMethodology(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[400px] lg:rounded-none" role="dialog" aria-modal="true" aria-label="Methodology">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">How this will be calculated</h2>
              <button onClick={() => setShowMethodology(false)} className="rounded p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {methodologyText.map((text, i) => (
                <p key={i} className="text-sm text-[var(--sea-ink-soft)]">{text}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}
