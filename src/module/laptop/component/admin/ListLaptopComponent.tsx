import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { LaptopService } from '../../service/laptop-service'
import { Link, useNavigate } from '@tanstack/react-router'
import { getLaptopColumnDef, getSortQuery } from '../../ui/laptop-col-def'
import type { LaptopResponse } from '../../dto'
import { ListLaptopFilter, type LaptopFilterParams } from './ListLaptopFilter'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { useToast } from '#/lib/toast/use-toast'

const laptopService = new LaptopService()

export function ListLaptopComponent() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useToast()
    const navigate = useNavigate()
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<LaptopFilterParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<LaptopFilterParams>({})

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        }, 500)
        return () => clearTimeout(timer)
    }, [filter])

    const handleEdit = (laptop: LaptopResponse) => {
        navigate({ to: '/admin/laptops/create', search: { laptopId: laptop.id } })
    }

    const handleDelete = (laptop: LaptopResponse) => {
        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${laptop.name}?`)) {
            deleteMutation.mutate(laptop.id)
        }
    }

    const handlePreview = (laptop: LaptopResponse) => {
        // TODO: Implement Preview Modal
        console.log('Preview laptop:', laptop)
    }

    const columns = useMemo(() => getLaptopColumnDef(
        {
            onEdit: handleEdit,
            onDelete: handleDelete,
            onPreview: handlePreview
        }
    ), [])

    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['laptops', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => laptopService.getList({ 
            // Mocking 'page', 'size', 'sort' properties by extending LaptopParams or directly casting
            // We use 'as any' here because LaptopService.getList expects CreateLaptopRequest as params in current definition,
            // we should ideally update LaptopService to accept a generic Params object, but this is a quick pass.
            ...( { 
                page: pagination.pageIndex, 
                size: pagination.pageSize,
                sort: sortParam,
                'name:ct': debouncedFilter['name:ct'] || undefined,
                isActive: debouncedFilter.isActive !== undefined ? debouncedFilter.isActive : undefined
            } as any)
        }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => laptopService.delete(id),
        onSuccess: () => {
            toastSuccess('Xóa sản phẩm thành công')
            queryClient.invalidateQueries({ queryKey: ['laptops'] })
        },
        onError: () => {
            toastError('Xóa sản phẩm thất bại')
        }
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
                        Quản lý sản phẩm (Laptop)
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, chỉnh sửa và quản lý tất cả các sản phẩm laptop trong hệ thống của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListLaptopFilter 
                        filter={filter}
                        onChangeFilter={setFilter}
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled'>
                        <Link to="/admin/laptops/create">
                            Thêm sản phẩm
                        </Link>
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
        </div>
    )
}
