import { Link } from '@tanstack/react-router'
import { House, Calendar, ListChecks, BarChart3, PiggyBank, Settings } from 'lucide-react'
import { DuckMark } from './Brand.jsx'

const navItems = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/week', label: 'Week', icon: Calendar },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/impact', label: 'Impact', icon: BarChart3 },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppShell({ children, announcement }) {
  return (
    <div className="ww-app-shell min-h-screen bg-white">
      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg focus:outline-2 focus:outline-[var(--lagoon)]"
      >
        Skip to content
      </a>

      {/* aria-live announcer */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement || ''}
      </div>

      {/* Desktop side nav */}
      <nav
        className="fixed left-0 top-0 hidden h-full w-[82px] flex-col items-center border-r-2 border-black bg-white py-4 lg:flex"
        aria-label="Main navigation"
      >
        <div className="mb-6"><DuckMark size={45} /></div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{
                className:
                  'mb-1 flex w-14 flex-col items-center rounded-xl px-2 py-2 text-[10px] font-medium bg-[var(--foam)] text-[var(--lagoon-deep)]',
              }}
              inactiveProps={{
                className:
                  'mb-1 flex w-14 flex-col items-center rounded-xl px-2 py-2 text-[10px] font-medium text-[var(--sea-ink-soft)] hover:bg-[var(--sand)]',
              }}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-bold text-[var(--lagoon)]">WattWhen</span>
      </header>

      {/* Main content */}
      <main id="main-content" className="pb-20 lg:ml-[82px] lg:pb-0" tabIndex={-1}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--line)] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{
                className:
                  'flex flex-col items-center px-3 py-2 text-[10px] font-medium text-[var(--lagoon-deep)]',
              }}
              inactiveProps={{
                className:
                  'flex flex-col items-center px-3 py-2 text-[10px] font-medium text-[var(--sea-ink-soft)]',
              }}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
