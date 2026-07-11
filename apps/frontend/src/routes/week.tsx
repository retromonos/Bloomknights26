import { createFileRoute } from '@tanstack/react-router'
import WeekPage from '../pages/WeekPage.jsx'

export const Route = createFileRoute('/week')({
  component: WeekPage,
})
