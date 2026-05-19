import { ListStoreModelComponent } from '#/module/warehouse/component/ListStoreModelComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/warehouses/storage')({
  component: ListStoreModelComponent,
})
