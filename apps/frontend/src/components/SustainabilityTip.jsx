import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'
import { getRandomTip } from '../data/tips.js'

export default function SustainabilityTip() {
  const [tip, setTip] = useState(null)

  useEffect(() => {
    setTip(getRandomTip())
  }, [])

  if (!tip) return null

  return (
    <div className="flex items-start gap-2 rounded-xl bg-[var(--foam)] p-3">
      <Leaf size={16} className="mt-0.5 shrink-0 text-[var(--palm)]" aria-hidden="true" />
      <p className="text-xs text-[var(--sea-ink-soft)]">{tip.text}</p>
    </div>
  )
}
