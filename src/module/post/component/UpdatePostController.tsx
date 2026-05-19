import { useState, useEffect } from 'react'
import { EditorContent } from '@tiptap/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
    Save,
    X,
    Loader2
} from 'lucide-react'
import { PostService } from '../service/post-service'
import { type UpdatePostRequestDto, PostStatus } from '../dto'
import { MenuBar } from '#/lib/tiptap/menu-bar'
import { getFullHTML, useTiptapEditor } from '#/lib/tiptap/hooks/use-tiptap-editor'
import type { AttachDto } from '#/module/attachs/dto'
import { useToast } from '#/lib/toast/use-toast'
import * as Select from '@/components/ui/select'
import * as Input from '#/components/ui/input'
import { useSlug } from '#/hooks/use-slug'

const postService = new PostService()

interface UpdatePostControllerProps {
    postId: number
    isOpen: boolean
    onClose: () => void
}

export function UpdatePostController({ postId, isOpen, onClose }: UpdatePostControllerProps) {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useToast()
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState<keyof typeof PostStatus>(PostStatus.DRAFT.value as keyof typeof PostStatus)
    const [attachs, setAttachs] = useState<AttachDto[]>([])

    const editor = useTiptapEditor({
        className: 'min-h-[300px] px-6 py-4 text-text-strong-950 dark:text-static-white leading-relaxed',
    })

    console.log('status', status)

    const { data: post, isLoading: isFetching } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => postService.getPost(postId),
        enabled: isOpen && !!postId,
    })

    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setStatus(post.status)
            if (editor && post.description) {
                editor.commands.setContent(post.description)
            }
        }
    }, [post, editor])

    const updateMutation = useMutation({
        mutationFn: (data: UpdatePostRequestDto) => postService.updatePost(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['post', postId] })
            onClose()
            toastSuccess('Cập nhật bài viết thành công')
        },
        onError: () => {
            toastError('Cập nhật bài viết thất bại')
        }
    })

    const handleSubmit = () => {
        if (!title.trim() || !editor) return

        updateMutation.mutate({
            title: title.trim(),
            description: getFullHTML(editor),
            status,
            attachIds: attachs.map(attach => attach.id),
            slug: useSlug('vi').generateSlug(title.trim()),
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-bg-white-0/40 backdrop-blur-sm transition-opacity dark:bg-static-black/40" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-modal transition-all dark:border-stroke-sub-300 dark:bg-bg-weak-50 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4 dark:border-stroke-sub-300">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                Chỉnh sửa bài viết
                            </h2>
                            <p className="text-paragraph-xs text-text-sub-600 dark:text-text-soft-400">
                                Cập nhật thông tin và nội dung bài viết
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="group flex h-10 w-10 items-center justify-center rounded-14 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                    >
                        <X size={20} className="transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isFetching ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-base" />
                            <p className="text-label-sm text-text-sub-600 dark:text-text-soft-400">Đang tải bài viết...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                            {/* Main Content */}
                            <div className="space-y-6">
                                {/* Title Input */}
                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-5 py-3 dark:border-stroke-sub-300 dark:bg-bg-surface-800 overflow-hidden">
                                        <label className="text-label-2xs font-bold uppercase tracking-widest text-text-soft-400">
                                            Tiêu đề bài viết
                                        </label>
                                    </div>
                                    <div className="p-4">
                                        <Input.Root size='medium'>
                                            <Input.Wrapper>
                                                <Input.Input
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder='Add a catchy title...'
                                                />
                                            </Input.Wrapper>
                                        </Input.Root>
                                    </div>
                                </div>

                                {/* Editor */}
                                <div className="overflow-hidden rounded-16 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <MenuBar editor={editor} setAttachRequest={setAttachs} />
                                    <div className="bg-bg-white-0 transition-colors dark:bg-bg-weak-50">
                                        <EditorContent editor={editor} className="max-h-[400px] overflow-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <h3 className="mb-4 text-label-xs font-bold text-text-strong-950 dark:text-static-white uppercase tracking-wider">
                                        Cài đặt
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-label-2xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                                Trạng thái
                                            </label>
                                            <div className="relative">
                                                <Select.Root onValueChange={(value) => setStatus(value as keyof typeof PostStatus)}>
                                                    <Select.Trigger>
                                                        <Select.Value placeholder='Trạng thái' />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        {Object.values(PostStatus).map((item, index) => (
                                                        <Select.Item key={index} value={item.value}>
                                                            {item.label}
                                                        </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Root>
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-soft-400">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-14 bg-primary-lighter p-3 dark:bg-primary-alpha-10">
                                            <p className="text-[11px] font-medium leading-relaxed text-primary-base">
                                                {status === PostStatus.ACTIVE.value ? 'Bài viết công khai sẽ hiển thị với mọi người' : 'Bài viết nháp sẽ không hiển thị với mọi người'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <h3 className="mb-3 text-label-2xs font-bold text-text-strong-950 dark:text-static-white uppercase tracking-wider">
                                        Thông tin bài viết
                                    </h3>
                                    <div className="space-y-2 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-text-soft-400">Post ID</span>
                                            <span className="font-semibold text-text-strong-950 dark:text-static-white">#{postId}</span>
                                        </div>
                                        {post && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-text-soft-400">Ngày tạo</span>
                                                    <span className="font-semibold text-text-strong-950 dark:text-static-white">
                                                        {new Date(post.createAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-soft-400">Cập nhật lần cuối</span>
                                                    <span className="font-semibold text-text-strong-950 dark:text-static-white">
                                                        {new Date(post.updateAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                    <button
                        onClick={onClose}
                        className="rounded-14 border border-stroke-soft-200 bg-bg-white-0 px-5 py-2.5 text-label-sm font-semibold text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || isFetching}
                        className="flex items-center gap-2 rounded-14 bg-primary-base px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-primary transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    )
}
