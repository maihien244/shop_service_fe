import { ViewOrderDetailComponent } from '#/module/orders/component/admin/ViewOrderDetailComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = Route.useParams()
  return <ViewOrderDetailComponent orderId={Number(orderId)} />
}
