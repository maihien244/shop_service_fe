import { PaymentComponent } from '#/module/payment/component/PaymentComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/payment/$orderId')({
  component: PaymentComponent,
})
