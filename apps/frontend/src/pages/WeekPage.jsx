import { Fragment, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Download, GripVertical, X, Move, PencilLine } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import SustainabilityTip from '../components/SustainabilityTip.jsx'
import { weeklySchedule, weeklySummary, daysOfWeek, fullDays, timeSlots } from '../data/scheduleData.js'
import { providerPlaceholder } from '../data/providerData.js'
import { useWattWhen } from '../lib/WattWhenContext.jsx'

const defaultCalendarBands = [
  { id: 'super', label: 'Super off-peak', color: '#7cb40e', windows: [[0, 6]] },
  { id: 'offpeak', label: 'Off-peak', color: '#333d95', windows: [[6, 16], [21, 24]] },
  { id: 'peak', label: 'Peak', color: '#f55425', windows: [[16, 21]] },
  { id: 'unavailable', label: 'Unavailable', color: '#191f99', windows: [] },
]

const timeToHour = (value) => value ? Number(value.split(':')[0]) + Number(value.split(':')[1]) / 60 : null
const hourInWindow = (hour, [start, end]) => end > start ? hour >= start && hour < end : hour >= start || hour < end

function availabilityWindows(availability = {}) {
  const ranges = [[availability.sleepStart, availability.sleepEnd], [availability.workStart, availability.workEnd], [availability.quietStart, availability.quietEnd], ...(availability.customBlocks || []).map((block) => [block.start, block.end])]
  return ranges.map(([start, end]) => [timeToHour(start), timeToHour(end)]).filter(([start, end]) => start !== null && end !== null && start !== end)
}

