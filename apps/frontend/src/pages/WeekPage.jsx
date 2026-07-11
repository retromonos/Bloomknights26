import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Download, GripVertical, X, Move } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import SustainabilityTip from '../components/SustainabilityTip.jsx'
import { weeklySchedule, weeklySummary, daysOfWeek, fullDays, timeSlots, timeWindowBands } from '../data/scheduleData.js'
import { providerPlaceholder } from '../data/providerData.js'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

export default function WeekPage() {
  const { state } = useWattWhen()
  const [tasks, setTasks] = useState(weeklySchedule)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [viewMode, setViewMode] = useState(window.innerWidth >= 1024 ? 'week' : 'day')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showMoveDialog, setShowMoveDialog] = useState(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const preference = state.preference || 'balanced'

  const visibleDays = viewMode === 'week' ? [0, 1, 2, 3, 4, 5, 6]
    : viewMode === '3-day' ? [selectedDay, (selectedDay + 1) % 7, (selectedDay + 2) % 7]
    : [selectedDay]

  const moveTask = (taskId, newDay, newHour) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, day: newDay, startHour: newHour, status: 'moved' } : t))
    setShowMoveDialog(null)
    setAnnouncement(`Task moved to ${fullDays[newDay]} at ${timeSlots[newHour]}`)
  }

  return (
    <AppShell announcement={announcement}>
      <div className="p-4 lg:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--sea-ink)]">Week</h1>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {providerPlaceholder.name} · {preference} mode
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowQuickAdd(true)} className="flex items-center gap-1 rounded-lg bg-[var(--lagoon)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--lagoon-deep)]" aria-label="Add task">
              <Plus size={14} /> Add
            </button>
            <button onClick={() => setShowExport(true)} className="flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--sand)]" aria-label="Export calendar">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Day selector + view mode */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedDay((selectedDay + 6) % 7)} aria-label="Previous day" className="rounded p-1 hover:bg-[var(--sand)]"><ChevronLeft size={18} /></button>
            <div className="flex gap-0.5 overflow-x-auto">
              {daysOfWeek.map((d, i) => (
                <button key={d} onClick={() => setSelectedDay(i)} className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${selectedDay === i ? 'bg-[var(--lagoon)] text-white' : 'text-[var(--sea-ink-soft)] hover:bg-[var(--sand)]'}`}>{d}</button>
              ))}
            </div>
            <button onClick={() => setSelectedDay((selectedDay + 1) % 7)} aria-label="Next day" className="rounded p-1 hover:bg-[var(--sand)]"><ChevronRight size={18} /></button>
          </div>
          <div className="flex gap-0.5 rounded-lg border border-[var(--line)] p-0.5">
            {['day', '3-day', 'week'].map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-lg px-3 py-1 text-xs font-medium ${viewMode === mode ? 'bg-[var(--sea-ink)] text-white' : 'text-[var(--sea-ink-soft)] hover:bg-[var(--sand)]'}`}>{mode}</button>
            ))}
          </div>
        </div>

        {/* Time window bands legend */}
        <div className="mb-2 flex flex-wrap gap-3">
          {[...new Map(timeWindowBands.map((b) => [b.label, b])).values()].map((band) => (
            <span key={band.label} className="flex items-center gap-1 text-[10px] text-[var(--sea-ink-soft)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: band.color }} />
              {band.label}
            </span>
          ))}
          <span className="text-[10px] italic text-[var(--sea-ink-soft)]">Demonstration time-window data</span>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`, minWidth: visibleDays.length > 3 ? '600px' : undefined }}>
            {/* Header row */}
            <div className="border-b border-r border-[var(--line)] p-2" />
            {visibleDays.map((day) => (
              <div key={day} className="border-b border-r border-[var(--line)] p-2 text-center text-xs font-semibold text-[var(--sea-ink)]">
                {daysOfWeek[day]}
              </div>
            ))}

            {/* Hour rows (6 AM to 11 PM to keep it manageable) */}
            {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
              <>
                <div key={`label-${hour}`} className="border-b border-r border-[var(--line)] p-1 text-right text-[10px] text-[var(--sea-ink-soft)]">
                  {timeSlots[hour]}
                </div>
                {visibleDays.map((day) => {
                  const band = timeWindowBands.find((b) => hour >= b.start && hour < b.end)
                  const cellTasks = tasks.filter((t) => t.day === day && Math.floor(t.startHour) === hour)
                  return (
                    <div key={`${day}-${hour}`} className="relative border-b border-r border-[var(--line)]" style={{ minHeight: '40px', backgroundColor: band ? `${band.color}08` : undefined }}>
                      {cellTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`m-0.5 w-[calc(100%-4px)] rounded border px-1.5 py-0.5 text-left text-[10px] ${
                            task.status === 'optimized' ? 'border-[var(--lagoon)]/30 bg-[var(--foam)]' :
                            task.status === 'moved' ? 'border-amber-300 bg-amber-50' :
                            'border-[var(--line)] bg-white'
                          }`}
                          aria-label={`${task.name} at ${timeSlots[task.startHour]}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{task.icon}</span>
                            <span className="truncate font-medium">{task.name}</span>
                            {task.flexibility !== 'fixed' && <GripVertical size={8} className="ml-auto shrink-0 text-[var(--sea-ink-soft)]" aria-hidden="true" />}
                          </div>
                          <div className="text-[8px] text-[var(--sea-ink-soft)]">{task.kwh} kWh</div>
                          {task.flexibility !== 'fixed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowMoveDialog(task) }}
                              className="absolute right-0.5 top-0.5 rounded p-0.5 hover:bg-[var(--sand)]"
                              aria-label={`Move ${task.name}`}
                            >
                              <Move size={10} />
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-[var(--sea-ink-soft)]">Demonstration recommendation</p>

        {/* Weekly summary */}
        <aside className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Weekly Summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total kWh', value: weeklySummary.totalKwh },
              { label: 'Flexible kWh', value: weeklySummary.flexibleKwh },
              { label: 'Shifted kWh', value: weeklySummary.shiftedKwh },
              { label: 'Score', value: weeklySummary.timingScore },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-bold text-[var(--lagoon)]">{item.value}</div>
                <div className="text-[10px] text-[var(--sea-ink-soft)]">{item.label}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onMove={() => { setShowMoveDialog(selectedTask); setSelectedTask(null) }} />
      )}

      {/* Move task dialog (keyboard accessible) */}
      {showMoveDialog && (
        <MoveTaskDialog task={showMoveDialog} onMove={moveTask} onClose={() => setShowMoveDialog(null)} />
      )}

      {/* Quick add modal */}
      {showQuickAdd && (
        <QuickAddModal onAdd={(t) => { setTasks((prev) => [...prev, t]); setShowQuickAdd(false); setAnnouncement(`Added ${t.name}`) }} onClose={() => setShowQuickAdd(false)} />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal tasks={tasks} onClose={() => setShowExport(false)} />
      )}
    </AppShell>
  )
}

