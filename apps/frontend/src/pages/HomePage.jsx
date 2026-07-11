import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarDays, ArrowRight, Check, Zap, BarChart3, PiggyBank } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AppShell from '../components/AppShell.jsx'
import { DuckMark } from '../components/Brand.jsx'
import { useWattWhen } from '../lib/WattWhenContext.jsx'
import { weeklySchedule, weeklySummary, fullDays, timeSlots } from '../data/scheduleData.js'
import { demandChartData } from '../data/impactData.js'
import { savingsSummary } from '../data/savingsData.js'

const tabs = [
  { to: '/week', label: 'Schedule', icon: CalendarDays },
  { to: '/impact', label: 'Impact analytics', icon: BarChart3 },
  { to: '/savings', label: 'Savings trends', icon: PiggyBank },
]

export default function HomePage() {
  const { state } = useWattWhen()
  const [completed, setCompleted] = useState([])
  const householdName = state.account?.name?.split(/\s+/)[0] || 'Your'
  const tasks = weeklySchedule.filter((task) => !['Pool Pump', 'Portable AC'].includes(task.name)).slice(0, 5)
  const toggleTask = (id) => setCompleted((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

  return (
    <AppShell>
      <div className="ww-home-page">
        <header className="ww-home-header">
          <div><span className="ww-kicker">HOUSEHOLD OVERVIEW</span><h1>{householdName}’s energy plan</h1><p>Your optimized week, impact, and savings in one place.</p></div>
          <nav aria-label="Dashboard sections">{tabs.map(({ to, label, icon: Icon }) => <Link key={to} to={to}><Icon size={15} />{label}</Link>)}</nav>
        </header>
        <div className="ww-home-layout">
          <aside className="ww-home-sidebar">
            <div className="ww-duck-bills-card"><DuckMark size={76} /><span>Estimated saved</span><strong>${savingsSummary.thisMonth.toFixed(0)}</strong><small>this month</small><div><i style={{ width: `${Math.min(100, savingsSummary.thisMonth)}%` }} /></div></div>
            <section className="ww-home-chores"><h2>Chores to do</h2>{tasks.map((task, index) => { const done = completed.includes(task.id); return <button key={task.id} onClick={() => toggleTask(task.id)} className={done ? 'done' : ''}><b>{index + 1}.</b><span><strong>{task.icon} {task.name}</strong><small>{fullDays[task.day]} · {timeSlots[task.startHour]}</small></span><i>{done ? <Check size={12} /> : 'Add'}</i></button> })}</section>
            <div className="ww-peak-card"><Zap size={22} /><span>This week</span><strong>{weeklySummary.shiftedKwh} kWh</strong><small>shifted outside peak</small></div>
          </aside>
          <main className="ww-home-main">
            <section className="ww-insight-strip"><Zap size={15} /><strong>Moving flexible tasks away from peak hours improves this week’s timing score.</strong></section>
            <div className="ww-home-metrics">{[['Weekly electricity', `${weeklySummary.totalKwh} kWh`], ['Flexible electricity', `${weeklySummary.flexibleKwh} kWh`], ['Shifted outside peak', `${weeklySummary.shiftedKwh} kWh`], ['Timing score', `${weeklySummary.timingScore}/100`]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
            <div className="ww-home-panels">
              <section className="ww-dashboard-panel ww-demand-preview"><div className="ww-panel-title"><div><span>Household demand</span><small>Original vs. optimized schedule</small></div><Link to="/impact">Full analysis <ArrowRight size={13} /></Link></div><ResponsiveContainer width="100%" height={260}><LineChart data={demandChartData}><CartesianGrid strokeDasharray="3 3" stroke="#d5d5d5" /><XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} /><YAxis tick={{ fontSize: 9 }} width={28} /><Tooltip contentStyle={{ border: '2px solid #000', fontSize: 11 }} /><Line type="monotone" dataKey="original" stroke="var(--orange)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="optimized" stroke="var(--lagoon)" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></section>
              <section className="ww-dashboard-panel ww-next-tasks"><div className="ww-panel-title"><div><span>Next up</span><small>Optimized recommendations</small></div><Link to="/week">Full week <ArrowRight size={13} /></Link></div>{tasks.slice(0, 4).map((task) => <article key={task.id}><span>{task.icon}</span><div><strong>{task.name}</strong><small>{fullDays[task.day]} at {timeSlots[task.startHour]}</small></div><b>{task.status}</b></article>)}</section>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  )
}
