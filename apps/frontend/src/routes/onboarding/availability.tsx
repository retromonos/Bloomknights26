import { createFileRoute } from '@tanstack/react-router'
import AvailabilityPage from '../../pages/AvailabilityPage.jsx'

export const Route = createFileRoute('/onboarding/availability')({
  component: AvailabilityPage,
})
