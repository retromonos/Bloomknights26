import { createFileRoute } from '@tanstack/react-router'
import AppliancesPage from '../../pages/AppliancesPage.jsx'

export const Route = createFileRoute('/onboarding/appliances')({
  component: AppliancesPage,
})
