// Placeholder frontend data.
// Replace with verified calculations or API data later.

export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12
  const period = i < 12 ? 'AM' : 'PM'
  return `${hour} ${period}`
})

export const timeWindowBands = [
  { start: 0, end: 6, label: 'Super off-peak', color: '#22c55e' },
  { start: 6, end: 16, label: 'Off-peak', color: '#3b82f6' },
  { start: 16, end: 21, label: 'Peak', color: '#ef4444' },
  { start: 21, end: 24, label: 'Off-peak', color: '#3b82f6' },
]

export const weeklySchedule = [
  { id: 't1', name: 'Laundry', day: 0, startHour: 2, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 10, icon: '👕' },
  { id: 't2', name: 'EV Charging', day: 0, startHour: 1, duration: 4, kwh: 9.6, status: 'optimized', flexibility: 'anytime', originalHour: 18, icon: '🔌' },
  { id: 't3', name: 'Dishwasher', day: 1, startHour: 22, duration: 1.5, kwh: 1.8, status: 'optimized', flexibility: 'anytime', originalHour: 19, icon: '🍽️' },
  { id: 't4', name: 'Gaming PC', day: 1, startHour: 20, duration: 3, kwh: 0.5, status: 'fixed', flexibility: 'fixed', originalHour: 20, icon: '🎮' },
  { id: 't5', name: 'Pool Pump', day: 2, startHour: 10, duration: 3, kwh: 1.5, status: 'optimized', flexibility: 'within-3h', originalHour: 14, icon: '🏊' },
  { id: 't6', name: 'Laundry', day: 3, startHour: 3, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 11, icon: '👕' },
  { id: 't7', name: 'Cooking', day: 3, startHour: 18, duration: 0.75, kwh: 2.0, status: 'fixed', flexibility: 'fixed', originalHour: 18, icon: '🍳' },
  { id: 't8', name: 'EV Charging', day: 4, startHour: 0, duration: 4, kwh: 9.6, status: 'optimized', flexibility: 'anytime', originalHour: 17, icon: '🔌' },
  { id: 't9', name: 'Dishwasher', day: 4, startHour: 23, duration: 1.5, kwh: 1.8, status: 'optimized', flexibility: 'anytime', originalHour: 20, icon: '🍽️' },
  { id: 't10', name: 'Portable AC', day: 5, startHour: 9, duration: 4, kwh: 1.2, status: 'optimized', flexibility: 'within-1h', originalHour: 15, icon: '❄️' },
  { id: 't11', name: 'Laundry', day: 5, startHour: 4, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 9, icon: '👕' },
  { id: 't12', name: 'Pool Pump', day: 6, startHour: 11, duration: 3, kwh: 1.5, status: 'optimized', flexibility: 'within-3h', originalHour: 15, icon: '🏊' },
]

export const weeklySummary = {
  totalKwh: 36.7,
  flexibleKwh: 30.2,
  shiftedKwh: 24.8,
  timingScore: 82,
}
