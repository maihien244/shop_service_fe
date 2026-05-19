import { createFileRoute } from '@tanstack/react-router'
import { ListPostComponent } from '#/module/post/component/ListPostComponent'

export const Route = createFileRoute('/admin/posts/')({
  component: ListPostComponent,
})
