import { ListBaseCategoryComponent } from '#/module/category/component/ListBaseCategoryComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/categories/base')({
  component: ListBaseCategoryComponent,
})