import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { appliancePresets } from '../data/applianceData.js'

export default function TasksPage() {
  const [tasks, setTasks] = useState(
    appliancePresets.map((a) => ({ ...a, enabled: true }))
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const filtered = tasks.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'flexible' && t.flexibility !== 'fixed') || (filter === 'fixed' && t.flexibility === 'fixed')
    return matchSearch && matchFilter
  })

  const toggleEnabled = (id) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t))
    setAnnouncement(`Task ${tasks.find((t) => t.id === id)?.enabled ? 'disabled' : 'enabled'}`)
  }

  const deleteTask = (id) => {
    const name = tasks.find((t) => t.id === id)?.name
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setAnnouncement(`${name} deleted`)
  }

  return (
    <AppShell announcement={announcement}>
      <div className="p-4 lg:p-6">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--sea-ink)]">Tasks</h1>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 rounded-lg bg-[var(--lagoon)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--lagoon-deep)]">
            <Plus size={14} /> Add task
          </button>
        </header>

        {/* Search + filter */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]" aria-hidden="true" />
            <input type="search" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-[var(--line)] py-2 pl-9 pr-3 text-sm" aria-label="Search tasks" />
          </div>
          <div className="flex gap-1" role="group" aria-label="Filter tasks">
            {['all', 'flexible', 'fixed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-xs font-medium capitalize ${filter === f ? 'bg-[var(--sea-ink)] text-white' : 'text-[var(--sea-ink-soft)] hover:bg-[var(--sand)]'}`} aria-pressed={filter === f}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[var(--sea-ink-soft)]">No tasks match your search.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
            <table className="w-full text-sm" role="table">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-[var(--line)] bg-[var(--foam)]">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">Task</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">kWh</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">Frequency</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">Flexibility</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--sea-ink-soft)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task.id} className={`border-b border-[var(--line)] last:border-0 ${!task.enabled ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{task.icon}</span>
                        <div>
                          <div className="font-medium text-[var(--sea-ink)]">{task.name}</div>
                          <div className="text-xs text-[var(--sea-ink-soft)] sm:hidden">{task.estimatedKwh} kWh · {task.frequency}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">{task.estimatedKwh} <span className="text-[var(--sea-ink-soft)]">(placeholder)</span></td>
                    <td className="hidden px-4 py-3 sm:table-cell">{task.frequency}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${task.flexibility === 'fixed' ? 'bg-gray-100 text-gray-600' : 'bg-[var(--foam)] text-[var(--lagoon-deep)]'}`}>
                        {task.flexibility.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" checked={task.enabled} onChange={() => toggleEnabled(task.id)} className="sr-only peer" aria-label={`Toggle ${task.name}`} />
                          <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-[var(--lagoon)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <button onClick={() => setEditingTask(task)} className="rounded p-1 hover:bg-[var(--sand)]" aria-label={`Edit ${task.name}`}><Edit2 size={14} /></button>
                        <button onClick={() => deleteTask(task.id)} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label={`Delete ${task.name}`}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add task modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowAdd(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Add custom task">
            <h2 className="mb-4 text-lg font-semibold">Add custom task</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              setTasks((prev) => [...prev, {
                id: `custom-${Date.now()}`,
                name: fd.get('name'),
                icon: '⚡',
                estimatedKwh: Number(fd.get('kwh')),
                frequency: fd.get('freq'),
                flexibility: fd.get('flex'),
                duration: 60,
                enabled: true,
              }])
              setShowAdd(false)
              setAnnouncement(`Added ${fd.get('name')}`)
            }} className="space-y-3">
              <input name="name" placeholder="Task name" required className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="kwh" type="number" step="0.1" placeholder="Est. kWh" defaultValue="1.0" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <select name="freq" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"><option>Daily</option><option>3x per week</option><option>Weekly</option></select>
              <select name="flex" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"><option value="fixed">Fixed</option><option value="within-1h">Within 1h</option><option value="within-3h">Within 3h</option><option value="anytime">Anytime</option></select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit task modal */}
      {editingTask && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setEditingTask(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-label={`Edit ${editingTask.name}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingTask.icon} {editingTask.name}</h2>
              <button onClick={() => setEditingTask(null)} className="rounded p-1 hover:bg-[var(--sand)]" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, name: fd.get('name'), estimatedKwh: Number(fd.get('kwh')), frequency: fd.get('freq'), flexibility: fd.get('flex') } : t))
              setEditingTask(null)
            }} className="space-y-3">
              <input name="name" defaultValue={editingTask.name} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <input name="kwh" type="number" step="0.1" defaultValue={editingTask.estimatedKwh} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              <select name="freq" defaultValue={editingTask.frequency} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"><option>Daily</option><option>3x per week</option><option>Weekly</option></select>
              <select name="flex" defaultValue={editingTask.flexibility} className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"><option value="fixed">Fixed</option><option value="within-1h">Within 1h</option><option value="within-3h">Within 3h</option><option value="anytime">Anytime</option></select>
              <button type="submit" className="w-full rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm text-white">Save</button>
            </form>
          </div>
        </>
      )}
    </AppShell>
  )
}
