import { createFileRoute } from '@tanstack/react-router'
import OnboardingLayout from '../pages/OnboardingLayout.jsx'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingLayout,
})
