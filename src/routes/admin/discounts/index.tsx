import { createFileRoute } from '@tanstack/react-router'
import { ListDiscountComponent } from '#/module/discounts/component/ListDiscountComponent'

export const Route = createFileRoute('/admin/discounts/')({
  component: ListDiscountComponent,
})
