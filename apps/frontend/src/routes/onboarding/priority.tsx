import { createFileRoute } from '@tanstack/react-router'
import PriorityPage from '../../pages/PreferencesPage.jsx'

export const Route = createFileRoute('/onboarding/priority')({
  component: PriorityPage,
})
