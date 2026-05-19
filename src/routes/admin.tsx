import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '../layouts/admin'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})
