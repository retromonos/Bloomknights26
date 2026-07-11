// Placeholder frontend data.
// Replace with verified calculations or API data later.

export const appliancePresets = [
  { id: 'laundry', name: 'Laundry', icon: '👕', estimatedKwh: 2.4, frequency: '3x per week', duration: 60, flexibility: 'within-3h', preferredTime: '10:00', earliestTime: '07:00', latestTime: '21:00' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🍽️', estimatedKwh: 1.8, frequency: 'Daily', duration: 90, flexibility: 'anytime', preferredTime: '20:00', earliestTime: '00:00', latestTime: '23:59' },
  { id: 'gaming-pc', name: 'Gaming PC', icon: '🎮', estimatedKwh: 0.5, frequency: 'Daily', duration: 180, flexibility: 'fixed', preferredTime: '19:00', earliestTime: '19:00', latestTime: '22:00' },
  { id: 'ev-charger', name: 'EV Charging', icon: '🔌', estimatedKwh: 9.6, frequency: 'Daily', duration: 480, flexibility: 'anytime', preferredTime: '23:00', earliestTime: '00:00', latestTime: '23:59' },
  { id: 'pool-pump', name: 'Pool Pump', icon: '🏊', estimatedKwh: 1.5, frequency: 'Daily', duration: 360, flexibility: 'within-3h', preferredTime: '10:00', earliestTime: '06:00', latestTime: '18:00' },
  { id: 'portable-ac', name: 'Portable AC', icon: '❄️', estimatedKwh: 1.2, frequency: 'Daily', duration: 240, flexibility: 'within-1h', preferredTime: '14:00', earliestTime: '10:00', latestTime: '20:00' },
  { id: 'cooking', name: 'Cooking', icon: '🍳', estimatedKwh: 2.0, frequency: 'Daily', duration: 45, flexibility: 'fixed', preferredTime: '18:00', earliestTime: '17:00', latestTime: '20:00' },
  { id: 'device-charging', name: 'Device Charging', icon: '📱', estimatedKwh: 0.1, frequency: 'Daily', duration: 120, flexibility: 'anytime', preferredTime: '22:00', earliestTime: '00:00', latestTime: '23:59' },
]
