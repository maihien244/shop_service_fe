import { ListCategoryComponent } from '#/module/category/component/ListCategoryComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/categories/')({
  component: ListCategoryComponent,
})
