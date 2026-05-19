import { createFileRoute } from '@tanstack/react-router'
import { CreatePostComponent } from '#/module/post/component/CreatePostComponent'

export const Route = createFileRoute('/admin/posts/create')({
  component: CreatePostComponent,
})
