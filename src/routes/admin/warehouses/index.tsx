import { createFileRoute } from '@tanstack/react-router'
import { ListWarehouseComponent } from '#/module/warehouse/component/ListWarehouseComponent'

export const Route = createFileRoute('/admin/warehouses/')({
  component: ListWarehouseComponent,
})
