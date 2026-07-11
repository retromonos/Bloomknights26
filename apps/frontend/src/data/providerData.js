// Placeholder frontend data.
// Replace with verified calculations or API data later.

export const providerPlaceholder = {
  id: 'pge-tou',
  name: 'Pacific Gas & Electric',
  planName: 'Time-of-Use (Peak Pricing)',
  planType: 'TOU',
  rateStructure: {
    peak: { rate: 0.45, hours: '4 PM – 9 PM' },
    offPeak: { rate: 0.28, hours: '9 PM – 4 PM' },
    superOffPeak: { rate: 0.22, hours: '12 AM – 6 AM' },
  },
}

export const providerOptions = [
  providerPlaceholder,
  { id: 'sce-tou', name: 'Southern California Edison', planName: 'TOU-D-Prime', planType: 'TOU' },
  { id: 'sdge-ev', name: 'San Diego Gas & Electric', planName: 'EV-TOU-5', planType: 'EV-TOU' },
  { id: 'comed-rtp', name: 'ComEd', planName: 'Real-Time Pricing', planType: 'RTP' },
]
