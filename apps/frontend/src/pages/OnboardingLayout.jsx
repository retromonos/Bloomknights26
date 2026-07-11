import { Outlet, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--line)] bg-white px-4 py-3">
        <Link to="/" className="rounded-lg p-1 hover:bg-[var(--sand)]" aria-label="Back to home">
          <ArrowLeft size={20} className="text-[var(--sea-ink)]" />
        </Link>
        <span className="text-sm font-bold text-[var(--lagoon)]">WattWhen</span>
        <span className="text-xs text-[var(--sea-ink-soft)]">Setup</span>
      </header>
      <Outlet />
    </div>
  )
}
