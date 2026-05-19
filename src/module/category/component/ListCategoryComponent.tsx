import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import type { CategoryParams } from '../service/category-service'
import { getCategoryColumnDef, getSortQuery } from '../ui/category-col-def'
import type { BaseCategoryResponse } from '../dto/base-category.dto'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { useToast } from '#/lib/toast/use-toast'
import { CategoryService } from '../service/category-service'
import type { CategoryResponse } from '../dto/category.dto'
import { ListCategoryFilter } from './ListCategoryFilter'
import { CreateCategoryComponent } from './CreateCategoryComponent'

const categoryService = new CategoryService()

export function ListCategoryComponent() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useToast()
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 2,
    })

    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createAt', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<CategoryParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<CategoryParams>({})
    const [categorySelectId, setCategorySelectId] = useState<number | undefined>(undefined)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        }, 500)
        return () => clearTimeout(timer)
    }, [filter])

    const handleEdit = (category: CategoryResponse) => {
        setCategorySelectId(category.id)
        setEditDialogOpen(true)
    }

    const handleDelete = (category: CategoryResponse) => {
        if (confirm(`Bạn có chắc chắn muốn xóa danh mục: ${category.name}?`)) {
            deleteCategoryMutation.mutate(category.id)
        }
    }

    const handlePreview = (category: BaseCategoryResponse) => {
        console.log('Preview', category.id)
        // TODO: Implement Preview Modal
    }

    const columns = useMemo(() => getCategoryColumnDef(
        {
            onEdit: handleEdit,
            onDelete: handleDelete,
            onPreview: handlePreview
        }
    ), [])

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: number) => categoryService.delete(id),
        onSuccess: () => {
            toastSuccess('Xóa danh mục thành công')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }, onError: () => {
            toastError('Xóa danh mục thất bại')
        }
    })

    // Convert TanStack sorting state to backend format (e.g., "create_at,desc")
    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['categories', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => categoryService.getList({ 
            page: pagination.pageIndex, 
            size: pagination.pageSize,
            sort: sortParam,
            'name:ct': debouncedFilter['name:ct'] || undefined,
            'code:eq': debouncedFilter['code:eq'] || undefined,
            isActive: debouncedFilter['isActive'] !== undefined ? debouncedFilter['isActive'] : undefined
        }),
    })

    const handleClearFilter = () => {
        setFilter({})
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    // Fallback calculation for page count
    const pageCount = data?.total 
        ? Math.ceil(data.total / pagination.pageSize) 
        : data?.nextPageToken ? pagination.pageIndex + 2 : pagination.pageIndex + 1

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-title-h5 font-bold tracking-tight text-text-strong-950 dark:text-static-white">
                        Quản lý danh mục cơ bản
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, chỉnh sửa và quản lý tất cả các danh mục cơ bản trong hệ thống của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListCategoryFilter 
                        filter={filter} 
                        onChangeFilter={setFilter} 
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled' onClick={() => setCreateDialogOpen(true)}>
                        Thêm danh mục
                    </Button.Root>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-bg-white-0 dark:bg-bg-weak-50 border border-stroke-soft-200 dark:border-stroke-sub-300 rounded-24 shadow-regular-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={data?.results || []}
                    pageCount={pageCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    isLoading={isLoading}
                />
            </div>
            
            {createDialogOpen && (
                <CreateCategoryComponent
                    isOpen={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                />
            )}
            {editDialogOpen && (
                <CreateCategoryComponent
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    categoryId={categorySelectId}
                />
            )}
        </div>
    )
}
