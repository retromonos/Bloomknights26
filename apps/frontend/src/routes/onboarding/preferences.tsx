import { createFileRoute } from '@tanstack/react-router'
import PreferencesPage from '../../pages/PreferencesPage.jsx'

export const Route = createFileRoute('/onboarding/preferences')({
  component: PreferencesPage,
})
