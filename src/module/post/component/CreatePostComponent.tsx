import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { 
    Save,
    X
} from 'lucide-react'
import { PostService } from '../service/post-service'
import { type CreatePostRequestDto, PostStatus } from '../dto'
import { MenuBar } from '#/lib/tiptap/menu-bar'
import { getFullHTML, useTiptapEditor } from '#/lib/tiptap/hooks/use-tiptap-editor'
import type { AttachDto } from '#/module/attachs/dto'
import { useToast } from '#/lib/toast/use-toast'
import * as Input from '#/components/ui/input'
import * as Select from '#/components/ui/select'
import { useSlug } from '#/hooks/use-slug'

const postService = new PostService()

export function CreatePostComponent() {
    const navigate = useNavigate()
    const { toastSuccess, toastError } = useToast()
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState<keyof typeof PostStatus>(PostStatus.DRAFT.value as keyof typeof PostStatus)
    const [attachs, setAttachs] = useState<AttachDto[]>([])

    const editor = useTiptapEditor({
        className: 'min-h-[400px] px-6 py-4 text-text-strong-950 dark:text-static-white leading-relaxed',
    })

    const createMutation = useMutation({
        mutationFn: (data: CreatePostRequestDto) => postService.createPost(data),
        onSuccess: () => {
            navigate({ to: '/admin/posts' })
            handleResetState()
            toastSuccess('Tạo bài viết thành công')
        },
        onError: () => {
            toastError('Tạo bài viết thất bại')
        }
    })

    const handleSubmit = () => {
        if (!title.trim() || !editor) return

        createMutation.mutate({
            title: title.trim(),
            description: getFullHTML(editor),
            status: status as keyof typeof PostStatus,
            attachIds: attachs.map(attach => attach.id),
            slug: useSlug('vi').generateSlug(title.trim()),
        })
    }

    const handleResetState = () => {
        setTitle('')
        setStatus(PostStatus.DRAFT.value as keyof typeof PostStatus)
        setAttachs([])
        editor?.commands.clearContent()
    }

    return (
        <div className="min-h-screen bg-bg-weak-50 transition-colors duration-300 dark:bg-bg-white-0 overflow-hidden">
            {/* Sticky Header */}
            <header className="sticky h-20 top-0 z-20 border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-md dark:border-stroke-sub-300 dark:bg-bg-weak-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate({ to: '/admin/posts' })}
                            className="group flex h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <X size={20} className="transition-transform group-hover:rotate-90" />
                        </button>
                        <div>
                            <h1 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                Tạo bài viết mới
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-label-2xs font-medium uppercase tracking-wider text-text-soft-400">
                                    Chế độ soạn thảo
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className="flex items-center gap-2 rounded-10 bg-static-black px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-base dark:hover:bg-blue-600 dark:shadow-fancy-buttons-primary"
                        >
                            {createMutation.isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-static-white border-t-transparent" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4 overflow-hidden">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Primary Editor Area */}
                    <div className="space-y-8">
                        {/* Title Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex dark:bg-bg-weak-50">
                            <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                                <label className="text-label-xs font-bold uppercase tracking-widest text-text-soft-400">
                                    Tiêu đề
                                </label>
                            </div>
                            <div className="p-4">
                                <div className='w-full bg-transparent text-title-h6 font-bold text-text-strong-950 outline-none placeholder:text-text-disabled-300 dark:text-static-white'>
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
                        </div>

                        {/* Editor Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex-12 dark:bg-bg-weak-50">
                            <MenuBar editor={editor} setAttachRequest={setAttachs} />
                            <div className="bg-bg-white-0 transition-colors dark:bg-bg-weak-50 ">
                                <EditorContent editor={editor} className='max-h-[50vh] overflow-auto'/>
                            </div>
                            <div className="border-t border-stroke-soft-200 bg-bg-weak-25 px-6 py-3 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-label-2xs font-medium text-text-soft-400">
                                        Powered by Tiptap Editor
                                    </span>
                                    <span className="text-label-2xs font-medium text-text-soft-400">
                                        Auto-saving enabled
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-complex dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <h3 className="mb-6 flex items-center gap-2 text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-base" />
                                Tùy chọn bài viết
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                        Trạng thái
                                    </label>
                                    <div className="relative group">
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
                                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-soft-400">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-12 bg-primary-lighter p-4 dark:bg-primary-alpha-10">
                                    <p className="text-paragraph-xs font-medium text-primary-base">
                                        Lưu ý: Bài viết hoạt động sẽ ngay lập tức tìm kiếm bởi người dùng. Bài viết nháp vẫn ẩn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-complex dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <h3 className="mb-4 text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                Thông tin bài viết
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-label-2xs">
                                    <span className="text-text-soft-400">Người tạo</span>
                                    <span className="font-semibold text-text-strong-950 dark:text-static-white text-right">Bạn</span>
                                </div>
                                <div className="flex justify-between text-label-2xs">
                                    <span className="text-text-soft-400">Lần cuối chỉnh sửa</span>
                                    <span className="font-semibold text-text-strong-950 dark:text-static-white text-right">Vừa xong</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}