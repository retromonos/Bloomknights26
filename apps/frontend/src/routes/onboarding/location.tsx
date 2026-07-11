import { createFileRoute } from '@tanstack/react-router'
import LocationPage from '../../pages/LocationPage.jsx'

export const Route = createFileRoute('/onboarding/location')({
  component: LocationPage,
})
