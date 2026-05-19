import { clsx } from 'clsx'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { PostStatus, type PostDto } from '../dto'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import * as Button from '#/components/ui/button'

export const getSortQuery = (sorting: SortingState): string => {
    if (!sorting || sorting.length === 0) return 'create_at,desc'
    const s = sorting[0]
    // Map camelCase DTO fields to snake_case backend fields if necessary
    const fieldMap: Record<string, string> = {
        createAt: 'create_at',
        updateAt: 'update_at',
        title: 'title',
        status: 'status',
        id: 'id'
    }
    const field = fieldMap[s.id] || s.id
    return `${field},${s.desc ? 'desc' : 'asc'}`
}


export type PostColumnDefProps = {
    onEdit: (post: PostDto) => void
    onDelete: (post: PostDto) => void
    onPreview: (post: PostDto) => void
}


export const getPostColumnDef = (props: PostColumnDefProps): ColumnDef<PostDto>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => <span className="font-medium text-text-sub-600">{info.getValue() as number}</span>,
        enableSorting: true,
    },
    {
        accessorKey: 'title',
        header: 'Tiêu đề',
        cell: (info) => (
            <div className="max-w-md truncate font-semibold text-text-strong-950 dark:text-static-white">
                {info.getValue() as string}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: (info) => {
            const status = info.getValue() as keyof typeof PostStatus
            return (
                <span
                    className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-xs font-semibold uppercase tracking-wider",
                        status === PostStatus.ACTIVE.value && "bg-success-lighter text-success-base dark:bg-success-dark dark:text-static-white",
                        status === PostStatus.DRAFT.value && "bg-warning-lighter text-warning-base dark:bg-warning-dark dark:text-static-white",
                        status === PostStatus.DELETED.value && "bg-error-lighter text-error-base dark:bg-error-dark dark:text-static-white"
                    )}
                >
                    {status}
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