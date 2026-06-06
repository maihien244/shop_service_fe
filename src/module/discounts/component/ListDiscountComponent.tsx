import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { DiscountService } from '../service/discount-service'
import { Link } from '@tanstack/react-router'
import { getDiscountColumnDef, getSortQuery } from '../ui/DiscountColumnDef'
import { type DiscountResponse } from '../dto'
import { ListDiscountFilter, type DiscountFilterParams } from './ListDiscountFilter'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { UpdateDiscountController } from './UpdateDiscountController'
// import { DiscountPreviewComponent } from './DiscountPreviewComponent' // Create if needed

const discountService = new DiscountService()

export function ListDiscountComponent() {
    const queryClient = useQueryClient()
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'expiredAt', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<DiscountFilterParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<DiscountFilterParams>({})

    // Modal States
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isPreview, setIsPreview] = useState(false)

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(filter)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        }, 500)
        return () => clearTimeout(timer)
    }, [filter])

    const handleEdit = (discount: DiscountResponse) => {
        setSelectedDiscountId(discount.id)
        setIsUpdateOpen(true)
    }

    const handleDelete = (discount: DiscountResponse) => {
        if (confirm(`Are you sure to delete discount with code: ${discount.code}?`)) {
            deleteDiscountMutation.mutate(discount.id)
        }
    }

    const handlePreview = (discount: DiscountResponse) => {
        setSelectedDiscountId(discount.id)
        setIsPreview(true)
    }

    const columns = useMemo(() => getDiscountColumnDef(
        {
            onEdit:handleEdit,
            onDelete:handleDelete,
            onPreview:handlePreview
        }
    ), [])

    // Convert TanStack sorting state to backend format
    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['discounts', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => discountService.getListDiscounts({ 
            page: pagination.pageIndex, 
            size: pagination.pageSize,
            sort: sortParam,
            'name:ct': debouncedFilter.nameCt || undefined,
            'code:eq': debouncedFilter.codeEq || undefined,
            'type:eq': debouncedFilter.typeEq || undefined,
            'isActive': debouncedFilter.isActive || undefined,
            'expiryFrom:ge': debouncedFilter.expiryFromGe || undefined,
            'expiryFrom:le': debouncedFilter.expiryFromLe || undefined,
        }),
    })

    const deleteDiscountMutation = useMutation({
        mutationFn: (id: number) => discountService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts'] })
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
                        Quản lý khuyến mãi
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, chỉnh sửa và quản lý tất cả các mã khuyến mãi trong hệ thống của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListDiscountFilter 
                        filter={filter}
                        onChangeFilter={setFilter}
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled'>
                        <Link
                            to="/admin/discounts/create"
                        >
                            Thêm khuyến mãi
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


            {selectedDiscountId && isUpdateOpen && (
                <UpdateDiscountController
                    discountId={selectedDiscountId}
                    isOpen={isUpdateOpen}
                    onClose={() => {
                        setIsUpdateOpen(false)
                        setSelectedDiscountId(null)
                    }}
                />
            )}

            {/* {selectedDiscountId && isPreview && (
                <DiscountPreviewComponent
                    discountId={selectedDiscountId}
                    isOpen={isPreview}
                    onClose={() => {
                        setIsPreview(false)
                        setSelectedDiscountId(null)
                    }}
                />
            )} */}
        </div>
    )
}