export default function WeekPage() {
  const { state, update } = useWattWhen()
  const [tasks, setTasks] = useState(weeklySchedule)
  const [editMode, setEditMode] = useState(false)
  const [dragTaskId, setDragTaskId] = useState(null)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [viewMode, setViewMode] = useState(window.innerWidth >= 1024 ? 'week' : 'day')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showMoveDialog, setShowMoveDialog] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false)
  const [availabilityDraft, setAvailabilityDraft] = useState(state.availability)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const preference = state.preference || 'balanced'
  const calendarBands = state.calendarBands || defaultCalendarBands
  const unavailableWindows = availabilityWindows(state.availability)

  const visibleDays = viewMode === 'week' ? [0, 1, 2, 3, 4, 5, 6]
    : viewMode === '3-day' ? [selectedDay, (selectedDay + 1) % 7, (selectedDay + 2) % 7]
    : [selectedDay]

  const bandRank = (hour) => {
    if (unavailableWindows.some((window) => hourInWindow(hour, window))) return 3
    if ((calendarBands.find((band) => band.id === 'peak')?.windows || []).some((window) => hourInWindow(hour, window))) return 2
    if ((calendarBands.find((band) => band.id === 'offpeak')?.windows || []).some((window) => hourInWindow(hour, window))) return 1
    return 0
  }

  const moveWarningFor = (task, newHour) => {
    if (!task || task.flexibility === 'fixed') return ''
    const currentRank = bandRank(task.startHour)
    const nextRank = bandRank(newHour)
    if (nextRank >= 2 && nextRank !== currentRank) {
      const label = nextRank === 3 ? 'an unavailable' : 'peak'
      return `This move places the task in ${label} time, which may cost more.`
    }
    if (nextRank > currentRank) return 'This move may cost more than the current slot.'
    if (unavailableWindows.some((window) => hourInWindow(newHour, window))) return 'This move lands inside an unavailable window.'
    return ''
  }

  const performTaskMove = (taskId, newDay, newHour) => {
    setTasks((prev) => prev.map((task) => task.id === taskId
      ? { ...task, originalHour: task.originalHour ?? task.startHour, day: newDay, startHour: newHour, status: 'moved' }
      : task))
    setAnnouncement(`Task moved to ${fullDays[newDay]} at ${timeSlots[newHour]}`)
  }

  const queueTaskMove = (taskId, newDay, newHour) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.flexibility === 'fixed') return
    const warning = moveWarningFor(task, newHour)
    setShowMoveDialog(null)
    if (warning) {
      setPendingMove({ taskId, newDay, newHour, warning, label: task.name })
      return
    }
    performTaskMove(taskId, newDay, newHour)
  }

  const saveAvailability = () => {
    update('availability', availabilityDraft)
    const nextUnavailable = availabilityWindows(availabilityDraft)
    const peakWindows = calendarBands.find((band) => band.id === 'peak')?.windows || []
    const preferredWindows = calendarBands.filter((band) => ['super', 'offpeak'].includes(band.id)).flatMap((band) => band.windows)
    const candidateHours = preferredWindows.flatMap(([start, end]) => Array.from({ length: Math.max(0, Math.ceil(end) - Math.floor(start)) }, (_, index) => Math.floor(start) + index))
    const recommendedHour = candidateHours.find((hour) => ![...peakWindows, ...nextUnavailable].some((window) => hourInWindow(hour, window))) ?? 1
    setTasks((current) => current.map((task) => {
      const blocked = [...peakWindows, ...nextUnavailable].some((window) => hourInWindow(task.startHour, window))
      return blocked && task.flexibility !== 'fixed'
        ? { ...task, originalHour: task.originalHour ?? task.startHour, startHour: recommendedHour, status: 're-optimized' }
        : task
    }))
    setAnnouncement('Unavailable hours updated; flexible tasks were re-evaluated.')
    setShowAvailabilityEditor(false)
  }

  return (
    <AppShell announcement={announcement}>
      <div className="p-4 lg:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--sea-ink)]">Week & tasks</h1>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {providerPlaceholder.name} · {preference} mode
            </p>
          </div>
          <div className="ww-week-actions">
            <button onClick={() => setShowQuickAdd(true)} className="ww-week-action ww-week-action-add" aria-label="Add task">
              <Plus size={14} /> Add
            </button>
            <button onClick={() => setEditMode((value) => !value)} className={`ww-week-action ww-week-action-edit${editMode ? ' is-active' : ''}`} aria-pressed={editMode}>
              <PencilLine size={14} /> {editMode ? 'Editing tasks' : 'Edit tasks'}
            </button>
            <button onClick={() => { setAvailabilityDraft(state.availability); setShowAvailabilityEditor(true) }} className="ww-week-action ww-week-action-availability" aria-label="Edit unavailable hours">
              <Move size={14} /> Edit availability
            </button>
            <button onClick={() => setShowExport(true)} className="ww-week-action ww-week-action-export" aria-label="Export calendar">
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

        {/* Read-only calendar legend */}
        <div className="ww-calendar-legend mb-3 flex flex-wrap gap-2">
          {calendarBands.map((band) => (
            <span key={band.id} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--sea-ink)] shadow-[2px_2px_0_#000]">
              <i className="inline-block h-3 w-3 border border-black" style={{ backgroundColor: band.color }} />
              <span>{band.label}</span>
            </span>
          ))}
          <span className="text-[10px] italic text-[var(--sea-ink-soft)]">Peak and off-peak windows are locked</span>
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
              <Fragment key={hour}>
                <div className="border-b border-r border-[var(--line)] p-1 text-right text-[10px] text-[var(--sea-ink-soft)]">
                  {timeSlots[hour]}
                </div>
                {visibleDays.map((day) => {
                  const band = calendarBands.find((item) => item.id !== 'unavailable' && item.windows.some((window) => hourInWindow(hour, window)))
                  const isUnavailable = unavailableWindows.some((window) => hourInWindow(hour, window))
                  const unavailableColor = calendarBands.find((item) => item.id === 'unavailable')?.color || '#191f99'
                  const cellTasks = tasks.filter((t) => t.day === day && Math.floor(t.startHour) === hour)
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`relative border-b border-r border-[var(--line)] ${dragTaskId && editMode ? 'outline outline-2 outline-[var(--lagoon)]' : ''}`}
                      style={{ minHeight: '40px', backgroundColor: band ? `${band.color}20` : undefined }}
                      onDragOver={(event) => {
                        if (!editMode) return
                        event.preventDefault()
                      }}
                      onDrop={(event) => {
                        if (!editMode) return
                        event.preventDefault()
                        if (dragTaskId) queueTaskMove(dragTaskId, day, hour)
                        setDragTaskId(null)
                      }}
                    >
                      {isUnavailable && <div className="ww-calendar-unavailable" style={{ '--unavailable-color': unavailableColor }} aria-label="Unavailable time" />}
                      {cellTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          draggable={editMode && task.flexibility !== 'fixed'}
                          onDragStart={() => {
                            if (editMode && task.flexibility !== 'fixed') setDragTaskId(task.id)
                          }}
                          onDragEnd={() => setDragTaskId(null)}
                          className={`m-0.5 w-[calc(100%-4px)] rounded border px-1.5 py-0.5 text-left text-[10px] ${
                            task.status === 'optimized' ? 'border-[var(--lagoon)]/30 bg-[var(--foam)]' :
                            task.status === 'moved' ? 'border-amber-300 bg-amber-50' :
                            'border-[var(--line)] bg-white'
                          } ${editMode && task.flexibility !== 'fixed' ? 'cursor-grab' : ''}`}
                          aria-label={`${task.name} at ${timeSlots[task.startHour]}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{task.icon}</span>
                            <span className="truncate font-medium">{task.name}</span>
                            {editMode && task.flexibility !== 'fixed' && <GripVertical size={8} className="ml-auto shrink-0 text-[var(--sea-ink-soft)]" aria-hidden="true" />}
                          </div>
                          <div className="text-[8px] text-[var(--sea-ink-soft)]">{task.kwh} kWh</div>
                          {editMode && task.flexibility !== 'fixed' && <span className="absolute right-0.5 top-0.5 rounded bg-white/90 px-0.5 text-[8px] font-semibold text-[var(--sea-ink-soft)]">drag</span>}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </Fragment>
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
        <MoveTaskDialog task={showMoveDialog} onMove={queueTaskMove} onClose={() => setShowMoveDialog(null)} />
      )}

      {/* Quick add modal */}
      {showQuickAdd && (
        <QuickAddModal onAdd={(t) => { setTasks((prev) => [...prev, t]); setShowQuickAdd(false); setAnnouncement(`Added ${t.name}`) }} onClose={() => setShowQuickAdd(false)} />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal tasks={tasks} onClose={() => setShowExport(false)} />
      )}

      {pendingMove && (
        <MoveWarningDialog
          task={pendingMove}
          onCancel={() => setPendingMove(null)}
          onSave={() => {
            performTaskMove(pendingMove.taskId, pendingMove.newDay, pendingMove.newHour)
            setPendingMove(null)
          }}
        />
      )}
      {showAvailabilityEditor && (
        <AvailabilityEditor
          availability={availabilityDraft}
          setAvailability={setAvailabilityDraft}
          onSave={saveAvailability}
          onClose={() => setShowAvailabilityEditor(false)}
        />
      )}
    </AppShell>
  )
}

/* ── Availability Editor ───────────────────────────── */
function AvailabilityEditor({ availability, setAvailability, onSave, onClose }) {
  const updateCustomBlock = (index, key, value) => {
    setAvailability((current) => ({
      ...current,
      customBlocks: (current.customBlocks || []).map((block, blockIndex) => blockIndex === index ? { ...block, [key]: value } : block),
    }))
  }

  const addCustomBlock = () => {
    setAvailability((current) => ({
      ...current,
      customBlocks: [...(current.customBlocks || []), { start: '', end: '' }],
    }))
  }

  const removeCustomBlock = (index) => {
    setAvailability((current) => ({
      ...current,
      customBlocks: (current.customBlocks || []).filter((_, blockIndex) => blockIndex !== index),
    }))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="ww-band-editor" role="dialog" aria-modal="true" aria-label="Edit unavailable hours">
        <div className="ww-band-editor-heading">
          <div><span className="ww-kicker">UNAVAILABLE HOURS</span><h2>Edit availability</h2></div>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <p className="mb-4 text-xs text-[var(--sea-ink-soft)]">
          Adjust the blocks when your home is not available. Peak, off-peak, and super off-peak windows stay locked.
        </p>
        <div className="ww-band-window-list">
          <div>
            <span>Sleep window</span>
            <div className="ww-band-time-grid">
              <label>Start<input type="time" value={availability.sleepStart || ''} onChange={(event) => setAvailability((current) => ({ ...current, sleepStart: event.target.value }))} /></label>
              <label>End<input type="time" value={availability.sleepEnd || ''} onChange={(event) => setAvailability((current) => ({ ...current, sleepEnd: event.target.value }))} /></label>
            </div>
          </div>
          <div>
            <span>Work window</span>
            <div className="ww-band-time-grid">
              <label>Start<input type="time" value={availability.workStart || ''} onChange={(event) => setAvailability((current) => ({ ...current, workStart: event.target.value }))} /></label>
              <label>End<input type="time" value={availability.workEnd || ''} onChange={(event) => setAvailability((current) => ({ ...current, workEnd: event.target.value }))} /></label>
            </div>
          </div>
          <div>
            <span>Quiet window</span>
            <div className="ww-band-time-grid">
              <label>Start<input type="time" value={availability.quietStart || ''} onChange={(event) => setAvailability((current) => ({ ...current, quietStart: event.target.value }))} /></label>
              <label>End<input type="time" value={availability.quietEnd || ''} onChange={(event) => setAvailability((current) => ({ ...current, quietEnd: event.target.value }))} /></label>
            </div>
          </div>
          {(availability.customBlocks || []).map((block, index) => (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between">
                <span>Custom block {index + 1}</span>
                <button type="button" onClick={() => removeCustomBlock(index)} className="text-xs font-semibold text-[var(--orange)]">Remove</button>
              </div>
              <div className="ww-band-time-grid">
                <label>Start<input type="time" value={block.start || ''} onChange={(event) => updateCustomBlock(index, 'start', event.target.value)} /></label>
                <label>End<input type="time" value={block.end || ''} onChange={(event) => updateCustomBlock(index, 'end', event.target.value)} /></label>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCustomBlock} className="mt-3 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--sand)]">Add custom block</button>
        <div className="ww-band-editor-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onSave}>Save and update schedule</button>
        </div>
      </div>
    </>
  )
}

function MoveWarningDialog({ task, onCancel, onSave }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} />
      <div className="ww-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm task move">
        <div className="ww-confirm-modal-badge"><span>Heads up</span></div>
        <h2>Move {task.label} anyway?</h2>
        <p className="ww-confirm-lead">{task.warning}</p>
        <p className="ww-confirm-copy">You can still save this change. WattWhen is just giving you a heads up first.</p>
        <div className="ww-confirm-actions">
          <button onClick={onSave} className="ww-confirm-primary">Save anyway</button>
          <button onClick={onCancel} className="ww-confirm-secondary">Keep editing</button>
        </div>
      </div>
    </>
  )
}

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
