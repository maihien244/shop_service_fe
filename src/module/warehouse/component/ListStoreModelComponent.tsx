import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { StoreModelService } from '../servcie/store-model-service'
import { getStoreModelColumnDef, getSortQuery } from '../ui/StoreModelColumnDef'
import { ListStoreModelFilter, type StoreModelFilterParams } from './ListStoreModelFilter'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { CreateStoreModelModal } from './CreateStoreModelModal'

export function ListStoreModelComponent() {
    const [storeModelService] = useState(() => new StoreModelService())
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createAt', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<StoreModelFilterParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<StoreModelFilterParams>({})

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        }, 500)
        return () => clearTimeout(timer)
    }, [filter])

    const columns = useMemo(() => getStoreModelColumnDef(), [])

    // Convert TanStack sorting state to backend format
    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['store-models', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => storeModelService.getList({ 
            page: pagination.pageIndex, 
            size: pagination.pageSize,
            sort: sortParam,
            'nameLaptop:ct': debouncedFilter.nameLaptopCt || undefined,
            'warehouseId:eq': debouncedFilter.warehouseIdEq || undefined,
            'status:in': debouncedFilter.statusIn && debouncedFilter.statusIn.length > 0 ? debouncedFilter.statusIn : undefined
        }),
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
                        Quản lý mẫu sản phẩm trong kho (Store Models)
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, quản lý, lọc trạng thái và nhập kho số lượng lớn các dòng sản phẩm chi tiết theo Serial.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListStoreModelFilter 
                        filter={filter}
                        onChangeFilter={setFilter}
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled' onClick={() => setIsModalOpen(true)}>
                        Nhập kho sản phẩm
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
                <CreateStoreModelModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    )
}
