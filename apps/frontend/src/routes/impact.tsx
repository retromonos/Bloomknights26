import { createFileRoute } from '@tanstack/react-router'
import ImpactPage from '../pages/ImpactPage.jsx'

export const Route = createFileRoute('/impact')({
  component: ImpactPage,
})
