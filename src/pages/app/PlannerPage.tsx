import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Info,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { DocumentCategory, PlannerEntry, PlannerStatus } from '@/types'
import { usePlannerStore } from '@/store/planner'
import { useDocumentsStore } from '@/store/documents'
import { toast } from '@/store/notifications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FieldError, FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn, dateKey } from '@/lib/utils'

const STATUS_META: Record<PlannerStatus, { label: string; tone: 'amber' | 'blue' | 'moss'; dot: string }> = {
  draft: { label: 'Draft', tone: 'amber', dot: 'bg-amber' },
  planned: { label: 'Planned', tone: 'blue', dot: 'bg-blue' },
  published: { label: 'Published', tone: 'moss', dot: 'bg-moss' },
}

const CATEGORIES: DocumentCategory[] = ['business', 'marketing', 'education', 'communication', 'creative', 'social', 'blogging', 'notes']

const entrySchema = z.object({
  title: z.string().trim().min(2, 'Give the piece a title (2+ characters)').max(90),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  category: z.enum(['business', 'marketing', 'education', 'communication', 'creative', 'social', 'blogging', 'notes']),
  status: z.enum(['draft', 'planned', 'published']),
  notes: z.string().trim().max(500).optional().default(''),
})

type EntryForm = z.infer<typeof entrySchema>

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function monthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // Monday-first
  const days: Date[] = []
  const start = new Date(year, month, 1 - startOffset)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return days
}

