import { createFileRoute } from '@tanstack/react-router'
import { CreateDiscountComponent } from '#/module/discounts/component/CreateDiscountComponent'

export const Route = createFileRoute('/admin/discounts/create')({
  component: CreateDiscountComponent,
})
