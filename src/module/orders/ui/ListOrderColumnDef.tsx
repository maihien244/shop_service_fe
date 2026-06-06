import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import * as Button from '#/components/ui/button'
import * as Select from '#/components/ui/select'
import type { OrderDto } from '../dto'
import { ProcessStatus, PaymentStatus } from '../dto'
import { PaymentType, ShipmentType } from '#/module/cart/dto'

export const getSortQuery = (sorting: SortingState): string => {
    if (sorting.length === 0) return 'createAt,desc'
    return sorting.map(sort => `${sort.id},${sort.desc ? 'desc' : 'asc'}`).join(',')
}

export type OrderColDefProps = {
    onViewDetail: (order: OrderDto) => void
    onStatusChange: (order: OrderDto, newStatus: keyof typeof ProcessStatus) => void
}

export const getOrderColumnDef = (props: OrderColDefProps): ColumnDef<OrderDto>[] => [
    {
        accessorKey: 'id',
        header: 'Mã đơn hàng',
        cell: (info) => <span className="font-medium text-text-sub-600">#{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'fullName',
        header: 'Khách hàng',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-semibold text-text-strong-950 dark:text-static-white">{row.original.fullName}</span>
                <span className="text-xs text-text-sub-600 dark:text-text-soft-400">{row.original.email}</span>
                <span className="text-xs text-text-sub-600 dark:text-text-soft-400">{row.original.phoneNumber}</span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'total',
        header: 'Tổng tiền',
        cell: (info) => (
            <span className="font-medium text-text-strong-950 dark:text-static-white">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(info.getValue() as number)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'paymentType',
        header: 'Thanh toán / Vận chuyển',
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 items-center">
                <span className='p-2 text-green-600 dark:text-green-400 border w-fit px-1 py-0.5 rounded-xl text-xs font-medium text-text-sub-600 dark:text-text-soft-400'>
                    Thanh toán: {PaymentType[row.original.paymentType as keyof typeof PaymentType].label}
                </span>
                <span className="p-2 border w-fit px-1 py-0.5 rounded-xl text-xs font-medium text-text-sub-600 dark:text-text-soft-400">
                    Vận chuyển: {ShipmentType[row.original.shipmentType as keyof typeof ShipmentType].label}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Thanh toán',
        cell: (info) => {
            const status = info.getValue() as keyof typeof PaymentStatus | null | undefined
            if (!status) return <span className="text-text-soft-400">-</span>
            const cfg = PaymentStatus[status]
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-xs font-semibold ${cfg.colorClass}`}>
                    {cfg.label}
                </span>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái đơn hàng',
        cell: ({ row }) => {
            const currentStatus = row.original.status
            return (
                <div className="w-[180px]" onClick={(e) => e.stopPropagation()}>
                    <Select.Root
                        value={currentStatus}
                        onValueChange={(val) => props.onStatusChange(row.original, val as keyof typeof ProcessStatus)}
                    >
                        <Select.Trigger className="h-8 min-h-8 text-xs">
                            <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                            {Object.entries(ProcessStatus).map(([key, config]) => (
                                <Select.Item key={key} value={key} className="text-xs">
                                    {config.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'createAt',
        header: 'Ngày tạo',
        cell: (info) => {
            const dateStr = info.getValue() as string
            if (!dateStr) return <span className="text-text-soft-400">-</span>
            return (
                <span className="text-text-sub-600 dark:text-text-soft-400">
                    {new Date(dateStr).toLocaleString('vi-VN')}
                </span>
            )
        },
        enableSorting: true,
    },
    {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <Button.Root
                        variant="neutral"
                        mode="ghost"
                        className="h-8 w-8 p-0 text-text-sub-600 hover:text-text-strong-950 dark:hover:text-static-white"
                        onClick={() => props.onViewDetail(row.original)}
                    >
                        <Eye size={16} />
                    </Button.Root>
                </div>
            )
        },
        enableSorting: false,
    }
]
