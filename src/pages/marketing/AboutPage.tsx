import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Compass,
  Eye,
  HeartHandshake,
  Info,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'

const principles = [
  {
    icon: Eye,
    title: 'Honesty over theater',
    body: 'Simulated features say they are simulated. Nothing in this product pretends to be a live AI model, a real backend, or a paying customer base.',
  },
  {
    icon: Lightbulb,
    title: 'The edit is sacred',
    body: 'Tools propose; the writer disposes. Every transformation is previewed before it is applied, and the original text survives until you accept a change.',
  },
  {
    icon: ShieldCheck,
    title: 'Local-first by default',
    body: 'Your words belong to you. Documents live in your browser’s storage. There is no account, no upload, and no telemetry.',
  },
  {
    icon: HeartHandshake,
    title: 'Calm is a feature',
    body: 'Generous whitespace, deliberate typography, and restrained motion. A writing tool should lower the temperature, not raise it.',
  },
]

export default function AboutPage() {
  useSEO({
    title: 'About',
    description:
      'The vision behind ProseQ AI: a calm, honest, local-first writing workspace. Built by Talha as a frontend demonstration project.',
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(45% 40% at 78% 0%, var(--c-violet-soft), transparent 70%)',
          }}
        />
        <div className="container-site py-16 sm:py-20">
          <Reveal>
            <span className="kicker">
              <Compass className="size-3.5 text-violet" aria-hidden /> About
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Writing software should feel like a good desk
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              ProseQ AI started from a simple observation: the words a person is responsible for —
              emails, posts, docs, briefs — rarely live in one place, and the tools that promise to
              help usually add noise instead of clarity. This project is an attempt at the opposite:
              one calm workspace where drafting, refining, organizing, and planning all feel like
              parts of the same activity.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-site grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight">The vision</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
              <p>
                The best writing tools disappear. You notice the sentence you are fixing, not the
                interface you are fixing it in. ProseQ AI is designed around that disappearance:
                an editorial reading surface, a quiet toolbar, and a set of assists that show their
                work before touching yours.
              </p>
              <p>
                The product vision is a complete writing loop — draft with intent, refine with
                transparent tools, keep a consistent voice, and plan what comes next — owned
                entirely by the writer. In this demonstration edition, that loop runs one hundred
                percent in your browser.
              </p>
              <p>
                When a real AI backend joins the picture someday, it will slot in behind the same
                interface the demo engine uses today: results proposed, previewed, and accepted by
                a human being who stays in charge of every word.
              </p>
            </div>
          </Reveal>
          <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {principles.map((p) => (
              <StaggerItem key={p.title}>
                <div className="h-full rounded-2xl border border-line bg-paper p-6 shadow-soft">
                  <p.icon className="size-6 text-violet" aria-hidden />
                  <h3 className="mt-3 font-display text-base font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="border-t border-line bg-sand/40 py-16 sm:py-20">
        <div className="container-site">
          <SectionHeading kicker="What this is" title="An honest demonstration" />
          <Reveal className="mx-auto mt-10 max-w-3xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-moss/25 bg-moss-soft p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-moss">
                  <Sparkles className="size-4" aria-hidden /> What is real
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>• A functional editor with formatting, stats, and autosave</li>
                  <li>• Persistent documents, profile, voices, and planner entries</li>
                  <li>• Export to TXT / Markdown / JSON, with validated import</li>
                  <li>• Version history with preview and restore</li>
                  <li>• Light / dark themes and responsive layouts</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-amber/25 bg-amber-soft p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-amber">
                  <Info className="size-4" aria-hidden /> What is simulated
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>• All "AI" writing tools (local rule-based engine)</li>
                  <li>• The pricing tiers and plan features</li>
                  <li>• Demo documents and activity shown on first run</li>
                  <li>• The contact form (no email is ever sent)</li>
                </ul>
              </div>
            </div>
            <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-muted">
              This project does not have real users, customers, or production AI integrations — and
              it will never claim to.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-site">
          <Reveal>
            <div className="rounded-3xl border border-line bg-paper px-6 py-14 text-center shadow-lifted sm:px-12">
              <p className="kicker mx-auto">
                <Sparkles className="size-3.5 text-violet" aria-hidden /> Built by Talha
              </p>
              <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-semibold tracking-tight">
                Made with care, one honest feature at a time
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted">
                ProseQ AI is a portfolio project exploring what a premium, local-first writing
                workspace can feel like when it is built with restraint.
              </p>
              <Link to="/app" className="mt-8 inline-block">
                <Button size="lg" iconRight={<ArrowRight className="size-4.5" />}>
                  Open the workspace
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
