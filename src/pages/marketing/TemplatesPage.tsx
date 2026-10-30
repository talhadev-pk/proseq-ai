import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Eye, FileText, Search, Sparkles } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Reveal } from '@/components/ui/Reveal'
import { Input } from '@/components/ui/Input'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/templates'
import type { WritingTemplate } from '@/types'
import { useDocumentsStore } from '@/store/documents'
import { toast } from '@/store/notifications'
import { cn } from '@/lib/utils'

export default function TemplatesPage() {
  useSEO({
    title: 'Templates',
    description:
      'Browse 28 writing templates across business, marketing, education, communication, creative, social, and blogging — each opens directly in the ProseQ AI editor.',
  })

  const navigate = useNavigate()
  const createFromTemplate = useDocumentsStore((s) => s.createFromTemplate)
  const [category, setCategory] = useState<'all' | WritingTemplate['category']>('all')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<WritingTemplate | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (q && !`${t.name} ${t.description} ${t.category}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [category, query])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of TEMPLATES) map.set(t.category, (map.get(t.category) ?? 0) + 1)
    return map
  }, [])

  const openInApp = (template: WritingTemplate) => {
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
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(45% 40% at 80% 0%, var(--c-violet-soft), transparent 70%)',
          }}
        />
        <div className="container-site py-16 sm:py-20">
          <Reveal>
            <span className="kicker">
              <BookOpen className="size-3.5 text-violet" aria-hidden /> Template library
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Structured starting points for every kind of writing
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {TEMPLATES.length} templates, each with a preview and a one-click jump into the
              editor. Preview any structure below, or open it straight into your workspace.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-site">
          {/* Controls */}
          <Reveal className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                aria-label="Search templates"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <button
                type="button"
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  category === 'all'
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line bg-paper text-muted hover:border-ink/40 hover:text-ink',
                )}
              >
                All · {TEMPLATES.length}
              </button>
              {TEMPLATE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    category === c.id
                      ? 'border-ink bg-ink text-bg'
                      : 'border-line bg-paper text-muted hover:border-ink/40 hover:text-ink',
                  )}
                >
                  {c.label} · {counts.get(c.id) ?? 0}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-sand/40 py-16 text-center">
              <p className="font-display text-lg font-semibold">No templates match that search</p>
              <p className="mt-1.5 text-sm text-muted">Try a different keyword or category.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <motion.article
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                  className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <Badge tone="violet">{t.category}</Badge>
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold">{t.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.description}</p>
                  <div className="mt-5 flex gap-2.5">
                    <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />} onClick={() => setPreview(t)}>
                      Preview
                    </Button>
                    <Button size="sm" iconRight={<ArrowRight className="size-3.5" />} onClick={() => openInApp(t)}>
                      Use template
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name}
        description={preview?.purpose}
        size="lg"
        labelId="tpl-preview-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Close
            </Button>
            {preview ? (
              <Button iconRight={<ArrowRight className="size-4" />} onClick={() => openInApp(preview)}>
                Open in editor
              </Button>
            ) : null}
          </>
        }
      >
        {preview ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="violet">
                <Sparkles className="size-3" aria-hidden /> {preview.category}
              </Badge>
              <span className="text-xs text-faint">Structure preview</span>
            </div>
            <div
              className="prose-editor max-h-96 overflow-y-auto rounded-xl border border-line bg-sand/40 px-5 py-4 text-sm"
              dangerouslySetInnerHTML={{ __html: preview.structure }}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}
