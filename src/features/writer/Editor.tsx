import { useCallback, useEffect, useMemo } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
} from 'lucide-react'
import { usePreferencesStore } from '@/store/preferences'
import { cn } from '@/lib/utils'

const WIDTHS: Record<string, string> = {
  narrow: 'max-w-[640px]',
  comfortable: 'max-w-[740px]',
  wide: 'max-w-[900px]',
}

export interface EditorHandle {
  editor: Editor | null
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        'rounded-lg p-2 transition-colors disabled:opacity-40',
        active ? 'bg-violet-soft text-violet-deep' : 'text-muted hover:bg-sand hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-[42px] border-b border-line" aria-hidden />
  }
  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b border-line px-3 py-1.5"
      role="toolbar"
      aria-label="Formatting"
    >
      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <RemoveFormatting className="size-4" />
      </ToolbarButton>
    </div>
  )
}

/**
 * The writing surface. Remounts per document (keyed by docId upstream) so
 * content binding stays simple and reliable.
 */
export function WritingEditor({
  docId,
  initialContent,
  onUpdate,
  editorRef,
}: {
  docId: string
  initialContent: string
  onUpdate: (html: string, plainText: string, words: number, chars: number) => void
  editorRef: React.MutableRefObject<EditorHandle>
}) {
  const editorPrefs = usePreferencesStore((s) => s.editor)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Undo/redo is provided by the history extension inside StarterKit.
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing, or select some text and let a tool help…',
      }),
      CharacterCount,
    ],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[420px] px-6 py-6 sm:px-10 sm:py-8',
        spellcheck: editorPrefs.spellcheck ? 'true' : 'false',
        'aria-label': 'Document body',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(
        editor.getHTML(),
        editor.getText(),
        editor.storage.characterCount.words(),
        editor.storage.characterCount.characters(),
      )
    },
  })

  const setSpellcheck = useCallback(
    (on: boolean) => {
      if (!editor) return
      editor.view.dom.setAttribute('spellcheck', on ? 'true' : 'false')
    },
    [editor],
  )

  useEffect(() => {
    setSpellcheck(editorPrefs.spellcheck)
  }, [editorPrefs.spellcheck, setSpellcheck])

  useEffect(() => {
    const ref = editorRef
    ref.current.editor = editor
    return () => {
      ref.current.editor = null
    }
  }, [editor, editorRef])

  const widthClass = useMemo(() => WIDTHS[editorPrefs.width] ?? WIDTHS.comfortable, [editorPrefs.width])
  const style = useMemo(() => ({ '--editor-font-size': `${editorPrefs.fontSize}px` }) as React.CSSProperties, [editorPrefs.fontSize])

  return (
    <div>
      <EditorToolbar editor={editor} />
      <div className="flex justify-center">
        <div className={cn('w-full', widthClass)} style={style}>
          <EditorContent editor={editor} key={docId} />
        </div>
      </div>
    </div>
  )
}
