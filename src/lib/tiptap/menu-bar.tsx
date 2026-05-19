import { useRef, type Dispatch, type SetStateAction } from 'react'
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Quote, 
    Undo, 
    Redo, 
    Heading1, 
    Heading2,
    Heading3,
    Heading4,
    Image as ImageIcon,
    BetweenVerticalStart,
    Trash2,
    Minus,
    Sheet,
    BetweenHorizontalStart,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from 'lucide-react'
import type { AttachDto } from '#/module/attachs/dto'
import { useUploadAttach } from '#/module/attachs/hooks/use-upload-attach'
import { useMutation } from '@tanstack/react-query'
import { useFileUrl } from '#/module/attachs/hooks/use-file'
import { FilePond } from 'react-filepond'
import { useToast } from '../toast/use-toast'


export const MenuBar = ({ editor, setAttachRequest }: { editor: any, setAttachRequest: Dispatch<SetStateAction<AttachDto[]>> }) => {
    const filePondRef = useRef<any>(null)
    const { toastSuccess, toastError } = useToast()
    const { handleUploadAttach } = useUploadAttach()
    const { getFileUrl } = useFileUrl()

    const uploadMutation = useMutation({
        mutationFn: (file: File) => handleUploadAttach(file),
        onSuccess: (data: AttachDto) => {
            setAttachRequest((prev) => [...prev, data])
            const result = getFileUrl(data.attachMetadata.keyName)
            editor.chain().focus().setImage({ src: result }).run()
            toastSuccess('Thêm ảnh thành công')
        },
        onError: () => {
            toastError('Thêm ảnh thất bại')
        }
    })

    if (!editor) {
        return null
    }

    const addImage = () => {
        filePondRef.current?.browse()
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-stroke-soft-200 bg-bg-weak-25 p-2 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
            <FilePond 
                ref={filePondRef}
                allowImageResize={true}
                imageResizeTargetWidth={400}
                imageResizeMode="contain"
                imageResizeUpscale={false}
                allowImageTransform={true}
                className="hidden"
                server={{
                    process: async (fileName, file, metadata, load, error, progress, abort) => {
                        try {
                            await uploadMutation.mutateAsync(file as File)
                            load('ok')
                        } catch (e) {
                            error('Upload failed')
                        }
                    }
                }}
            />

            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('bold') ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('italic') ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />
            
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Heading 3"
            >
                <Heading3 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('heading', { level: 4 }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-soft-400'}`}
                title="Heading 4"
            >
                <Heading4 size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />

            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-soft-400'}`}
                title="Align Left"
            >
                <AlignLeft size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-soft-400'}`}
                title="Align Center"
            >
                <AlignCenter size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-soft-400'}`}
                title="Align Right"
            >
                <AlignRight size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-soft-400'}`}
                title="Align Justify"
            >
                <AlignJustify size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />
            
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('bulletList') ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('orderedList') ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`rounded-6 p-1.5 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300 ${editor.isActive('blockquote') ? 'bg-primary-lighter text-primary-base dark:bg-primary-alpha-24' : 'text-text-sub-600'}`}
                title="Blockquote"
            >
                <Quote size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />

            <button
                onClick={addImage}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Upload Image"
            >
                <ImageIcon size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />

            <button
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Insert Table"
            >
                <Sheet size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Add Column"
            >
                <BetweenVerticalStart size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Add Row"
            >
                <BetweenHorizontalStart size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Delete Column"
            >
                <Minus size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 dark:hover:bg-bg-sub-300"
                title="Delete Row"
            >
                <Minus size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="rounded-6 p-1.5 text-error-base transition-colors hover:bg-error-lighter dark:hover:bg-error-dark"
                title="Delete Table"
            >
                <Trash2 size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-stroke-soft-200 dark:bg-stroke-sub-300" />
            
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 disabled:opacity-30 dark:hover:bg-bg-sub-300"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="rounded-6 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-soft-200 disabled:opacity-30 dark:hover:bg-bg-sub-300"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    )
}