import { createFileRoute } from '@tanstack/react-router'
import { ListLaptopComponent } from '#/module/laptop/component/ListLaptopComponent'

export const Route = createFileRoute('/admin/laptops/')({
  component: ListLaptopComponent,
})
