// Placeholder frontend data.
// Replace with verified calculations or API data later.

export const impactSummary = {
  estimatedWeeklyKwh: 36.7,
  flexibleKwh: 30.2,
  shiftedKwh: 24.8,
  timingScore: 82,
}

export const demandChartData = [
  { hour: '12 AM', original: 2.1, optimized: 4.8 },
  { hour: '2 AM', original: 0.5, optimized: 3.2 },
  { hour: '4 AM', original: 0.3, optimized: 2.8 },
  { hour: '6 AM', original: 1.2, optimized: 1.5 },
  { hour: '8 AM', original: 3.4, optimized: 2.1 },
  { hour: '10 AM', original: 4.2, optimized: 3.0 },
  { hour: '12 PM', original: 5.1, optimized: 3.5 },
  { hour: '2 PM', original: 5.8, optimized: 3.2 },
  { hour: '4 PM', original: 6.5, optimized: 2.8 },
  { hour: '6 PM', original: 7.2, optimized: 2.1 },
  { hour: '8 PM', original: 5.5, optimized: 1.8 },
  { hour: '10 PM', original: 3.2, optimized: 3.8 },
]

export const applianceChartData = [
  { name: 'EV Charging', kwh: 9.6 },
  { name: 'Laundry', kwh: 7.2 },
  { name: 'Pool Pump', kwh: 3.0 },
  { name: 'Dishwasher', kwh: 3.6 },
  { name: 'Cooking', kwh: 2.0 },
  { name: 'Portable AC', kwh: 1.2 },
  { name: 'Gaming PC', kwh: 0.5 },
  { name: 'Charging', kwh: 0.1 },
]

export const timeDistributionData = [
  { name: 'Super off-peak', before: 5, after: 35 },
  { name: 'Off-peak', before: 40, after: 45 },
  { name: 'Peak', before: 55, after: 20 },
]

export const scoreBreakdown = [
  { label: 'Off-peak usage', score: 88, max: 100 },
  { label: 'Appliance shifting', score: 76, max: 100 },
  { label: 'EV timing', score: 95, max: 100 },
  { label: 'Flexibility utilization', score: 70, max: 100 },
]

export const methodologyText = [
  'Timing Score measures how well your appliance usage aligns with off-peak and super off-peak windows.',
  'A score of 100 means all flexible appliances run during the cheapest, cleanest times.',
  'The scoring weights are: off-peak usage (40%), appliance shifting (25%), EV timing (20%), flexibility utilization (15%).',
  'These values are demonstration placeholders. Verified methodology will be connected later.',
]

export const dataQualityItems = [
  { label: 'Provider rates', status: 'placeholder', note: 'Using sample TOU rate structure' },
  { label: 'Appliance wattage', status: 'placeholder', note: 'Based on category averages' },
  { label: 'Grid carbon intensity', status: 'not connected', note: 'Will use real-time grid data' },
  { label: 'Weather adjustments', status: 'not connected', note: 'Will factor local temperature' },
]