export default function PlannerPage() {
  const entries = usePlannerStore((s) => s.entries)
  const createEntry = usePlannerStore((s) => s.createEntry)
  const updateEntry = usePlannerStore((s) => s.updateEntry)
  const setStatus = usePlannerStore((s) => s.setStatus)
  const deleteEntry = usePlannerStore((s) => s.deleteEntry)
  const createDocument = useDocumentsStore((s) => s.createDocument)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [editing, setEditing] = useState<PlannerEntry | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<PlannerEntry | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, PlannerEntry[]>()
    for (const e of entries) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [entries])

  const monthEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)),
    [entries, year, month],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: '', date: dateKey(today), category: 'blogging', status: 'planned', notes: '' },
  })

  const openCreate = (date?: string) => {
    setEditing(null)
    reset({ title: '', date: date ?? dateKey(new Date()), category: 'blogging', status: 'planned', notes: '' })
    setModalOpen(true)
  }

  const openEdit = (entry: PlannerEntry) => {
    setEditing(entry)
    reset({ title: entry.title, date: entry.date, category: entry.category, status: entry.status, notes: entry.notes })
    setModalOpen(true)
  }

  const onSubmit = (values: EntryForm) => {
    if (editing) {
      if (updateEntry(editing.id, { ...values, notes: values.notes ?? '' })) {
        toast.success('Entry updated', `“${values.title}” saved.`)
        setModalOpen(false)
      }
    } else {
      const created = createEntry({ ...values, notes: values.notes ?? '' })
      if (created) {
        toast.success('Entry scheduled', `“${created.title}” on ${created.date}.`)
        setModalOpen(false)
      } else {
        toast.error('Could not schedule', 'Check the title and date.')
      }
    }
  }

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  const days = monthMatrix(year, month)
  const todayKey = dateKey(today)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Content planner</h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted">
            Schedule drafts, planned, and published pieces on a monthly calendar.
          </p>
        </div>
        <Button icon={<CalendarPlus className="size-4" />} onClick={() => openCreate()}>
          New entry
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue/25 bg-blue-soft px-4 py-3">
        <Info className="mt-0.5 size-4.5 shrink-0 text-blue" aria-hidden />
        <p className="text-xs leading-relaxed text-muted">
          Planning happens <strong className="text-ink">locally only</strong>. Nothing is published
          to any external platform, and no automation exists — the planner is your personal
          editorial calendar.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Calendar */}
        <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-display text-lg font-semibold">
              {new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setYear(today.getFullYear())
                  setMonth(today.getMonth())
                }}
                aria-label="Jump to today"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-sand hover:text-ink"
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-sand/50">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-faint">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day)
              const inMonth = day.getMonth() === month
              const dayEntries = byDate.get(key) ?? []
              const isToday = key === todayKey
              return (
                <div
                  key={key}
                  className={cn(
                    'group relative min-h-[92px] border-b border-r border-line p-1.5 transition-colors last:border-r-0',
                    !inMonth && 'bg-sand/30',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-[11px] font-semibold',
                        isToday ? 'bg-violet text-white' : inMonth ? 'text-muted' : 'text-faint/60',
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCreate(key)}
                      aria-label={`Add entry on ${key}`}
                      className="rounded p-0.5 text-faint opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                    >
                      <CalendarPlus className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEntries.slice(0, 3).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => openEdit(e)}
                        className={cn(
                          'block w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium transition-colors',
                          e.status === 'draft' && 'bg-amber-soft text-amber hover:bg-amber/20',
                          e.status === 'planned' && 'bg-blue-soft text-blue hover:bg-blue/20',
                          e.status === 'published' && 'bg-moss-soft text-moss hover:bg-moss/20',
                        )}
                        title={e.title}
                      >
                        {e.title}
                      </button>
                    ))}
                    {dayEntries.length > 3 ? (
                      <p className="px-1.5 text-[9px] text-faint">+{dayEntries.length - 3} more</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel: legend + this month */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-faint">Statuses</h3>
            <ul className="mt-3 space-y-2.5">
              {(Object.keys(STATUS_META) as PlannerStatus[]).map((s) => (
                <li key={s} className="flex items-center gap-2.5 text-sm text-muted">
                  <span className={cn('size-2.5 rounded-full', STATUS_META[s].dot)} aria-hidden />
                  {STATUS_META[s].label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-faint">This month</h3>
            {monthEntries.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No entries this month yet.</p>
            ) : (
              <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {[...monthEntries]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((e) => (
                      <motion.li
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="rounded-xl border border-line p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button type="button" onClick={() => openEdit(e)} className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                            <p className="mt-0.5 text-[11px] text-faint">
                              {new Date(e.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {e.category}
                            </p>
                          </button>
                          <Badge tone={STATUS_META[e.status].tone}>{STATUS_META[e.status].label}</Badge>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const order: PlannerStatus[] = ['draft', 'planned', 'published']
                              const next = order[(order.indexOf(e.status) + 1) % 3]
                              setStatus(e.id, next)
                              toast.info(`Marked ${next}`, `“${e.title}” is now ${next}.`)
                            }}
                            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-violet transition-colors hover:bg-violet-soft"
                          >
                            <CircleDot className="size-3" aria-hidden /> Advance status
                          </button>
                          <span className="ml-auto flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(e)}
                              aria-label={`Edit ${e.title}`}
                              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-sand hover:text-ink"
                            >
                              <Pencil className="size-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(e)}
                              aria-label={`Delete ${e.title}`}
                              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-clay-soft hover:text-clay"
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </button>
                          </span>
                        </div>
                      </motion.li>
                    ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit planner entry' : 'New planner entry'}
        labelId="planner-form-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>{editing ? 'Save entry' : 'Add to planner'}</Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <FieldLabel htmlFor="entry-title">Content title</FieldLabel>
            <Input id="entry-title" placeholder="e.g. Newsletter #15" aria-invalid={!!errors.title} {...register('title')} />
            <FieldError message={errors.title?.message} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="entry-date">Scheduled date</FieldLabel>
              <Input id="entry-date" type="date" aria-invalid={!!errors.date} {...register('date')} />
              <FieldError message={errors.date?.message} />
            </div>
            <div>
              <FieldLabel htmlFor="entry-category">Category</FieldLabel>
              <Select id="entry-category" {...register('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="entry-status">Status</FieldLabel>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Status">
              {(Object.keys(STATUS_META) as PlannerStatus[]).map((s) => (
                <label
                  key={s}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-muted transition-colors has-checked:border-violet has-checked:bg-violet-soft/60 has-checked:text-ink"
                >
                  <input type="radio" value={s} className="sr-only" {...register('status')} />
                  <span className={cn('size-2 rounded-full', STATUS_META[s].dot)} aria-hidden />
                  {STATUS_META[s].label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="entry-notes" hint="optional">
              Notes
            </FieldLabel>
            <Textarea id="entry-notes" rows={3} placeholder="Angle, references, reminders…" {...register('notes')} />
          </div>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                const doc = createDocument({ title: editing.title, category: editing.category })
                if (doc) toast.success('Document started', `“${doc.title}” created from the planner.`)
              }}
              className="flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium text-violet transition-colors hover:bg-violet-soft"
            >
              <CalendarDays className="size-4" aria-hidden />
              Start writing this as a document
            </button>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove this entry?"
        body={
          <>
            “<strong className="text-ink">{deleting?.title}</strong>” will be removed from the
            planner. No documents are affected.
          </>
        }
        confirmLabel="Remove entry"
        destructive
        onConfirm={() => {
          if (deleting && deleteEntry(deleting.id)) {
            toast.success('Entry removed', `“${deleting.title}” was deleted.`)
          }
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
