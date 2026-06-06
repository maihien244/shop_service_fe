import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/public/posts/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/users/posts/$slug"!</div>
}
