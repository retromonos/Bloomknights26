// Placeholder frontend data. Replace with verified scheduling results.
export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const timeSlots = Array.from({ length: 24 }, (_, i) => `${i % 12 || 12} ${i < 12 ? 'AM' : 'PM'}`)

export const timeWindowBands = [
  { start: 0, end: 6, label: 'Super off-peak', color: '#7cb40e' },
  { start: 6, end: 16, label: 'Off-peak', color: '#333d95' },
  { start: 16, end: 21, label: 'Peak', color: '#f55425' },
  { start: 21, end: 24, label: 'Off-peak', color: '#333d95' },
]

export const weeklySchedule = [
  { id: 't1', name: 'Laundry', day: 0, startHour: 2, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 10, icon: '👕' },
  { id: 't2', name: 'EV Charging', day: 0, startHour: 1, duration: 4, kwh: 9.6, status: 'optimized', flexibility: 'anytime', originalHour: 18, icon: '🔌' },
  { id: 't3', name: 'Dishwasher', day: 1, startHour: 22, duration: 1.5, kwh: 1.8, status: 'optimized', flexibility: 'anytime', originalHour: 19, icon: '🍽️' },
  { id: 't4', name: 'PC / Computer', day: 1, startHour: 20, duration: 3, kwh: 0.7, status: 'fixed', flexibility: 'fixed', originalHour: 20, icon: '🖥️' },
  { id: 't6', name: 'Laundry', day: 3, startHour: 3, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 11, icon: '👕' },
  { id: 't7', name: 'Cooking', day: 3, startHour: 18, duration: 0.75, kwh: 2, status: 'fixed', flexibility: 'fixed', originalHour: 18, icon: '🍳' },
  { id: 't8', name: 'EV Charging', day: 4, startHour: 0, duration: 4, kwh: 9.6, status: 'optimized', flexibility: 'anytime', originalHour: 17, icon: '🔌' },
  { id: 't9', name: 'Dishwasher', day: 4, startHour: 23, duration: 1.5, kwh: 1.8, status: 'optimized', flexibility: 'anytime', originalHour: 20, icon: '🍽️' },
  { id: 't11', name: 'Laundry', day: 5, startHour: 4, duration: 1, kwh: 2.4, status: 'optimized', flexibility: 'within-3h', originalHour: 9, icon: '👕' },
]

export const weeklySummary = { totalKwh: 30.7, flexibleKwh: 24.2, shiftedKwh: 18.8, timingScore: 82 }
