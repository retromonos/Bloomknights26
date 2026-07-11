// Placeholder frontend data.
// Replace with verified calculations or API data later.

export const tips = [
  { category: 'timing', text: 'Running your dishwasher after 9 PM can save up to 30% on energy costs.' },
  { category: 'timing', text: 'EV charging between midnight and 6 AM uses the cheapest electricity rates.' },
  { category: 'appliance', text: 'Modern washing machines use about 75% less energy than models from 20 years ago.' },
  { category: 'appliance', text: 'Air-drying clothes just once a week can save around $65 a year.' },
  { category: 'sustainability', text: 'Shifting energy use to off-peak hours often means cleaner electricity from the grid.' },
  { category: 'sustainability', text: 'Solar generation peaks midday — running appliances then can use more renewable energy.' },
  { category: 'savings', text: 'Small daily shifts in energy timing can add up to hundreds of dollars annually.' },
  { category: 'savings', text: 'Time-of-use rate plans reward flexibility with lower prices during off-peak hours.' },
]

export function getRandomTip() {
  return tips[Math.floor(Math.random() * tips.length)]
}

export function getRandomTips(count = 3) {
  const shuffled = [...tips].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
