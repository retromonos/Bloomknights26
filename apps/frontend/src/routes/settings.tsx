import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '../pages/SettingsPage.jsx'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
