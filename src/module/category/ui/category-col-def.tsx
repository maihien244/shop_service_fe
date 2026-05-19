import { clsx } from 'clsx'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import * as Button from '#/components/ui/button'
import type { CategoryResponse } from '../dto/category.dto';

export const getSortQuery = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) return 'create_at,desc'
    const s = sorting[0]
    // Map camelCase DTO fields to snake_case backend fields if necessary
    const fieldMap: Record<string, string> = {
        createAt: 'create_at',
        updateAt: 'update_at',
        name: 'name',
        code: 'code',
        id: 'id'
    }
    const field = fieldMap[s.id] || s.id
    return `${field},${s.desc ? 'desc' : 'asc'}`
}


export type CategoryColDefProps = {
    onEdit: (post: CategoryResponse) => void
    onDelete: (post: CategoryResponse) => void
    onPreview: (post: CategoryResponse) => void
}


export const getCategoryColumnDef = (props: CategoryColDefProps): ColumnDef<CategoryResponse>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => <span className="font-medium text-text-sub-600">{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'name',
        header: 'Tên danh mục',
        cell: (info) => (
            <div className="max-w-md truncate font-semibold text-text-strong-950 dark:text-static-white">
                {info.getValue() as string}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'code',
        header: 'Mã danh mục',
        cell: (info) => <span className="font-semibold text-text-strong-950">{info.getValue() as string}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'baseCodeName',
        header: 'Danh mục cha',
        cell: (info) => <span className="font-semibold text-text-strong-950">{info.getValue() as string}</span>,
        enableSorting: false,
    },
    {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: (info) => {
            const status = info.getValue() as number
            return (
                <span
                    className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-xs font-semibold uppercase tracking-wider",
                        status === 1 && "bg-success-lighter text-success-base dark:bg-success-dark dark:text-static-white", 
                        status === 0 && "bg-error-lighter text-error-base dark:bg-error-dark dark:text-static-white"
                    )}
                >
                    {status === 1 ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'createAt',
        header: 'Ngày tạo',
        cell: (info) => {
            const date = info.getValue() as string
            const newDate = date ? new Date(date).toLocaleDateString() : 'N/A'
            return <span className="font-semibold text-text-strong-950">{newDate}</span>
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

                    {/* <Button.Root variant='neutral' size='xsmall' mode='ghost' onClick={() => props.onPreview(info.row.original)}>
                        <Button.Icon as={Eye} />
                    </Button.Root> */}

                    <Button.Root variant='error' size='xsmall' mode='ghost' onClick={() => props.onDelete(info.row.original)}>
                        <Button.Icon as={Trash2} />
                    </Button.Root>
                    
                </div>
            )
        },
        enableSorting: false,
    },
]