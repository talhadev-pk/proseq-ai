import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarRange,
  FileText,
  LayoutTemplate,
  Mic,
  Search,
  CornerDownLeft,
} from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { useDocumentsStore } from '@/store/documents'
import { useBrandVoiceStore } from '@/store/brandVoice'
import { usePlannerStore } from '@/store/planner'
import { TEMPLATES } from '@/data/templates'
import { Kbd } from '@/components/ui/Kbd'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDate } from '@/lib/utils'

interface SearchHit {
  id: string
  kind: 'document' | 'template' | 'voice' | 'planner'
  title: string
  subtitle: string
  action: () => void
}

const KIND_META = {
  document: { icon: FileText, label: 'Document', tone: 'blue' as const },
  template: { icon: LayoutTemplate, label: 'Template', tone: 'violet' as const },
  voice: { icon: Mic, label: 'Brand voice', tone: 'moss' as const },
  planner: { icon: CalendarRange, label: 'Planner', tone: 'amber' as const },
}

export function SearchModal() {
  const open = useUIStore((s) => s.searchOpen)
  const setOpen = useUIStore((s) => s.setSearchOpen)
  const documents = useDocumentsStore((s) => s.documents)
  const voices = useBrandVoiceStore((s) => s.voices)
  const plannerEntries = usePlannerStore((s) => s.entries)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Global Ctrl/Cmd+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase()
    const match = (s: string) => s.toLowerCase().includes(q)
    const out: SearchHit[] = []

    for (const d of documents) {
      if (!q || match(d.title) || match(d.content)) {
        out.push({
          id: `doc-${d.id}`,
          kind: 'document',
          title: d.title,
          subtitle: `${d.wordCount} words · updated ${formatDate(d.updatedAt)}`,
          action: () => navigate(`/app/writer?doc=${d.id}`),
        })
      }
    }
    for (const t of TEMPLATES) {
      if (!q || match(t.name) || match(t.description) || match(t.category)) {
        out.push({
          id: `tpl-${t.id}`,
          kind: 'template',
          title: t.name,
          subtitle: t.description,
          action: () => navigate('/app/templates'),
        })
      }
    }
    for (const v of voices) {
      if (!q || match(v.name) || match(v.description) || match(v.audience)) {
        out.push({
          id: `voice-${v.id}`,
          kind: 'voice',
          title: v.name,
          subtitle: v.description || `${v.tone} tone`,
          action: () => navigate('/app/brand-voice'),
        })
      }
    }
    for (const p of plannerEntries) {
      if (!q || match(p.title) || match(p.notes) || match(p.category)) {
        out.push({
          id: `plan-${p.id}`,
          kind: 'planner',
          title: p.title,
          subtitle: `${p.status} · ${formatDate(p.date)}`,
          action: () => navigate('/app/planner'),
        })
      }
    }
    return q ? out.slice(0, 14) : out.slice(0, 10)
  }, [query, documents, voices, plannerEntries, navigate])

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, hits.length - 1)))
  }, [hits.length])

  if (typeof document === 'undefined') return null

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-paper shadow-pop"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4.5 shrink-0 text-faint" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActive((a) => (a + 1) % Math.max(1, hits.length))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActive((a) => (a - 1 + Math.max(1, hits.length)) % Math.max(1, hits.length))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const hit = hits[active]
                    if (hit) {
                      setOpen(false)
                      hit.action()
                    }
                  } else if (e.key === 'Escape') {
                    setOpen(false)
                  }
                }}
                placeholder="Search documents, templates, brand voices, planner…"
                aria-label="Search everything"
                className="h-14 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
              <Kbd>ESC</Kbd>
            </div>

            <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-2" role="listbox" aria-label="Search results">
              {hits.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-faint">
                  No matches for “{query}”
                </li>
              ) : (
                hits.map((hit, i) => {
                  const meta = KIND_META[hit.kind]
                  return (
                    <li key={hit.id} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => {
                          setOpen(false)
                          hit.action()
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          i === active ? 'bg-sand' : 'hover:bg-sand/60',
                        )}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-muted">
                          <meta.icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{hit.title}</span>
                          <span className="block truncate text-xs text-faint">{hit.subtitle}</span>
                        </span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {i === active ? (
                          <CornerDownLeft className="size-3.5 shrink-0 text-faint" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            <div className="flex items-center gap-4 border-t border-line bg-sand/40 px-4 py-2.5 text-[11px] text-faint">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd> open
              </span>
              <span className="ml-auto hidden sm:block">Searches your local data</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
