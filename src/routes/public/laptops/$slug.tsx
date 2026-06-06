import { createFileRoute } from '@tanstack/react-router'
import { LaptopDetailComponent } from '../../../module/laptop/component/public/LaptopDetailComponent'

export const Route = createFileRoute('/public/laptops/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  return <LaptopDetailComponent slug={slug} />
}
