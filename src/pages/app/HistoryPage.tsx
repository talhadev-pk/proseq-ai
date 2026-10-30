import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock3, Eye, FileText, History as HistoryIcon, RotateCcw } from 'lucide-react'
import type { StoredDocument, VersionSnapshot } from '@/types'
import { useDocumentsStore } from '@/store/documents'
import { useHistoryStore } from '@/store/history'
import { useActivityStore } from '@/store/activity'
import { toast } from '@/store/notifications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, formatDateTime, timeAgo } from '@/lib/utils'

const REASON_LABEL: Record<VersionSnapshot['reason'], string> = {
  save: 'Manual save',
  major: 'Significant change',
  restore: 'Restore point',
  template: 'Created from template',
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const documents = useDocumentsStore((s) => s.documents)
  const updateDocument = useDocumentsStore((s) => s.updateDocument)
  const listFor = useHistoryStore((s) => s.listFor)
  const snapshot = useHistoryStore((s) => s.snapshot)
  const logActivity = useActivityStore((s) => s.log)

  const sorted = useMemo(
    () => [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [documents],
  )
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null)
  const selected = documents.find((d) => d.id === (selectedId ?? undefined)) ?? sorted[0] ?? null

  const versions = useMemo(
    () => (selected ? listFor(selected.id) : []),
    [selected, listFor],
  )

  const [previewing, setPreviewing] = useState<VersionSnapshot | null>(null)
  const [restoring, setRestoring] = useState<VersionSnapshot | null>(null)

  const doRestore = async () => {
    if (!restoring || !selected) return
    // Snapshot the CURRENT state first so the restore itself is reversible.
    await snapshot({ ...selected }, 'restore')
    const ok = updateDocument(selected.id, {
      content: restoring.content,
      wordCount: restoring.wordCount,
    })
    if (ok) {
      logActivity('version-restored', `Restored a version of “${restoring.title}”`)
      toast.success('Version restored', `“${selected.title}” now shows the version from ${formatDateTime(restoring.createdAt)}.`)
    } else {
      toast.error('Restore failed', 'Please try again.')
    }
    setRestoring(null)
    setPreviewing(null)
  }

  if (documents.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={<HistoryIcon className="size-6" />}
          title="No history yet"
          description="Version snapshots appear here as you write and save. Snapshots are taken on meaningful changes — never on every keystroke."
          action={<Button onClick={() => navigate('/app/writer')}>Open the editor</Button>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Version history</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">
          Snapshots are captured on manual saves and significant changes (word-count jumps or 10+
          minute gaps), capped at 20 per document.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Document picker */}
        <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-faint">Documents</h2>
          </div>
          <ul className="max-h-[520px] overflow-y-auto p-2">
            {sorted.map((d: StoredDocument) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  aria-pressed={selected?.id === d.id}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    selected?.id === d.id ? 'bg-sand' : 'hover:bg-sand/60',
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-muted">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{d.title}</span>
                    <span className="text-[11px] text-faint">{listFor(d.id).length} versions</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          {versions.length === 0 ? (
            <EmptyState
              icon={<Clock3 className="size-6" />}
              title="No versions recorded"
              description="Open this document in the editor and save it once — a snapshot will appear here immediately."
              action={
                selected ? (
                  <Button variant="outline" onClick={() => navigate(`/app/writer?doc=${selected.id}`)}>
                    Open in editor
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[1.4rem] before:top-2 before:w-px before:bg-line">
              {versions.map((v, i) => (
                <motion.li
                  key={v.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                  className="relative pl-12"
                >
                  <span
                    className="absolute left-[0.85rem] top-4 size-3.5 rounded-full border-[3px] border-paper bg-violet shadow-soft"
                    aria-hidden
                  />
                  <div className="rounded-2xl border border-line bg-paper p-4 shadow-soft transition-shadow hover:shadow-lifted">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">{formatDateTime(v.createdAt)}</p>
                        <p className="mt-0.5 text-[11px] text-faint">
                          {timeAgo(v.createdAt)} · {v.wordCount} words
                        </p>
                      </div>
                      <Badge tone={v.reason === 'restore' ? 'amber' : 'neutral'}>
                        {REASON_LABEL[v.reason]}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />} onClick={() => setPreviewing(v)}>
                        Preview
                      </Button>
                      <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => setRestoring(v)}>
                        Restore
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Version preview */}
      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title="Version preview"
        description={previewing ? `${formatDateTime(previewing.createdAt)} · ${previewing.wordCount} words` : undefined}
        size="lg"
        labelId="version-preview-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreviewing(null)}>
              Close
            </Button>
            {previewing ? (
              <Button icon={<RotateCcw className="size-4" />} onClick={() => setRestoring(previewing)}>
                Restore this version
              </Button>
            ) : null}
          </>
        }
      >
        {previewing ? (
          <div
            className="prose-editor max-h-[55vh] overflow-y-auto rounded-xl border border-line bg-sand/40 px-5 py-4 text-sm"
            dangerouslySetInnerHTML={{ __html: previewing.content || '<p>(empty document)</p>' }}
          />
        ) : null}
      </Modal>

      {/* Restore confirm */}
      <ConfirmDialog
        open={!!restoring}
        title="Restore this version?"
        body={
          <>
            The document will be rolled back to{' '}
            <strong className="text-ink">{restoring ? formatDateTime(restoring.createdAt) : ''}</strong>.
            A snapshot of the current state is saved first, so the restore is itself reversible.
          </>
        }
        confirmLabel="Restore version"
        onConfirm={() => void doRestore()}
        onCancel={() => setRestoring(null)}
      />
    </div>
  )
}
