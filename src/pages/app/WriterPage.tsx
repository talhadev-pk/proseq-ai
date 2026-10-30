import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Editor } from '@tiptap/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Mic,
  PanelRightOpen,
  Save,
  Sparkles,
} from 'lucide-react'
import type { AIResult } from '@/types'
import { useDocumentsStore } from '@/store/documents'
import { useHistoryStore } from '@/store/history'
import { useBrandVoiceStore } from '@/store/brandVoice'
import { usePreferencesStore } from '@/store/preferences'
import { useActivityStore } from '@/store/activity'
import { toast } from '@/store/notifications'
import { WritingEditor, type EditorHandle } from '@/features/writer/Editor'
import { ToolsPanel } from '@/features/writer/ToolsPanel'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  copyToClipboard,
  downloadFile,
  exportDocumentAsMarkdown,
  exportDocumentAsTxt,
} from '@/services/export'
import { htmlToPlainText } from '@/lib/utils'
import { htmlToMarkdown } from '@/lib/markdown'

type SaveState = 'idle' | 'saving' | 'saved'

function paragraphsToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('')
}

export default function WriterPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const documents = useDocumentsStore((s) => s.documents)
  const updateDocument = useDocumentsStore((s) => s.updateDocument)
  const createDocument = useDocumentsStore((s) => s.createDocument)
  const maybeSnapshot = useHistoryStore((s) => s.maybeSnapshot)
  const snapshot = useHistoryStore((s) => s.snapshot)
  const voices = useBrandVoiceStore((s) => s.voices)
  const setActiveVoice = useBrandVoiceStore((s) => s.setActive)
  const autosaveOn = usePreferencesStore((s) => s.editor.autosave)
  const logActivity = useActivityStore((s) => s.log)

  const docId = params.get('doc')
  const doc = useMemo(() => documents.find((d) => d.id === docId) ?? null, [documents, docId])

  const editorRef = useRef<EditorHandle>({ editor: null })
  const [title, setTitle] = useState(doc?.title ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [stats, setStats] = useState({ words: doc?.wordCount ?? 0, chars: 0 })
  const [selectionText, setSelectionText] = useState('')
  const [toolsOpen, setToolsOpen] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(doc?.title ?? '')
    setStats({ words: doc?.wordCount ?? 0, chars: htmlToPlainText(doc?.content ?? '').length })
    setSaveState('idle')
  }, [doc?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track the active selection for the tools panel.
  useEffect(() => {
    const editor: Editor | null = editorRef.current.editor
    if (!editor) return
    const onSelect = () => {
      const { from, to } = editor.state.selection
      if (from !== to) {
        setSelectionText(editor.state.doc.textBetween(from, to, '\n'))
      } else {
        setSelectionText('')
      }
    }
    editor.on('selectionUpdate', onSelect)
    return () => {
      editor.off('selectionUpdate', onSelect)
    }
  }, [doc?.id]) // re-bind when the editor remounts for a new document

  const persist = useCallback(
    (content: string, reason: 'autosave' | 'manual') => {
      if (!doc) return
      const words = (() => {
        try {
          return editorRef.current.editor?.storage.characterCount.words() ?? doc.wordCount
        } catch {
          return doc.wordCount
        }
      })()
      const updated = { ...doc, content, wordCount: words }
      const ok = updateDocument(doc.id, { content, wordCount: words })
      if (!ok) {
        toast.error('Could not save', 'Your changes could not be persisted.')
        return
      }
      setSaveState('saved')
      if (reason === 'manual') {
        void snapshot(updated, 'save')
        logActivity('document-saved', `Saved “${updated.title}”`)
        toast.success('Document saved', `“${updated.title}” · ${words} words`)
      } else {
        void maybeSnapshot(updated, 'major')
      }
    },
    [doc, updateDocument, snapshot, maybeSnapshot, logActivity],
  )

  const onEditorUpdate = useCallback(
    (html: string, _plain: string, words: number, chars: number) => {
      setStats({ words, chars })
      if (!doc || !autosaveOn) {
        setSaveState('idle')
        return
      }
      setSaveState('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => persist(html, 'autosave'), 1400)
    },
    [doc, autosaveOn, persist],
  )

  const saveNow = () => {
    if (!doc) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    const html = editorRef.current.editor?.getHTML() ?? doc.content
    persist(html, 'manual')
  }

  const commitTitle = () => {
    if (!doc) return
    const t = title.trim() || 'Untitled document'
    if (t !== doc.title) {
      updateDocument(doc.id, { title: t })
      toast.success('Title updated', undefined)
    }
  }

  const applyResult = (result: AIResult) => {
    const editor = editorRef.current.editor
    if (!editor || !doc) return
    const { from, to } = editor.state.selection
    const hasSelection = from !== to

    if (result.kind === 'generate') {
      editor.chain().focus().insertContent(result.output).run()
      toast.success('Inserted (simulated)', 'Generated content placed at your cursor.')
    } else if (hasSelection) {
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, paragraphsToHtml(result.output))
        .run()
      toast.success('Applied to selection', 'The original text was replaced with the preview you approved.')
    } else {
      editor.commands.setContent(paragraphsToHtml(result.output))
      toast.success('Applied to document', 'Formatting was simplified — check the result.')
    }
    logActivity('document-saved', `Applied a simulated ${result.kind === 'generate' ? 'generation' : 'transformation'}`)
    // Save immediately after applying so the change persists.
    setTimeout(() => {
      const html = editorRef.current.editor?.getHTML()
      if (html) persist(html, 'autosave')
    }, 120)
  }

  const activeVoice = voices.find((v) => v.active) ?? null

  /* --- Empty states -------------------------------------------------------- */

  if (!doc && documents.length > 0) {
    // docId invalid — show picker of recent docs
    const recent = [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={<FileText className="size-6" />}
          title="Pick up where you left off"
          description="Choose a document to continue writing, or start something new."
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button
                onClick={() => {
                  const d = createDocument()
                  if (d) setParams({ doc: d.id })
                }}
              >
                New document
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/documents')}>
                Browse library
              </Button>
            </div>
          }
        />
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-paper shadow-soft">
          {recent.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setParams({ doc: d.id })}
                className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-sand/60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{d.title}</span>
                  <span className="text-xs text-faint">{d.wordCount} words</span>
                </span>
                <ChevronDown className="size-4 -rotate-90 text-faint" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="Start writing"
          description="Create a blank document, or begin from one of the 28 structured templates."
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button
                icon={<FileText className="size-4" />}
                onClick={() => {
                  const d = createDocument()
                  if (d) setParams({ doc: d.id })
                }}
              >
                New blank document
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/templates')}>
                Use a template
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  /* --- Editor view ---------------------------------------------------------- */

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 xl:flex-row">
      {/* Editor column */}
      <section className="min-w-0 flex-1" aria-label="Document editor">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate('/app/documents')}
          >
            Library
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Brand voice */}
            <Dropdown
              label="Brand voice"
              width="w-64"
              trigger={({ toggle, open }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  aria-label="Select brand voice"
                  className="flex h-9 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-xs font-medium text-muted shadow-soft transition-colors hover:text-ink"
                >
                  <Mic className="size-3.5 text-violet" aria-hidden />
                  <span className="max-w-32 truncate">{activeVoice ? activeVoice.name : 'No voice'}</span>
                  <ChevronDown className="size-3.5" aria-hidden />
                </button>
              )}
            >
              {(close) => (
                <div>
                  {voices.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-faint">
                      No brand voices yet.
                      <button
                        type="button"
                        className="mt-2 block w-full rounded-lg bg-violet-soft px-3 py-2 font-medium text-violet-deep hover:bg-violet/15"
                        onClick={() => {
                          close()
                          navigate('/app/brand-voice')
                        }}
                      >
                        Create one
                      </button>
                    </div>
                  ) : (
                    voices.map((v) => (
                      <DropdownItem
                        key={v.id}
                        icon={v.active ? <Check className="size-4 text-moss" /> : <Mic className="size-4" />}
                        onClick={() => {
                          setActiveVoice(v.id)
                          close()
                          toast.info(`Brand voice set to “${v.name}”`, 'Improvements will respect this voice.')
                        }}
                      >
                        <span className="block truncate">{v.name}</span>
                        <span className="block text-[10px] capitalize text-faint">{v.tone}</span>
                      </DropdownItem>
                    ))
                  )}
                </div>
              )}
            </Dropdown>

            {/* Save */}
            <Button
              size="sm"
              variant="outline"
              icon={<Save className="size-4" />}
              onClick={saveNow}
            >
              Save
            </Button>

            {/* Export */}
            <Dropdown
              label="Export document"
              trigger={({ toggle, open }) => (
                <Button
                  size="sm"
                  variant="outline"
                  aria-expanded={open}
                  aria-label="Export document"
                  onClick={toggle}
                  icon={<Download className="size-4" />}
                />
              )}
            >
              {(close) => (
                <div>
                  <DropdownItem
                    onClick={() => {
                      exportDocumentAsTxt(doc)
                      logActivity('export-completed', `Exported “${doc.title}” as .txt`)
                      toast.success('Exported', 'Your .txt file has downloaded.')
                      close()
                    }}
                  >
                    Download .txt
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      exportDocumentAsMarkdown(doc)
                      logActivity('export-completed', `Exported “${doc.title}” as .md`)
                      toast.success('Exported', 'Your .md file has downloaded.')
                      close()
                    }}
                  >
                    Download .md
                  </DropdownItem>
                  <DropdownItem
                    onClick={async () => {
                      const ok = await copyToClipboard(
                        `${doc.title}\n\n${htmlToMarkdown(doc.content)}`,
                      )
                      if (ok) toast.success('Copied', 'Markdown is on your clipboard.')
                      else toast.error('Copy failed', 'Your browser blocked clipboard access.')
                      close()
                    }}
                  >
                    Copy as Markdown
                  </DropdownItem>
                  <DropdownItem
                    onClick={async () => {
                      const ok = await copyToClipboard(htmlToPlainText(doc.content))
                      if (ok) toast.success('Copied', 'Plain text is on your clipboard.')
                      else toast.error('Copy failed', 'Your browser blocked clipboard access.')
                      close()
                    }}
                  >
                    Copy as plain text
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      downloadFile(
                        `${doc.title.replace(/[^\w\s.-]/g, '').trim() || 'document'}.html`,
                        `<!doctype html><meta charset="utf-8"><title>${doc.title}</title><body>${doc.content}</body>`,
                        'text/html',
                      )
                      toast.success('Exported', 'Your .html file has downloaded.')
                      close()
                    }}
                  >
                    Download .html
                  </DropdownItem>
                </div>
              )}
            </Dropdown>

            <button
              type="button"
              onClick={() => setToolsOpen((o) => !o)}
              aria-label={toolsOpen ? 'Hide tools panel' : 'Show tools panel'}
              aria-pressed={toolsOpen}
              className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium shadow-soft transition-colors xl:hidden ${
                toolsOpen ? 'border-violet/40 bg-violet-soft text-violet-deep' : 'border-line bg-paper text-muted'
              }`}
            >
              <PanelRightOpen className="size-3.5" aria-hidden />
              Tools
            </button>
          </div>
        </div>

        {/* Editor card */}
        <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
          <div className="px-5 pt-5 sm:px-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitTitle()
                  editorRef.current.editor?.commands.focus()
                }
              }}
              aria-label="Document title"
              placeholder="Untitled document"
              className="w-full border-none bg-transparent font-display text-2xl font-semibold tracking-tight text-ink outline-none placeholder:text-faint sm:text-3xl"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2 pb-3 text-[11px] text-faint">
              <Badge tone="neutral" className="capitalize">{doc.category}</Badge>
              <span>·</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={saveState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={
                    saveState === 'saving'
                      ? 'flex items-center gap-1 text-amber'
                      : saveState === 'saved'
                        ? 'flex items-center gap-1 text-moss'
                        : 'flex items-center gap-1'
                  }
                >
                  {saveState === 'saving' ? (
                    <>
                      <span className="size-1.5 animate-pulse rounded-full bg-amber" /> Saving…
                    </>
                  ) : saveState === 'saved' ? (
                    <>
                      <Check className="size-3" /> Saved
                    </>
                  ) : autosaveOn ? (
                    <>
                      <Clock3 className="size-3" /> Autosave on
                    </>
                  ) : (
                    'Autosave off'
                  )}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <WritingEditor
            key={doc.id}
            docId={doc.id}
            initialContent={doc.content}
            onUpdate={onEditorUpdate}
            editorRef={editorRef}
          />

          {/* Stats footer */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-sand/40 px-5 py-3 text-[11px] text-muted sm:px-8">
            <span className="font-medium text-ink">{stats.words.toLocaleString()} words</span>
            <span>{stats.chars.toLocaleString()} characters</span>
            <span>
              {stats.words === 0 ? '0 min' : stats.words < 200 ? '< 1 min' : `${Math.round(stats.words / 200)} min`}{' '}
              read
            </span>
            <span className="ml-auto text-faint">
              {selectionText.trim() ? `${selectionText.trim().split(/\s+/).length} words selected` : 'ProseQ AI demo'}
            </span>
          </div>
        </div>
      </section>

      {/* Tools column */}
      <AnimatePresence initial={false}>
        {toolsOpen ? (
          <motion.div
            key="tools"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full shrink-0 xl:w-[360px]"
          >
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-7.5rem)]">
              <ToolsPanel
                selectionText={selectionText}
                documentText={htmlToPlainText(doc.content)}
                documentTitle={doc.title}
                voice={activeVoice}
                onApply={applyResult}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
