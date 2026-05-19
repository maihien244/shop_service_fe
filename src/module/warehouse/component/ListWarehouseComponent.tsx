import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { WarehouseService } from '../servcie/warehouse-service'
import { getWarehouseColumnDef, getSortQuery } from '../ui/WarehouseColumnDef'
import { type WarehouseDto } from '../dto/warehouse.dto'
import { ListWarehouseFilter, type WarehouseFilterParams } from './ListWarehouseFilter'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { CreateWarehouseModal } from './CreateWarehouseModal'
import { useToast } from '#/lib/toast/use-toast'

export function ListWarehouseComponent() {
    const queryClient = useQueryClient()
    const [warehouseService] = useState(() => new WarehouseService())
    const { toastSuccess, toastError } = useToast()
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createAt', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<WarehouseFilterParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<WarehouseFilterParams>({})

    // Modal States
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        }, 500)
        return () => clearTimeout(timer)
    }, [filter])

    const handleEdit = (warehouse: WarehouseDto) => {
        setSelectedWarehouseId(warehouse.id)
        setIsModalOpen(true)
    }
    

    const handleDelete = (warehouse: WarehouseDto) => {
        if (confirm(`Bạn có chắc chắn muốn xóa kho hàng: ${warehouse.name}?`)) {
            deleteMutation.mutate(warehouse.id)
        }
    }

    const columns = useMemo(() => getWarehouseColumnDef({
        onEdit: handleEdit,
        onDelete: handleDelete,
    }), [])

    // Convert TanStack sorting state to backend format
    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['warehouses', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => warehouseService.getList({ 
            page: pagination.pageIndex, 
            size: pagination.pageSize,
            sort: sortParam,
            'name:ct': debouncedFilter.nameCt || undefined,
            isActive: debouncedFilter.isActive !== undefined ? debouncedFilter.isActive : undefined
        }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => warehouseService.delete(id),
        onSuccess: () => {
            toastSuccess("Xóa kho hàng thành công")
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
        onError: () => {
            toastError("Xóa kho hàng thất bại")
        }
    })

    const handleClearFilter = () => {
        setFilter({})
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const pageCount = data?.total 
        ? Math.ceil(data.total / pagination.pageSize) 
        : data?.nextPageToken ? pagination.pageIndex + 2 : pagination.pageIndex + 1

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-title-h5 font-bold tracking-tight text-text-strong-950 dark:text-static-white">
                        Quản lý kho hàng
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, chỉnh sửa, thêm mới và quản lý tất cả các kho hàng của hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListWarehouseFilter 
                        filter={filter}
                        onChangeFilter={setFilter}
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled' onClick={() => {
                        setSelectedWarehouseId(undefined)
                        setIsModalOpen(true)
                    }}>
                        Thêm kho hàng
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

            {isModalOpen && (
                <CreateWarehouseModal
                    warehouseId={selectedWarehouseId}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedWarehouseId(undefined)
                    }}
                />
            )}
        </div>
    )
}
