import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, PiggyBank } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { weeklySchedule, weeklySummary, fullDays, timeSlots, timeWindowBands } from '../data/scheduleData.js'
import { savingsSummary } from '../data/savingsData.js'

const previewHours = Array.from({ length: 8 }, (_, index) => index * 3)

function bandForHour(hour) {
  return timeWindowBands.find((band) => hour >= band.start && hour < band.end) || timeWindowBands[1]
}

function formatSavingsLabel(value) {
  return `$${Math.max(0, Math.round(value)).toLocaleString()}`
}

export default function HomePage() {
  const tasks = weeklySchedule.filter((task) => !['Pool Pump', 'Portable AC'].includes(task.name)).slice(0, 5)

  const peakKwh = Math.max(0, Math.round(weeklySummary.totalKwh - weeklySummary.shiftedKwh))
  const sustainableKwh = Math.max(0, weeklySummary.shiftedKwh + Math.round(weeklySummary.flexibleKwh * 0.35))
  const offPeakShare = Math.max(0, weeklySummary.totalKwh - peakKwh)

  return (
    <AppShell>
      <div className="ww-home-page">
        <main className="ww-home-main ww-home-main-slim">
          <section className="ww-home-intro ww-home-intro-plain">
            <span className="ww-home-eyebrow">WELCOME BACK</span>
            <h1>Everything you&apos;re doing to save and sustain.</h1>
            <p>
              Your calendar is compressed into a fast scan view, with the key savings metrics to the right so you can read the plan at a glance.
            </p>
          </section>

          <div className="ww-home-grid">
            <section className="ww-dashboard-panel ww-calendar-preview ww-calendar-preview-flipped">
              <div className="ww-panel-title">
                <div>
                  <span>Compact calendar</span>
                  <small>Peak, off-peak, and flexible tasks</small>
                </div>
                <Link to="/week" className="ww-preview-link ww-preview-link-strong">
                  See more <ArrowRight size={13} />
                </Link>
              </div>

              <div className="ww-mini-calendar ww-mini-calendar-flipped">
                <div className="ww-mini-calendar-axis ww-mini-calendar-axis-top">
                  <span>&nbsp;</span>
                  {fullDays.map((dayLabel) => <span key={dayLabel}>{dayLabel.slice(0, 3)}</span>)}
                </div>

                <div className="ww-mini-calendar-flipped-body">
                  {previewHours.map((hour, slotIndex) => {
                    const band = bandForHour(hour)
                    return (
                      <div key={hour} className="ww-mini-calendar-row ww-mini-calendar-row-flipped">
                        <b>{timeSlots[hour]}</b>
                        {fullDays.map((_, dayIndex) => {
                          const slotTasks = tasks.filter((task) => task.day === dayIndex && Math.floor(task.startHour / 3) === slotIndex)
                          return (
                            <div key={`${dayIndex}-${hour}`} className={`ww-mini-calendar-cell band-${band.label.toLowerCase().replace(/\s+/g, '-')}`}>
                              {slotTasks.length > 0 ? (
                                slotTasks.map((task) => (
                                  <div key={task.id} className="ww-mini-task-pill">
                                    <span>{task.icon}</span>
                                    <strong>{task.name}</strong>
                                  </div>
                                ))
                              ) : (
                                <span className="ww-mini-calendar-empty">&nbsp;</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="ww-calendar-preview-footer">
                <p>Peak = orange, off-peak = blue, super off-peak = green. The axes are flipped so you can compare days across each time block.</p>
              </div>
            </section>

            <aside className="ww-home-summary-stack">
              <section className="ww-home-summary-card ww-home-summary-card-savings">
                <div className="ww-home-summary-heading">
                  <PiggyBank size={24} />
                  <div>
                    <span className="ww-home-card-eyebrow">ESTIMATED SAVINGS</span>
                    <h3>{formatSavingsLabel(savingsSummary.thisMonth)}</h3>
                    <p>Estimated savings this month from the plan.</p>
                  </div>
                </div>
                <Link to="/savings" className="ww-summary-button ww-summary-button-blue">
                  View savings in detail <ChevronRight size={14} />
                </Link>
              </section>

              <section className="ww-home-summary-card ww-home-summary-card-stats">
                <div className="ww-home-summary-heading ww-home-summary-heading-stacked">
                  <span className="ww-home-card-eyebrow">PLAN STATS</span>
                  <h3>Your key numbers</h3>
                  <p>Core numbers that matter most for the week.</p>
                </div>

                <div className="ww-home-summary-stats">
                  <article>
                    <span>Weekly kWh</span>
                    <strong>{weeklySummary.totalKwh}</strong>
                  </article>
                  <article>
                    <span>Peak hours</span>
                    <strong>{peakKwh}</strong>
                  </article>
                  <article>
                    <span>Sustainable</span>
                    <strong>{sustainableKwh}</strong>
                  </article>
                  <article>
                    <span>Off-peak share</span>
                    <strong>{offPeakShare}</strong>
                  </article>
                </div>

                <Link to="/impact" className="ww-summary-button ww-summary-button-dark">
                  See full stats <ChevronRight size={14} />
                </Link>
              </section>
            </aside>
          </div>

        </main>
      </div>
    </AppShell>
  )
}