/* ── Task Detail Panel ────────────────────────────── */
function TaskDetailPanel({ task, onClose, onMove }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-96 lg:rounded-none" role="dialog" aria-modal="true" aria-label={`${task.name} details`}>
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">{task.icon} {task.name}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Original time</dt><dd>{timeSlots[task.originalHour]}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Current time</dt><dd>{timeSlots[task.startHour]}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Day</dt><dd>{fullDays[task.day]}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Duration</dt><dd>{task.duration}h</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Electricity use</dt><dd>{task.kwh} kWh (placeholder)</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Flexibility</dt><dd className="capitalize">{task.flexibility.replace('-', ' ')}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--sea-ink-soft)]">Score</dt><dd>Placeholder</dd></div>
        </dl>

        <div className="mt-4 rounded-xl bg-[var(--foam)] p-3">
          <p className="text-xs font-semibold text-[var(--sea-ink)]">Why this time?</p>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
            Placeholder recommendation reasons. Verified scheduling logic will be connected later.
          </p>
        </div>

        <div className="mt-4">
          <SustainabilityTip />
        </div>

        {task.flexibility !== 'fixed' && (
          <button onClick={onMove} className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--sea-ink)] hover:bg-[var(--sand)]">
            <Move size={14} /> Move this task
          </button>
        )}
      </div>
    </>
  )
}

/* ── Move Task Dialog (keyboard accessible) ───────── */
function MoveTaskDialog({ task, onMove, onClose }) {
  const [day, setDay] = useState(task.day)
  const [hour, setHour] = useState(task.startHour)

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label={`Move ${task.name}`}>
        <h2 className="mb-4 text-lg font-semibold">Move {task.name}</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="move-day" className="mb-1 block text-xs font-medium">Day</label>
            <select id="move-day" value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              {fullDays.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="move-hour" className="mb-1 block text-xs font-medium">Time</label>
            <select id="move-hour" value={hour} onChange={(e) => setHour(Number(e.target.value))} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              {timeSlots.map((s, i) => <option key={i} value={i}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onMove(task.id, day, hour)} className="flex-1 rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white">Move</button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
        </div>
      </div>
    </>
  )
}

/* ── Quick Add Modal ──────────────────────────────── */
function QuickAddModal({ onAdd, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Add task">
        <h2 className="mb-4 text-lg font-semibold">Add task</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          onAdd({
            id: `new-${Date.now()}`,
            name: fd.get('name'),
            day: Number(fd.get('day')),
            startHour: Number(fd.get('hour')),
            duration: 1,
            kwh: 1.0,
            status: 'manual',
            flexibility: 'anytime',
            originalHour: Number(fd.get('hour')),
            icon: '⚡',
          })
        }} className="space-y-3">
          <input name="name" placeholder="Task name" required className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
          <select name="day" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
            {fullDays.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <select name="hour" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
            {timeSlots.map((s, i) => <option key={i} value={i}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Add</button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}

/* ── Export Modal ─────────────────────────────────── */
function ExportModal({ tasks, onClose }) {
  const [selected, setSelected] = useState(tasks.map((t) => t.id))
  const [exported, setExported] = useState(false)

  const toggle = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl max-h-[80vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Export calendar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Export Calendar</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {tasks.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="accent-[var(--lagoon)]" />
              {t.icon} {t.name} – {fullDays[t.day]}
            </label>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label htmlFor="exp-range" className="mb-1 block text-xs font-medium">Date range</label>
            <select id="exp-range" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              <option>This week</option><option>Next 2 weeks</option><option>This month</option>
            </select>
          </div>
          <div>
            <label htmlFor="exp-reminder" className="mb-1 block text-xs font-medium">Reminder</label>
            <select id="exp-reminder" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              <option>15 minutes before</option><option>30 minutes before</option><option>1 hour before</option><option>None</option>
            </select>
          </div>
        </div>

        <button onClick={() => setExported(true)} disabled={selected.length === 0} className="w-full rounded-xl bg-[var(--lagoon)] py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          {exported ? '✓ Exported!' : `Export ${selected.length} task${selected.length !== 1 ? 's' : ''}`}
        </button>

        <div className="mt-3 rounded-lg border border-dashed border-[var(--line)] p-3 text-center">
          <p className="text-xs text-[var(--sea-ink-soft)]">Google Calendar connection</p>
          <p className="text-[10px] text-[var(--sea-ink-soft)]">Coming later</p>
        </div>
      </div>
    </>
  )
}
