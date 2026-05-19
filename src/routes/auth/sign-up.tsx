import { SignUpComponent } from '#/module/auth/component/SignUpComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpComponent />
}
