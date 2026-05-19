import { X, Calendar, Clock, Activity, FileText } from 'lucide-react'
import { type PostDto, PostStatus } from '../dto'
import { useEffect, useState } from 'react'
import { PostService } from '../service/post-service'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '#/lib/toast/use-toast'
import type { ErrorMessage } from '#/lib/http.client'
import { LoadingComponent } from '#/components/ui/loading'
import { TIPTAP_WRAPPER_CLASS } from '#/lib/tiptap/hooks/use-tiptap-editor'

interface PostPreviewComponentProps {
    postId: number
    isOpen: boolean
    onClose: () => void
    modalTitle?: string
}

export function PostPreviewComponent({ 
    postId, 
    isOpen, 
    onClose,
    modalTitle = "Xem trước bài viết"
}: PostPreviewComponentProps) {
    const [postService] = useState(() => new PostService())
    const [post, setPost] = useState<PostDto | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    if (!isOpen || !postId) return null

    const { toastError} = useToast()
    const postMutation = useMutation({
        mutationFn: () => postService.getPost(postId),
        onSuccess: (data: PostDto) => {
            setPost(data)
            setIsLoading(false)
        }, onError: (error: ErrorMessage) => {
            setIsLoading(false)
            if (error.status === 404) {
                toastError('Bài viết không tồn tại!')
            } else {
                toastError('Có lỗi xảy ra trong hệ thống!') 
            }
            onClose()
        }
    })

    useEffect(() => {
        setIsLoading(true)
        postMutation.mutate()
    }, [postId])

    // Determine status details
    const statusKey = post?.status as keyof typeof PostStatus
    const statusLabel = statusKey ? PostStatus[statusKey]?.label : 'Không xác định'
    
    // Status color mapping
    const getStatusColor = (status?: string) => {
        switch (status) {
            case PostStatus.ACTIVE.value: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case PostStatus.DRAFT.value: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            case PostStatus.DELETED.value: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-bg-weak-100 text-text-sub-600 dark:bg-bg-surface-800 dark:text-text-soft-400'
        }
    }

    return (
        (isLoading ? <LoadingComponent /> :
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-bg-white-0/40 backdrop-blur-sm transition-opacity dark:bg-static-black/40" 
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-modal transition-all dark:border-stroke-sub-300 dark:bg-bg-weak-50 flex flex-col">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4 dark:border-stroke-sub-300 bg-bg-weak-25 dark:bg-bg-surface-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                {modalTitle}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="group flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <X size={20} className="transition-transform group-hover:rotate-90" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-bg-weak-50 dark:bg-bg-weak-50/50 custom-scrollbar">
                        <div className="mx-auto max-w-3xl space-y-6">
                            
                            {/* Meta Info Cards */}
                            <div className="flex flex-wrap gap-4">
                                {post?.id && (
                                    <div className="flex-1 min-w-[140px] rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                        <div className="mb-1 flex items-center gap-2 text-text-soft-400">
                                            <Activity size={14} />
                                            <span className="text-label-2xs font-medium uppercase">ID Bài viết</span>
                                        </div>
                                        <p className="text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                            #{post?.id}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex-1 min-w-[140px] rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <div className="mb-1 flex items-center gap-2 text-text-soft-400">
                                        <Activity size={14} />
                                        <span className="text-label-2xs font-medium uppercase">Trạng thái</span>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-2xs font-semibold ${getStatusColor(post?.status)}`}>
                                        {statusLabel}
                                    </span>
                                </div>

                                {post?.createAt && (
                                    <div className="flex-1 min-w-[140px] rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                        <div className="mb-1 flex items-center gap-2 text-text-soft-400">
                                            <Calendar size={14} />
                                            <span className="text-label-2xs font-medium uppercase">Ngày tạo</span>
                                        </div>
                                        <p className="text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                            {new Date(post?.createAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                )}

                                {post?.updateAt && (
                                    <div className="flex-1 min-w-[140px] rounded-16 border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                        <div className="mb-1 flex items-center gap-2 text-text-soft-400">
                                            <Clock size={14} />
                                            <span className="text-label-2xs font-medium uppercase">Cập nhật</span>
                                        </div>
                                        <p className="text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                            {new Date(post?.updateAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Main Content Area */}
                            <div className="overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-sm dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                {/* Title */}
                                <div className="border-b border-stroke-soft-200 p-6 dark:border-stroke-sub-300 bg-bg-weak-25 dark:bg-bg-surface-800">
                                    <h1 className="text-title-h5 font-bold leading-tight text-text-strong-950 dark:text-static-white">
                                        {post?.title || <span className="italic text-text-soft-400">Chưa có tiêu đề</span>}
                                    </h1>
                                </div>
                                
                                {/* Description/Content */}
                                <div className="min-h-[300px]">
                                    {post?.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: post?.description }} />
                                    ) : (
                                        <p className="italic text-text-soft-400 text-center py-10">Chưa có nội dung bài viết...</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end border-t border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                        <button
                            onClick={onClose}
                            className="rounded-14 bg-static-black px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-primary-base dark:hover:bg-blue-600 dark:shadow-fancy-buttons-primary"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}
