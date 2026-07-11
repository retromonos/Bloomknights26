import { createFileRoute } from '@tanstack/react-router'
import GeneratePage from '../../pages/GeneratePage.jsx'

export const Route = createFileRoute('/onboarding/generate')({
  component: GeneratePage,
})
