import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, LayoutTemplate, Search, Sparkles } from 'lucide-react'
import type { WritingTemplate } from '@/types'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/templates'
import { useDocumentsStore } from '@/store/documents'
import { toast } from '@/store/notifications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks'

type CategoryFilter = 'all' | WritingTemplate['category']

export default function AppTemplatesPage() {
  const navigate = useNavigate()
  const createFromTemplate = useDocumentsStore((s) => s.createFromTemplate)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 180)
  const [preview, setPreview] = useState<WritingTemplate | null>(null)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [category, debounced])

  const use = (template: WritingTemplate) => {
    const doc = createFromTemplate(template)
    if (doc) {
      toast.success('Template applied', `“${template.name}” opened as a new document.`)
      setPreview(null)
      navigate(`/app/writer?doc=${doc.id}`)
    } else {
      toast.error('Could not create the document', 'Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1.5 text-sm text-muted">
            {TEMPLATES.length} structured starting points — using one creates a new document you own.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            aria-label="Search templates"
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <Tabs
          items={[
            { id: 'all', label: 'All' },
            ...TEMPLATE_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
          ]}
          value={category}
          onChange={(id) => setCategory(id as CategoryFilter)}
          size="sm"
          className="max-w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Search className="size-6" />}
            title="No templates match"
            description="Try a different keyword or category."
            action={
              <Button variant="outline" onClick={() => { setQuery(''); setCategory('all') }}>
                Reset
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.24) }}
              className={cn(
                'flex h-full flex-col rounded-2xl border bg-paper p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted',
                category !== 'all' && t.category === category ? 'border-violet/40' : 'border-line',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
                  <LayoutTemplate className="size-5" aria-hidden />
                </span>
                <Badge tone="violet">{t.category}</Badge>
              </div>
              <h2 className="mt-3.5 font-display text-lg font-semibold">{t.name}</h2>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />} onClick={() => setPreview(t)}>
                  Preview
                </Button>
                <Button size="sm" onClick={() => use(t)}>Use template</Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name}
        description={preview?.purpose}
        size="lg"
        labelId="app-tpl-preview"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Close
            </Button>
            {preview ? (
              <Button iconRight={<Sparkles className="size-4" />} onClick={() => use(preview)}>
                Use this template
              </Button>
            ) : null}
          </>
        }
      >
        {preview ? (
          <div
            className="prose-editor max-h-96 overflow-y-auto rounded-xl border border-line bg-sand/40 px-5 py-4 text-sm"
            dangerouslySetInnerHTML={{ __html: preview.structure }}
          />
        ) : null}
      </Modal>
    </div>
  )
}
