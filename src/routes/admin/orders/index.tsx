import { createFileRoute } from '@tanstack/react-router'
import { ListOrderTableComponent } from '#/module/orders/component/admin/ListOrderTableComponent'

export const Route = createFileRoute('/admin/orders/')({
  component: ListOrderTableComponent,
})
