import { createFileRoute } from '@tanstack/react-router'
import SavingsPage from '../pages/SavingsPage.jsx'

export const Route = createFileRoute('/savings')({
  component: SavingsPage,
})
