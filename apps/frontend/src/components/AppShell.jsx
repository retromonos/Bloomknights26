import { Link } from '@tanstack/react-router'
import { House, Calendar, BarChart3, PiggyBank, Settings } from 'lucide-react'
import { DuckMark } from './Brand.jsx'

const navItems = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/week', label: 'Week', icon: Calendar },
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

      {/* Top navigation */}
      <header className="ww-shell-topbar sticky top-0 z-40">
        <div className="ww-shell-topbar-inner">
          <Link to="/home" className="ww-shell-brand" aria-label="WattWhen home">
            <DuckMark size={42} />
            <span>
              <strong>WattWhen</strong>
            </span>
          </Link>

          <nav className="ww-shell-nav" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{
                    className: 'ww-shell-nav-link is-active',
                  }}
                  inactiveProps={{
                    className: 'ww-shell-nav-link',
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
