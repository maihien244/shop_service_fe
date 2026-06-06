import { createFileRoute } from '@tanstack/react-router'
import { CartComponent } from '../../../module/cart/component/CartComponent'

export const Route = createFileRoute('/users/carts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CartComponent />
}
