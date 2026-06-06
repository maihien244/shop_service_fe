import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '../layouts/admin'
import { AdminGuard } from '#/module/auth/context/auth-context'

export const Route = createFileRoute('/admin')({
  component: () => (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  ),
})
