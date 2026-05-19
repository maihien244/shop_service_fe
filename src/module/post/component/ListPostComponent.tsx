import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '#/components/ui/data-table'
import { PostService } from '../service/post-service'
import { Link } from '@tanstack/react-router'
import { getPostColumnDef, getSortQuery } from '../ui/PostColumnDef'
import { UpdatePostController } from './UpdatePostController'
import { type PostDto } from '../dto'
import { ListPostFilter, type PostFilterParams } from './ListPostFilter'
import * as Button from '#/components/ui/button'
import { type SortingState } from '@tanstack/react-table'
import { PostPreviewComponent } from './PostPreviewComponent'

const postService = new PostService()

export function ListPostComponent() {
    const queryClient = useQueryClient()
    
    // Pagination State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 2,
    })

    // Sorting State
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createAt', desc: true }])
    
    // Filter States
    const [filter, setFilter] = useState<PostFilterParams>({})
    const [debouncedFilter, setDebouncedFilter] = useState<PostFilterParams>({})

    // Modal States
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
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

    const handleEdit = (post: PostDto) => {
        setSelectedPostId(post.id)
        setIsUpdateOpen(true)
    }

    const handleDelete = (post: PostDto) => {
        if (confirm(`Are you sure to delete post with title: ${post.title}?`)) {
            deletePostMutation.mutate(post.id)
        }
    }

    const handlePreview = (post: PostDto) => {
        setSelectedPostId(post.id)
        setIsPreview(true)
    }

    const columns = useMemo(() => getPostColumnDef(
        {
            onEdit:handleEdit,
            onDelete:handleDelete,
            onPreview:handlePreview
        }
    ), [])

    // Convert TanStack sorting state to backend format (e.g., "create_at,desc")
    const sortParam = useMemo(() => getSortQuery(sorting), [sorting])

    const { data, isLoading } = useQuery({
        queryKey: ['posts', pagination.pageIndex, pagination.pageSize, debouncedFilter, sortParam],
        queryFn: () => postService.getPosts({ 
            page: pagination.pageIndex, 
            size: pagination.pageSize,
            sort: sortParam,
            'title:ct': debouncedFilter.titleCt || undefined,
            'createAt:ge': debouncedFilter.createAtGe || undefined,
            'createAt:le': debouncedFilter.createAtLe || undefined,
            'status:in': debouncedFilter.statusIn && debouncedFilter.statusIn.length > 0 ? debouncedFilter.statusIn : undefined
        }),
    })

    const deletePostMutation = useMutation({
        mutationFn: (postId: number) => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
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
                        Quản lý bài viết
                    </h1>
                    <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                        Xem, chỉnh sửa và quản lý tất cả các bài viết trong hệ thống của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ListPostFilter 
                        filter={filter}
                        onChangeFilter={setFilter}
                        onClearFilter={handleClearFilter}
                    />
                    <Button.Root variant='primary' mode='filled'>
                        <Link
                            to="/admin/posts/create"
                        >
                            Thêm bài viết
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


            {selectedPostId && isUpdateOpen && (
                <UpdatePostController
                    postId={selectedPostId}
                    isOpen={isUpdateOpen}
                    onClose={() => {
                        setIsUpdateOpen(false)
                        setSelectedPostId(null)
                    }}
                />
            )}

            {selectedPostId && isPreview && (
                <PostPreviewComponent
                    postId={selectedPostId}
                    isOpen={isPreview}
                    onClose={() => {
                        setIsPreview(false)
                        setSelectedPostId(null)
                    }}
                />
            )}
        </div>
    )
}