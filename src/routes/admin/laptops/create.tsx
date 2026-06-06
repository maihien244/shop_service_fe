import { createFileRoute } from '@tanstack/react-router'
import { CreateLaptopComponent } from '#/module/laptop/component/admin/CreateLaptopComponent'

export const Route = createFileRoute('/admin/laptops/create')({
  component: CreateLaptopComponent,
})
