import { PublicLayout } from '#/layouts/public'
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { AuthGuard } from '#/module/auth/context/auth-context'
import { type RoleDefault } from '#/lib/dto/role-default'

export const Route = createFileRoute('/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const isUserRoute = location.pathname.startsWith('/users')
  const isCartRoute = location.pathname.startsWith('/users/carts')

  if (!isUserRoute || isCartRoute) {
    return <PublicLayout />
  }

  return (
    <AuthGuard allowedRoles={["CUSTOMER" as RoleDefault]}>
      <PublicLayout />
    </AuthGuard>
  )
}

