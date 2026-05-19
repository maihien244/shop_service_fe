import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import * as Button from '#/components/ui/button'
import type { LaptopResponse } from '../dto'

export const getSortQuery = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) return 'createAt,desc'
    return sorting.map(sort => `${sort.id},${sort.desc ? 'desc' : 'asc'}`).join(',')
}

export type LaptopColDefProps = {
    onEdit: (laptop: LaptopResponse) => void
    onDelete: (laptop: LaptopResponse) => void
    onPreview: (laptop: LaptopResponse) => void
}

export const getLaptopColumnDef = (props: LaptopColDefProps): ColumnDef<LaptopResponse>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => <span className="font-medium text-text-sub-600">#{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'name',
        header: 'Tên sản phẩm',
        cell: (info) => <span className="font-semibold text-text-strong-950">{info.getValue() as string}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'originalPrice',
        header: 'Giá gốc',
        cell: (info) => <span className="font-medium text-text-strong-950">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(info.getValue() as number)}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: (info) => {
            const isActive = info.getValue() as number
            return (
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-xs font-semibold ${
                    isActive 
                        ? 'bg-success-lighter text-success-darker dark:bg-success-alpha-10 dark:text-success-base' 
                        : 'bg-error-lighter text-error-darker dark:bg-error-alpha-10 dark:text-error-base'
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-success-base' : 'bg-error-base'}`}></span>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </div>
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
                        onClick={() => props.onPreview(row.original)}
                    >
                        <Eye size={16} />
                    </Button.Root>
                    <Button.Root
                        variant="primary"
                        mode="ghost"
                        className="h-8 w-8 p-0 text-primary-base hover:text-primary-darker dark:hover:text-primary-lighter"
                        onClick={() => props.onEdit(row.original)}
                    >
                        <Pencil size={16} />
                    </Button.Root>
                    <Button.Root
                        variant="error"
                        mode="ghost"
                        className="h-8 w-8 p-0 text-error-base hover:text-error-darker dark:hover:text-error-lighter"
                        onClick={() => props.onDelete(row.original)}
                    >
                        <Trash2 size={16} />
                    </Button.Root>
                </div>
            )
        },
        enableSorting: false,
    }
]
