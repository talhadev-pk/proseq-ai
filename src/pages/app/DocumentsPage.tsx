import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpDown,
  Copy,
  Download,
  FilePlus2,
  FileText,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import type { DocumentCategory, StoredDocument } from '@/types'
import { useDocumentsStore } from '@/store/documents'
import { useActivityStore } from '@/store/activity'
import { toast } from '@/store/notifications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { exportDocumentAsMarkdown, exportDocumentAsTxt } from '@/services/export'
import { cn, formatDate, timeAgo } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks'

const CATEGORIES: Array<{ id: DocumentCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All categories' },
  { id: 'business', label: 'Business' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'education', label: 'Education' },
  { id: 'communication', label: 'Communication' },
  { id: 'creative', label: 'Creative' },
  { id: 'social', label: 'Social' },
  { id: 'blogging', label: 'Blogging' },
  { id: 'notes', label: 'Notes' },
]

type SortKey = 'recent' | 'created' | 'title' | 'words'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const documents = useDocumentsStore((s) => s.documents)
  const createDocument = useDocumentsStore((s) => s.createDocument)
  const renameDocument = useDocumentsStore((s) => s.renameDocument)
  const deleteDocument = useDocumentsStore((s) => s.deleteDocument)
  const duplicateDocument = useDocumentsStore((s) => s.duplicateDocument)
  const toggleFavorite = useDocumentsStore((s) => s.toggleFavorite)
  const logActivity = useActivityStore((s) => s.log)

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 180)
  const [category, setCategory] = useState<DocumentCategory | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const [renaming, setRenaming] = useState<StoredDocument | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<StoredDocument | null>(null)

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    let list = documents.filter((d) => {
      if (category !== 'all' && d.category !== category) return false
      if (favoritesOnly && !d.favorite) return false
      if (q && !`${d.title} ${d.content}`.toLowerCase().includes(q)) return false
      return true
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'created':
          return b.createdAt.localeCompare(a.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'words':
          return b.wordCount - a.wordCount
        default:
          return b.updatedAt.localeCompare(a.updatedAt)
      }
    })
    return list
  }, [documents, debouncedQuery, category, favoritesOnly, sort])

  const totalWords = documents.reduce((s, d) => s + d.wordCount, 0)

  const newDoc = () => {
    const doc = createDocument()
    if (doc) {
      toast.success('Document created', 'A blank page is ready for you.')
      navigate(`/app/writer?doc=${doc.id}`)
    }
  }

  const confirmDelete = () => {
    if (!deleting) return
    const ok = deleteDocument(deleting.id)
    if (ok) toast.success('Document deleted', `“${deleting.title}” was removed.`)
    else toast.error('Could not delete', 'Please try again.')
    setDeleting(null)
  }

  const submitRename = () => {
    if (!renaming) return
    if (renameDocument(renaming.id, renameValue)) {
      toast.success('Renamed', `Now called “${renameValue.trim()}”`)
      setRenaming(null)
    } else {
      toast.error('Rename failed', 'The title cannot be empty.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1.5 text-sm text-muted">
            {documents.length === 0
              ? 'Your library is empty.'
              : `${documents.length} document${documents.length > 1 ? 's' : ''} · ${totalWords.toLocaleString()} words · stored in your browser`}
          </p>
        </div>
        <Button icon={<FilePlus2 className="size-4" />} onClick={newDoc}>
          New document
        </Button>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and content…"
            aria-label="Search documents"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory | 'all')}
            aria-label="Filter by category"
            className="w-auto"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort documents"
            className="w-auto"
          >
            <option value="recent">Last edited</option>
            <option value="created">Date created</option>
            <option value="title">Title A–Z</option>
            <option value="words">Word count</option>
          </Select>
          <button
            type="button"
            onClick={() => setFavoritesOnly((f) => !f)}
            aria-pressed={favoritesOnly}
            className={cn(
              'flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors',
              favoritesOnly
                ? 'border-amber/40 bg-amber-soft text-amber'
                : 'border-line bg-paper text-muted hover:text-ink',
            )}
          >
            <Star className={cn('size-4', favoritesOnly && 'fill-amber')} aria-hidden />
            Favorites
          </button>
          <div className="flex overflow-hidden rounded-xl border border-line" role="group" aria-label="View">
            {([
              ['grid', LayoutGrid, 'Grid view'],
              ['list', List, 'List view'],
            ] as const).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-label={label}
                aria-pressed={view === id}
                className={cn(
                  'p-2.5 transition-colors',
                  view === id ? 'bg-sand text-ink' : 'bg-paper text-muted hover:text-ink',
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {documents.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<FileText className="size-6" />}
            title="No documents yet"
            description="Create your first document, or start from one of the 28 templates — everything you write is saved locally."
            action={
              <div className="flex flex-wrap justify-center gap-2.5">
                <Button onClick={newDoc}>New document</Button>
                <Button variant="outline" onClick={() => navigate('/app/templates')}>
                  Use a template
                </Button>
              </div>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Search className="size-6" />}
            title="No matches"
            description="Nothing in your library matches that search or filter. Try clearing them."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                  setFavoritesOnly(false)
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'mt-6 overflow-hidden rounded-2xl border border-line bg-paper shadow-soft'
          }
        >
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.035, 0.25) }}
            >
              {view === 'grid' ? (
                <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-paper p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/writer?doc=${d.id}`)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-sand/50 text-violet"
                      aria-label={`Open ${d.title}`}
                    >
                      <FileText className="size-5" aria-hidden />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(d.id)}
                        aria-label={d.favorite ? `Unfavorite ${d.title}` : `Favorite ${d.title}`}
                        aria-pressed={d.favorite}
                        className="rounded-lg p-1.5 text-faint transition-colors hover:bg-sand hover:text-amber"
                      >
                        <Star className={cn('size-4', d.favorite && 'fill-amber text-amber')} aria-hidden />
                      </button>
                      <DocMenu
                        doc={d}
                        onRename={() => {
                          setRenaming(d)
                          setRenameValue(d.title)
                        }}
                        onDelete={() => setDeleting(d)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/writer?doc=${d.id}`)}
                    className="mt-3.5 text-left"
                  >
                    <h2 className="line-clamp-1 font-display text-lg font-semibold group-hover:text-violet">
                      {d.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-muted">
                      {d.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Empty document'}
                    </p>
                  </button>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] text-faint">
                    <Badge tone="neutral" className="capitalize">{d.category}</Badge>
                    <span>
                      {d.wordCount} words · {timeAgo(d.updatedAt)}
                    </span>
                  </div>
                </article>
              ) : (
                <div className="flex items-center gap-3.5 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-sand/50">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(d.id)}
                    aria-label={d.favorite ? `Unfavorite ${d.title}` : `Favorite ${d.title}`}
                    aria-pressed={d.favorite}
                    className="rounded-lg p-1.5 text-faint transition-colors hover:text-amber"
                  >
                    <Star className={cn('size-4', d.favorite && 'fill-amber text-amber')} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/writer?doc=${d.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-medium">{d.title}</span>
                    <span className="text-[11px] text-faint">
                      {d.category} · {d.wordCount} words · edited {formatDate(d.updatedAt)}
                    </span>
                  </button>
                  <DocMenu
                    doc={d}
                    onRename={() => {
                      setRenaming(d)
                      setRenameValue(d.title)
                    }}
                    onDelete={() => setDeleting(d)}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Rename modal */}
      <Modal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename document"
        size="sm"
        labelId="rename-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={submitRename}>Save name</Button>
          </>
        }
      >
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitRename()}
          aria-label="New document name"
          autoFocus
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete this document?"
        body={
          <>
            “<strong className="text-ink">{deleting?.title}</strong>” and its version history will be
            permanently removed from your browser. This cannot be undone.
          </>
        }
        confirmLabel="Delete document"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )

  function DocMenu({
    doc,
    onRename,
    onDelete,
  }: {
    doc: StoredDocument
    onRename: () => void
    onDelete: () => void
  }) {
    const dup = () => {
      const copy = duplicateDocument(doc.id)
      if (copy) toast.success('Duplicated', `Created “${copy.title}”`)
      else toast.error('Could not duplicate', 'Please try again.')
    }
    return (
      <Dropdown
        label={`Actions for ${doc.title}`}
        trigger={({ toggle, open }) => (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Actions for ${doc.title}`}
            aria-expanded={open}
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-sand hover:text-ink"
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </button>
        )}
      >
        {(close) => (
          <div>
            <DropdownItem
              icon={<Pencil className="size-4" />}
              onClick={() => {
                close()
                onRename()
              }}
            >
              Rename
            </DropdownItem>
            <DropdownItem
              icon={<Copy className="size-4" />}
              onClick={() => {
                close()
                dup()
              }}
            >
              Duplicate
            </DropdownItem>
            <DropdownItem
              icon={<ArrowUpDown className="size-4" />}
              onClick={() => {
                close()
                navigate(`/app/writer?doc=${doc.id}`)
              }}
            >
              Open in editor
            </DropdownItem>
            <div className="my-1 h-px bg-line" />
            <DropdownItem
              icon={<Download className="size-4" />}
              onClick={() => {
                close()
                exportDocumentAsTxt(doc)
                logActivity('export-completed', `Exported “${doc.title}” as .txt`)
                toast.success('Exported', 'Your .txt file has downloaded.')
              }}
            >
              Export .txt
            </DropdownItem>
            <DropdownItem
              icon={<Download className="size-4" />}
              onClick={() => {
                close()
                exportDocumentAsMarkdown(doc)
                logActivity('export-completed', `Exported “${doc.title}” as .md`)
                toast.success('Exported', 'Your .md file has downloaded.')
              }}
            >
              Export .md
            </DropdownItem>
            <div className="my-1 h-px bg-line" />
            <DropdownItem
              icon={<Trash2 className="size-4" />}
              destructive
              onClick={() => {
                close()
                onDelete()
              }}
            >
              Delete
            </DropdownItem>
          </div>
        )}
      </Dropdown>
    )
  }
}
