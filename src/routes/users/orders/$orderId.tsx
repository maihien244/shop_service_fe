import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailComponent } from '#/module/orders/component/OrderDetailComponent'

export const Route = createFileRoute('/users/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = Route.useParams()
  return <OrderDetailComponent orderId={Number(orderId)} />
}
