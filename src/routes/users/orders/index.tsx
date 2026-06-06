import { createFileRoute } from '@tanstack/react-router'
import { ListOrderComponent } from '#/module/orders/component/ListOrderComponent'

export const Route = createFileRoute('/users/orders/')({
  component: ListOrderComponent
})

