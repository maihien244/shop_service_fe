import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { AdminOrderService } from '../../service/admin-order-service'
import { useNavigate } from '@tanstack/react-router'
import { getOrderColumnDef, getSortQuery } from '../../ui/ListOrderColumnDef'
import type { OrderDto, ProcessStatus } from '../../dto'
import type { SortingState } from '@tanstack/react-table'
import { useToast } from '#/lib/toast/use-toast'

const adminOrderService = new AdminOrderService()

export function ListOrderTableComponent() {
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

    const handleViewDetail = (order: OrderDto) => {
        navigate({ to: `/admin/orders/${order.id}` as any })
    }

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: number, status: keyof typeof ProcessStatus }) =>
            adminOrderService.updateProcessStatus(orderId, status),
        onSuccess: () => {
            toastSuccess('Cập nhật trạng thái đơn hàng thành công')
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        },
        onError: (err: any) => {
            console.error(err)
            toastError('Cập nhật trạng thái đơn hàng thất bại')
        }
    })

    const handleStatusChange = (order: OrderDto, newStatus: keyof typeof ProcessStatus) => {
        updateStatusMutation.mutate({ orderId: order.id, status: newStatus })
    }

    const columns = useMemo(() => getOrderColumnDef({
        onViewDetail: handleViewDetail,
        onStatusChange: handleStatusChange
    }), [])

    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', pagination.pageIndex, pagination.pageSize, sortParam],
        queryFn: () => adminOrderService.getList({
            page: pagination.pageIndex,
            size: pagination.pageSize,
            sort: sortParam
        })
    })

    // Fallback calculation for page count
    const pageCount = data?.total
        ? Math.ceil(data.total / pagination.pageSize)
        : data?.nextPageToken ? pagination.pageIndex + 2 : pagination.pageIndex + 1

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-title-h5 font-bold tracking-tight text-text-strong-950 dark:text-static-white">
                    Quản lý đơn hàng
                </h1>
                <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                    Xem và quản lý trạng thái xử lý các đơn hàng trong hệ thống.
                </p>
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
