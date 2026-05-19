import { clsx } from 'clsx'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { DiscountType, type DiscountResponse } from '../dto'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import * as Button from '#/components/ui/button'

export const getSortQuery = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) return 'expired_at,desc'
    const s = sorting[0]
    // Map camelCase DTO fields to snake_case backend fields if necessary
    const fieldMap: Record<string, string> = {
        expiredAt: 'expired_at',
        isActive: 'is_active',
        name: 'name',
        code: 'code',
        type: 'type',
        quantity: 'quantity',
        id: 'id'
    }
    const field = fieldMap[s.id] || s.id
    return `${field},${s.desc ? 'desc' : 'asc'}`
}

export type DiscountColumnDefProps = {
    onEdit: (discount: DiscountResponse) => void
    onDelete: (discount: DiscountResponse) => void
    onPreview: (discount: DiscountResponse) => void
}

export const getDiscountColumnDef = (props: DiscountColumnDefProps): ColumnDef<DiscountResponse>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => <span className="font-medium text-text-sub-600">{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'code',
        header: 'Mã Code',
        cell: (info) => (
            <div className="font-semibold text-text-strong-950 dark:text-static-white uppercase">
                {info.getValue() as string}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'name',
        header: 'Tên khuyến mãi',
        cell: (info) => (
            <div className="max-w-md truncate text-text-strong-950 dark:text-static-white">
                {info.getValue() as string}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'type',
        header: 'Loại',
        cell: (info) => {
            const type = info.getValue() as keyof typeof DiscountType
            return (
                <span className="text-sm">
                    {DiscountType[type]?.label || type}
                </span>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'quantity',
        header: 'Số lượng',
        cell: (info) => <span className="text-text-sub-600">{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: (info) => {
            const isActive = info.getValue() === "true" || info.getValue() === true
            return (
                <span
                    className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-xs font-semibold uppercase tracking-wider",
                        isActive ? "bg-success-lighter text-success-base dark:bg-success-dark dark:text-static-white" : "bg-error-lighter text-error-base dark:bg-error-dark dark:text-static-white"
                    )}
                >
                    {isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'expiredAt',
        header: 'Ngày hết hạn',
        cell: (info) => {
            const date = info.getValue() as string
            return date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        enableSorting: true,
    },
    {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => {
            return (
                <div className="flex items-center gap-3">
                    <Button.Root variant='primary' size='xsmall' mode='ghost' onClick={() => props.onEdit(info.row.original)}>
                        <Button.Icon as={Pencil} />
                    </Button.Root>

                    <Button.Root variant='neutral' size='xsmall' mode='ghost' onClick={() => props.onPreview(info.row.original)}>
                        <Button.Icon as={Eye} />
                    </Button.Root>

                    <Button.Root variant='error' size='xsmall' mode='ghost' onClick={() => props.onDelete(info.row.original)}>
                        <Button.Icon as={Trash2} />
                    </Button.Root>
                </div>
            )
        },
        enableSorting: false,
    },
]
