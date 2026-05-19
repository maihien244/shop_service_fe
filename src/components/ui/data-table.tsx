import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
    type OnChangeFn,
} from "@tanstack/react-table"
import { clsx } from "clsx"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { LoadingComponent } from "./loading"
import { PaginationComponent } from "./pagination-component"
import * as Input from "./input"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount?: number
    pagination?: PaginationState
    setPagination?: (pagination: any) => void
    sorting?: SortingState
    onSortingChange?: OnChangeFn<SortingState>
    isLoading?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount = -1,
    pagination,
    setPagination,
    sorting,
    onSortingChange,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        pageCount,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: onSortingChange,
        manualPagination: true,
        manualSorting: true,
    })

    const [inputPageSize, setInputPageSize] = useState(pagination?.pageSize || 10)

    const updatePageSize = (value: string) => {
        const numValue = Number(value)
        if (!isNaN(numValue) && numValue > 0) {
            table.setPageSize(numValue)
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-max text-left text-paragraph-sm text-text-strong-950 dark:text-static-white">
                        <thead className="bg-bg-weak-50 dark:bg-bg-surface-800">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-stroke-soft-200 dark:border-stroke-sub-300">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th
                                                key={header.id}
                                                className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={clsx(
                                                            header.column.getCanSort() &&
                                                                "flex cursor-pointer select-none items-center gap-2 hover:text-text-strong-950"
                                                        )}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <div className="shrink-0">
                                                                {{
                                                                    asc: <ArrowUp size={14} className="text-primary-base" />,
                                                                    desc: <ArrowDown size={14} className="text-primary-base" />,
                                                                }[header.column.getIsSorted() as string] ?? (
                                                                    <ArrowUpDown size={14} className="opacity-20" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-stroke-soft-200 dark:divide-stroke-sub-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-10 text-center">
                                        <LoadingComponent />
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="transition-colors duration-200 hover:bg-bg-weak-50/50 dark:hover:bg-bg-surface-800/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-10 text-center text-text-sub-600 dark:text-text-soft-400">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && (
                <div className="flex items-center justify-center px-2 pb-2">
                    <PaginationComponent table={table} />
                    <Input.Root className="w-15 px-3">
                        <Input.Input
                            type="number"
                            max={100}
                            step={10}
                            value={inputPageSize}
                            onChange={(e) => {
                                const { value } = e.target
                                setInputPageSize(Number(value))
                            }}
                            onBlur={(e) => {
                                updatePageSize(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.key !== 'Enter') return;
                                updatePageSize(e.currentTarget.value)
                            }}
                        />
                    </Input.Root>
                </div>
            )}
        </div>
    )
}
