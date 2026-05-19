import { SsoCallbackComponent } from '#/module/auth/component/SsoCallbackComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/sso/callback')({
    component: RouteComponent,
})

function RouteComponent() {
    return <SsoCallbackComponent />
}
