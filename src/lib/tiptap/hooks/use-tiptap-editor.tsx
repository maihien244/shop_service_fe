import { Editor, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import ImageResize from 'tiptap-extension-resize-image';
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import TextAlign from "@tiptap/extension-text-align"
import { cn } from "#/utils/cn"

export const TIPTAP_WRAPPER_CLASS = 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-text-strong-950 dark:text-static-white'

export const useTiptapEditor = ({ className, content = '' }: { className?: string, content?: string } = {}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4]
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            ImageResize,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        editorProps: {
            attributes: {
                class: cn(
                    TIPTAP_WRAPPER_CLASS,
                    className
                ),
            },
        },
    })

    return editor
}

export const getFullHTML = (editor: Editor) => {
    if (!editor) return ''

    const attrs = editor.options.editorProps.attributes as Record<string, string>
    const classStr = attrs?.class || ''

    return `<div class="${classStr}">${editor.getHTML()}</div>`
}

