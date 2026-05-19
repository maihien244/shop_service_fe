import { LoginComponent } from '#/module/auth/component/LoginComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
    component: RouteComponent,
})

function RouteComponent() {
    return <LoginComponent />
}
