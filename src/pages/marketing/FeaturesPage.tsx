import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BrainCircuit,
  CalendarRange,
  Check,
  FileText,
  ListChecks,
  MessageSquareQuote,
  Minimize2,
  PenLine,
  ScanText,
  SpellCheck,
  Wand2,
} from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'

const features = [
  {
    icon: Wand2,
    tone: 'violet' as const,
    title: 'AI writing assistance',
    body: 'Ten deliberate tools — improve, rewrite, continue, and more. Each shows a preview before it touches your text, and each is clearly labeled as a rule-based simulation.',
    points: ['Preview before apply', 'Works on selection or whole document', 'Undo stays available'],
  },
  {
    icon: SpellCheck,
    tone: 'blue' as const,
    title: 'Grammar improvement',
    body: 'The demo engine fixes common misspellings, spacing, capitalization, and basic agreement — and tells you exactly what it changed.',
    points: ['Transparent change notes', 'Case-preserving fixes', 'No silent edits'],
  },
  {
    icon: MessageSquareQuote,
    tone: 'moss' as const,
    title: 'Tone adjustment',
    body: 'Seven registers: professional, friendly, formal, confident, concise, persuasive, academic. Lexicon swaps, contraction handling, and hedge removal — visible in the before/after view.',
    points: ['Seven selectable tones', 'Hedge removal for confidence', 'Brand-voice aware'],
  },
  {
    icon: Minimize2,
    tone: 'amber' as const,
    title: 'Summarization',
    body: 'Extractive summarization scores your sentences by keyword frequency and keeps the strongest ones — in their original order.',
    points: ['Adjustable compression', 'Always original sentences', 'Shows the reduction ratio'],
  },
  {
    icon: PenLine,
    tone: 'clay' as const,
    title: 'Content expansion',
    body: 'Elaboration sentences built from the topics already in your text. Useful for pushing a thin draft toward a complete one — clearly marked as generated.',
    points: ['Topic-aware additions', 'Word-count before/after', 'Template-based, honest about it'],
  },
  {
    icon: BrainCircuit,
    tone: 'violet' as const,
    title: 'Brainstorming & outlines',
    body: 'Generate eight editorial angles from a topic, or derive a full outline from your strongest sentences.',
    points: ['Eight proven angles', 'Auto-detected topic', 'Outline inserts at cursor'],
  },
  {
    icon: FileText,
    tone: 'blue' as const,
    title: 'Document organization',
    body: 'A real library: categories, favorites, search, sorting, duplication, and safe deletion with confirmation. Stored in IndexedDB on your device.',
    points: ['Full CRUD + search', 'Category filters', 'Local-first storage'],
  },
  {
    icon: BookMarked,
    tone: 'moss' as const,
    title: 'Brand voice',
    body: 'Define tone, audience, words to use, and words to avoid. The demo engine respects your vocabulary when suggesting improvements.',
    points: ['Multiple voice profiles', 'One active at a time', 'Applied in improve & rewrite'],
  },
  {
    icon: CalendarRange,
    tone: 'amber' as const,
    title: 'Content planning',
    body: 'A monthly calendar with draft, planned, and published statuses. Local planning only — nothing is published anywhere automatically.',
    points: ['Month navigation', 'Status workflow', 'Category tagging'],
  },
]

export default function FeaturesPage() {
  useSEO({
    title: 'Features',
    description:
      'AI-assisted editing tools, grammar improvement, tone controls, summarization, templates, brand voice, and content planning — every feature of the ProseQ AI writing workspace.',
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(50% 40% at 80% 0%, var(--c-violet-soft), transparent 70%)',
          }}
        />
        <div className="container-site py-16 sm:py-20">
          <Reveal>
            <span className="kicker">
              <ScanText className="size-3.5 text-violet" aria-hidden /> Features
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              A complete toolkit for the words you are responsible for
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Every feature below works in the app right now — no "coming soon" cards. The AI tools
              are honest, local simulations; everything else is a real, persistent application
              feature.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link to="/app/writer">
                <Button size="lg" iconRight={<ArrowRight className="size-4.5" />}>
                  Try the editor
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="outline">
                  Browse templates
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-site">
          <StaggerGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
                      <f.icon className="size-5" aria-hidden />
                    </span>
                    <Badge tone={f.tone}>Works today</Badge>
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{f.body}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13px] text-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-moss" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="border-t border-line bg-sand/40 py-16 sm:py-20">
        <div className="container-site">
          <SectionHeading
            kicker="Under the hood"
            title="Local-first, privacy-respecting, honest"
            description="No accounts, no uploads, no tracking. Your writing lives in your browser storage, and simulated results always say so."
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'IndexedDB documents',
                body: 'Documents and version snapshots persist in IndexedDB with a localStorage fallback — surviving refreshes and restarts.',
              },
              {
                icon: ListChecks,
                title: 'Snapshot-based history',
                body: 'Versions are captured when changes are meaningful (word deltas or time gaps), never per keystroke, capped at 20 per document.',
              },
              {
                icon: ScanText,
                title: 'Swappable AI layer',
                body: 'The UI talks to a small provider interface. The demo engine implements it locally; a real backend can be slotted in later.',
              },
            ].map((x) => (
              <StaggerItem key={x.title}>
                <div className="h-full rounded-2xl border border-line bg-paper p-6 shadow-soft">
                  <x.icon className="size-6 text-violet" aria-hidden />
                  <h3 className="mt-3 font-display text-base font-semibold">{x.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{x.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  )
}
