import { Link } from '@tanstack/react-router'
import { Zap, Clock, Users } from 'lucide-react'

const benefits = [
  { icon: Clock, title: 'Smarter timing', desc: 'Shift flexible tasks to cheaper, cleaner hours.' },
  { icon: Zap, title: 'Lower bills', desc: 'Save money by using energy when rates are lowest.' },
  { icon: Users, title: 'Built for you', desc: 'Personalized to your appliances and schedule.' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Duck mascot placeholder */}
      <div className="mb-6">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-label="WattWhen duck mascot">
          <circle cx="60" cy="60" r="56" fill="var(--foam)" stroke="var(--lagoon)" strokeWidth="2" />
          <ellipse cx="60" cy="68" rx="30" ry="26" fill="var(--lagoon)" opacity="0.2" />
          <circle cx="48" cy="48" r="5" fill="var(--sea-ink)" />
          <circle cx="72" cy="48" r="5" fill="var(--sea-ink)" />
          <ellipse cx="60" cy="60" rx="10" ry="6" fill="#f59e0b" />
          <path d="M40 78 Q60 92 80 78" stroke="var(--lagoon)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <h1 className="mb-2 text-3xl font-bold text-[var(--sea-ink)]">WattWhen</h1>
      <p className="mb-1 text-lg text-[var(--lagoon-deep)]">Use energy at a better time.</p>
      <p className="mb-8 max-w-sm text-center text-sm text-[var(--sea-ink-soft)]">
        WattWhen helps you schedule household appliances around cheaper, cleaner electricity windows — no spreadsheets required.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/onboarding/location"
          className="rounded-xl bg-[var(--lagoon)] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)] focus:outline-2 focus:outline-[var(--lagoon)]"
        >
          Build my plan
        </Link>
        <Link
          to="/week"
          className="rounded-xl border border-[var(--line)] px-6 py-3 text-center text-sm font-medium text-[var(--sea-ink)] hover:bg-[var(--sand)] focus:outline-2 focus:outline-[var(--lagoon)]"
        >
          Explore a sample week
        </Link>
      </div>

      <div className="mt-12 grid max-w-lg gap-4 sm:grid-cols-3">
        {benefits.map((b) => {
          const Icon = b.icon
          return (
            <div key={b.title} className="rounded-xl border border-[var(--line)] p-4 text-center">
              <Icon size={24} className="mx-auto mb-2 text-[var(--lagoon)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--sea-ink)]">{b.title}</p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{b.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
