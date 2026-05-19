import { clsx } from 'clsx'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { type CountStoreModelResponse, StoreModelStatus } from '../dto/store-model.dto'

export const getSortQuery = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) return 'quantity,desc'
    const s = sorting[0]
    const fieldMap: Record<string, string> = {
        laptopName: 'laptopName',
        warehouseName: 'warehouseName',
        quantity: 'quantity'
    }
    const field = fieldMap[s.id] || s.id
    return `${field},${s.desc ? 'desc' : 'asc'}`
}

export const getStoreModelColumnDef = (): ColumnDef<CountStoreModelResponse>[] => [
    {
        accessorKey: 'STT',
        header: 'STT',
        cell: (info) => <span className="font-medium text-text-sub-600">{info.row.index + 1}</span>,
        enableSorting: false,
    },
    {
        accessorKey: 'laptopName',
        header: 'Tên sản phẩm',
        cell: (info) => (
            <div className="max-w-md truncate font-semibold text-text-strong-950 dark:text-static-white">
                {info.getValue() as string}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'warehouseName',
        header: 'Kho hàng',
        cell: (info) => (
            <span className="max-w-md truncate font-semibold text-text-strong-950 dark:text-static-white">
                {info.getValue() as string}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: (info) => {
            const status = info.getValue() as keyof typeof StoreModelStatus
            const statusInfo = StoreModelStatus[status] || { label: status, value: status }
            return (
                <span
                    className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-xs font-semibold uppercase tracking-wider",
                        status === 'NEW' && "bg-success-lighter text-success-base dark:bg-success-dark dark:text-static-white",
                        status === 'ORDERED' && "bg-warning-lighter text-warning-base dark:bg-warning-dark dark:text-static-white",
                        status === 'SOLD' && "bg-primary-lighter text-primary-base dark:bg-primary-dark dark:text-static-white",
                        status === 'REFUND' && "bg-error-lighter text-error-base dark:bg-error-dark dark:text-static-white"
                    )}
                >
                    {statusInfo.label}
                </span>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'quantity',
        header: 'Số lượng',
        cell: (info) => (
            <span className="text-text-sub-600 dark:text-text-soft-400 font-semibold">
                {info.getValue() as number}
            </span>
        ),
        enableSorting: true,
    }
]
