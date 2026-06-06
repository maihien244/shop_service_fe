import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useAuth } from '#/module/auth/context/auth-context'
import { RequireLoginModal } from '#/module/auth/component/RequireLoginModal'
import { NotFoundComponent } from '#/components/ui/NotFoundComponent'

import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  const { auth } = useAuth()
  return (
    <>
      <Outlet />
      <RequireLoginModal isOpen={auth.isLoginModalOpen} onClose={auth.closeLoginModal} />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
