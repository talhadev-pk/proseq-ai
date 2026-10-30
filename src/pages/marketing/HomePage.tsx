import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarRange,
  Check,
  ChevronDown,
  FileText,
  Layers,
  ListChecks,
  Mail,
  MessageSquareQuote,
  PenLine,
  Sparkles,
  StickyNote,
  Wand2,
} from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'
import { EditorPreview } from '@/components/marketing/EditorPreview'
import { TEMPLATES } from '@/data/templates'

const highlights = [
  {
    icon: Wand2,
    title: 'Ten focused writing tools',
    body: 'Improve, fix grammar, change tone, summarize, expand, shorten, continue, ideate, outline, rewrite — each one a deliberate edit, never a surprise.',
    accent: 'text-violet',
  },
  {
    icon: FileText,
    title: 'A real document library',
    body: 'Create, rename, duplicate, favorite, search, and organize. Everything persists locally in your browser — no account gymnastics.',
    accent: 'text-blue',
  },
  {
    icon: MessageSquareQuote,
    title: 'Brand voice that sticks',
    body: 'Define the words you use and the words you ban. The demo engine respects your voice when it suggests changes.',
    accent: 'text-moss',
  },
  {
    icon: CalendarRange,
    title: 'Plan before you write',
    body: 'A calendar for drafts, planned, and published content — so the ideas you have on Tuesday exist when Friday arrives.',
    accent: 'text-amber',
  },
  {
    icon: Layers,
    title: '28 ready templates',
    body: 'Proposals, cover letters, blog outlines, captions — structured starting points that open straight into the editor.',
    accent: 'text-clay',
  },
  {
    icon: ListChecks,
    title: 'Version history',
    body: 'Snapshots taken when changes matter, not on every keystroke. Preview any version and restore with one click.',
    accent: 'text-violet-deep',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Start with intent',
    body: 'Open a blank page or a template. Give the document a title and a category — the library stays tidy without you thinking about it.',
  },
  {
    step: '02',
    title: 'Write, then refine',
    body: 'Draft in a calm editor with real formatting. When a paragraph fights you, select it and run a tool — preview the result before it touches your text.',
  },
  {
    step: '03',
    title: 'Keep your voice',
    body: 'Set the tone and vocabulary once in Brand Voice. Improvements bend toward how you actually sound, not how a robot sounds.',
  },
  {
    step: '04',
    title: 'Plan what is next',
    body: 'Drop ideas into the planner with a date and a status. Writing becomes a rhythm instead of a scramble.',
  },
]

const useCases = [
  {
    icon: PenLine,
    role: 'For marketers',
    body: 'Campaign briefs, product copy, and a month of captions planned in one place. Keep every asset in the voice your brand already owns.',
    points: ['Campaign brief template', 'Tone controls per channel', 'Content calendar with statuses'],
  },
  {
    icon: Mail,
    role: 'For founders & professionals',
    body: 'Emails, proposals, and announcements that sound like you on your best day — structured templates, then a quick pass with the improvement tools.',
    points: ['Professional email templates', 'Executive summaries', 'Confident tone in one click'],
  },
  {
    icon: BookOpen,
    role: 'For writers & students',
    body: 'Outlines that become drafts, drafts that become revisions. Summarize research, expand thin sections, and track every version along the way.',
    points: ['Blog & story outlines', 'Research summaries', 'Version history'],
  },
]

const faqs = [
  {
    q: 'Is ProseQ AI actually powered by an AI model?',
    a: 'Not yet — and we say so plainly. This is a frontend demonstration. The writing tools run a transparent, rule-based "demo engine" locally in your browser: grammar rules, extractive summarization, tone lexicons, and template-driven generation. Every result is labeled as simulated and shown for approval before anything is applied.',
  },
  {
    q: 'Where is my writing stored?',
    a: 'Entirely on your device. Documents live in your browser’s IndexedDB; preferences and settings in localStorage. Nothing is uploaded anywhere, and there is no account to create.',
  },
  {
    q: 'Will I lose my documents if I refresh?',
    a: 'No. Persistence is a first-class feature here — documents, profile changes, brand voices, and planner entries all survive refreshes. The app also never overwrites your saved data with demo content after you have changed something.',
  },
  {
    q: 'Can a real AI backend be added later?',
    a: 'Yes — that is the point of the architecture. The app talks to a small AIProvider interface; swapping the local demo engine for a real API adapter is a contained change that would not touch the editor or UI.',
  },
  {
    q: 'Is the pricing real?',
    a: 'No. The pricing page is clearly labeled illustrative demonstration content. There is no payment processing, no subscriptions, and no accounts.',
  },
]

