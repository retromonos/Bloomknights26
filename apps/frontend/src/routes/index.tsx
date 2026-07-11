import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '../pages/LandingPage.jsx'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
