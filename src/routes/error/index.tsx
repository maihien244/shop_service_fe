import { createFileRoute } from '@tanstack/react-router'
import { ErrorComponent } from '#/module/error/component/ErrorComponent'

type ErrorSearch = {
    status?: number
}

export const Route = createFileRoute('/error/')({
    validateSearch: (search: Record<string, unknown>): ErrorSearch => {
        return {
            status: Number(search.status) || 500,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { status } = Route.useSearch()
    return <ErrorComponent status={status || 500} />
}