function FAQ() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-paper shadow-soft">
      {faqs.map((f, i) => (
        <details key={i} className="group px-6 py-5" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span className="font-display text-base sm:text-lg">{f.q}</span>
            <ChevronDown className="size-5 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            {f.a}
          </motion.p>
        </details>
      ))}
    </div>
  )
}

export default function HomePage() {
  useSEO({
    title: 'The writing workspace that thinks with you',
    description:
      'Draft, refine, and organize everything you write — AI-assisted editing tools, templates, brand voice, and content planning in one calm workspace. (Frontend demonstration.)',
  })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(52% 38% at 18% 0%, var(--c-violet-soft) 0%, transparent 70%), radial-gradient(40% 34% at 85% 12%, var(--c-blue-soft) 0%, transparent 70%)',
          }}
        />
        <div className="container-site grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="kicker">
                <Sparkles className="size-3.5 text-violet" aria-hidden />
                Writing workspace · demo edition
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 font-display text-[2.65rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl"
            >
              The writing workspace that <span className="text-gradient-brand">thinks with you</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              Draft, refine, and organize everything you write. ProseQ AI brings focused editing
              tools, tone controls, templates, and content planning into one calm editor — so the
              path from a rough idea to a finished piece stays short.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link to="/app/writer">
                <Button size="lg" iconRight={<ArrowRight className="size-4.5" />}>
                  Start writing
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline">
                  Explore features
                </Button>
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 flex items-center gap-2 text-xs text-faint"
            >
              <StickyNote className="size-3.5" aria-hidden />
              No account needed · everything saves locally · AI features are honest simulations
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <EditorPreview />
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-t border-line bg-sand/40 py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading
            kicker="Why this workspace"
            title="Everything a piece of writing needs, nothing it doesn’t"
            description="Most writing tools are either a blank page or a noisy dashboard. ProseQ AI is built around the loop writers actually live in: draft, refine, organize, plan."
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <StaggerItem key={h.title}>
                <div className="group h-full rounded-2xl border border-line bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted">
                  <span className={`inline-flex size-11 items-center justify-center rounded-xl border border-line bg-sand/60 ${h.accent}`}>
                    <h.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading
            kicker="The workflow"
            title="A loop, not a labyrinth"
            description="Four deliberate stages — each one supported by the workspace instead of interrupted by it."
          />
          <div className="relative mt-14">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" aria-hidden />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {workflow.map((w, i) => (
                <Reveal key={w.step} delay={i * 0.09}>
                  <div className="relative">
                    <span className="relative z-10 inline-flex size-14 items-center justify-center rounded-2xl border border-line bg-paper font-display text-lg font-semibold text-violet shadow-soft">
                      {w.step}
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{w.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-line bg-sand/40 py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading
            kicker="Who it is for"
            title="Built for people whose week is made of words"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {useCases.map((u) => (
              <StaggerItem key={u.role}>
                <div className="h-full rounded-2xl border border-line bg-paper p-7 shadow-soft">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-soft to-blue-soft text-violet-deep">
                    <u.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{u.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{u.body}</p>
                  <ul className="mt-4 space-y-2">
                    {u.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted">
                        <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Template showcase */}
      <section className="py-20 sm:py-24">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              kicker="Template library"
              title="Never face a blank page alone"
              description="Twenty-eight structured starting points across business, marketing, education, communication, creative, social, and blogging."
            />
            <Reveal>
              <Link to="/templates">
                <Button variant="outline" iconRight={<ArrowRight className="size-4" />}>
                  Browse all templates
                </Button>
              </Link>
            </Reveal>
          </div>
          <StaggerGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.slice(0, 6).map((t) => (
              <StaggerItem key={t.id}>
                <Link
                  to="/templates"
                  className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-lifted"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold">{t.name}</h3>
                    <Badge tone="violet">{t.category}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{t.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Open template <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-sand/40 py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading kicker="Questions" title="Honest answers, up front" />
          <Reveal className="mt-12" delay={0.05}>
            <FAQ />
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24">
        <div className="container-site">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-line bg-paper px-6 py-16 text-center shadow-lifted sm:px-12 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(46% 60% at 20% 10%, var(--c-violet-soft), transparent 65%), radial-gradient(42% 55% at 82% 90%, var(--c-blue-soft), transparent 65%)',
                }}
              />
              <BrainCircuit className="mx-auto size-10 text-violet" aria-hidden />
              <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Your next piece of writing deserves a better home
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
                Open the workspace and start with a template, a blank page, or a half-formed idea.
                Everything is saved locally, and every tool shows its work.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                <Link to="/app/writer">
                  <Button size="lg" iconRight={<ArrowRight className="size-4.5" />}>
                    Start writing
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">
                    View demo pricing
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
