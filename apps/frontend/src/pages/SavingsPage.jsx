import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { savingsSummary, savingsChartData, defaultGoals } from '../data/savingsData.js'

export default function SavingsPage() {
  const [goals, setGoals] = useState(defaultGoals)
  const [showAdd, setShowAdd] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-6">
        <h1 className="mb-4 text-xl font-bold text-[var(--sea-ink)]">Savings</h1>

        {/* Duck piggy bank */}
        <div className="mb-6 flex justify-center">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-label="Duck piggy bank">
            <ellipse cx="50" cy="58" rx="35" ry="28" fill="var(--foam)" stroke="var(--lagoon)" strokeWidth="2" />
            <circle cx="38" cy="45" r="3" fill="var(--sea-ink)" />
            <ellipse cx="50" cy="50" rx="7" ry="4" fill="#f59e0b" />
            <rect x="40" y="28" width="20" height="4" rx="2" fill="var(--lagoon)" />
            <line x1="50" y1="28" x2="50" y2="22" stroke="var(--lagoon)" strokeWidth="2" />
            <circle cx="50" cy="20" r="3" fill="var(--lagoon)" opacity="0.3" />
            <ellipse cx="30" cy="78" rx="5" ry="8" fill="var(--lagoon)" opacity="0.3" />
            <ellipse cx="45" cy="80" rx="5" ry="8" fill="var(--lagoon)" opacity="0.3" />
            <ellipse cx="55" cy="80" rx="5" ry="8" fill="var(--lagoon)" opacity="0.3" />
            <ellipse cx="70" cy="78" rx="5" ry="8" fill="var(--lagoon)" opacity="0.3" />
          </svg>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Cumulative', value: `$${savingsSummary.cumulative.toFixed(2)}` },
            { label: 'This week', value: `$${savingsSummary.thisWeek.toFixed(2)}` },
            { label: 'This month', value: `$${savingsSummary.thisMonth.toFixed(2)}` },
            { label: 'Projected annual', value: `$${savingsSummary.projectedAnnual.toFixed(2)}` },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[var(--line)] bg-white p-4 text-center">
              <div className="text-xl font-bold text-[var(--lagoon)]">{card.value}</div>
              <div className="text-xs text-[var(--sea-ink-soft)]">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Savings chart */}
        <div className="mb-6 rounded-xl border border-[var(--line)] bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Savings Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={savingsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Line type="monotone" dataKey="amount" stroke="var(--lagoon)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goals */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--sea-ink)]">Savings Goals</h2>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-xs font-medium text-[var(--lagoon-deep)] hover:underline">
              <Plus size={14} /> Add goal
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((goal) => {
              const pct = Math.min(100, (goal.saved / goal.target) * 100)
              return (
                <div key={goal.id} className="rounded-lg border border-[var(--line)] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.icon} {goal.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingGoal(goal)} className="rounded p-1 hover:bg-[var(--sand)]" aria-label={`Edit ${goal.name}`}><Edit2 size={12} /></button>
                      <button onClick={() => deleteGoal(goal.id)} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label={`Delete ${goal.name}`}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="mb-1 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-[var(--lagoon)]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--sea-ink-soft)]">
                    <span>${goal.saved.toFixed(2)} saved</span>
                    <span>${goal.target.toFixed(2)} goal</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800">
          These values are placeholders. Verified savings calculations will be connected later.
        </p>
      </div>

      {/* Add goal modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowAdd(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Add savings goal">
            <h2 className="mb-4 text-lg font-semibold">Add savings goal</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              setGoals((prev) => [...prev, { id: `g-${Date.now()}`, name: fd.get('name'), target: Number(fd.get('target')), saved: 0, icon: '🎯' }])
              setShowAdd(false)
            }} className="space-y-3">
              <input name="name" placeholder="Goal name" required className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="target" type="number" step="1" placeholder="Target amount ($)" required className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit goal modal */}
      {editingGoal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setEditingGoal(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label={`Edit ${editingGoal.name}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit goal</h2>
              <button onClick={() => setEditingGoal(null)} className="rounded p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              setGoals((prev) => prev.map((g) => g.id === editingGoal.id ? { ...g, name: fd.get('name'), target: Number(fd.get('target')), saved: Number(fd.get('saved')) } : g))
              setEditingGoal(null)
            }} className="space-y-3">
              <input name="name" defaultValue={editingGoal.name} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="target" type="number" step="1" defaultValue={editingGoal.target} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="saved" type="number" step="0.01" defaultValue={editingGoal.saved} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <div>
                <label className="mb-1 block text-xs font-medium">Allocation</label>
                <input type="range" min={0} max={100} defaultValue={50} className="w-full accent-[var(--lagoon)]" />
                <div className="flex justify-between text-[10px] text-[var(--sea-ink-soft)]"><span>0%</span><span>100%</span></div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Save</button>
            </form>
          </div>
        </>
      )}
    </AppShell>
  )
}
