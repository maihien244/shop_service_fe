import { LoginComponent } from '#/module/auth/component/LoginComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <LoginComponent />
}
