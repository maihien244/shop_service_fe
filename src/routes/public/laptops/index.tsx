import { createFileRoute } from '@tanstack/react-router'
import { ListPublicLaptopComponnet } from '#/module/laptop/component/public/ListPublicLaptopComponnet'

export const Route = createFileRoute('/public/laptops/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ListPublicLaptopComponnet />
}

