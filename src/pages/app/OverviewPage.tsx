import { Suspense, lazy, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarRange,
  FilePlus2,
  FileText,
  Info,
  LayoutTemplate,
  Mic,
  PenLine,
  Sparkles,
} from 'lucide-react'
import type { StoredDocument } from '@/types'
import { useProfileStore } from '@/store/profile'
import { useDocumentsStore } from '@/store/documents'
import { useBrandVoiceStore } from '@/store/brandVoice'
import { usePlannerStore } from '@/store/planner'
import { useActivityStore } from '@/store/activity'
import { seedWritingActivity } from '@/data/demo'
import { TEMPLATES } from '@/data/templates'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { StaggerGroup } from '@/components/ui/Reveal'
import { greetingFor, timeAgo } from '@/lib/utils'

const ActivityChart = lazy(() => import('@/features/overview/ActivityChart'))
const CategoryDonut = lazy(() => import('@/features/overview/CategoryDonut'))

const CATEGORY_COLORS = [
  'var(--c-violet)',
  'var(--c-blue)',
  'var(--c-moss)',
  'var(--c-amber)',
  'var(--c-clay)',
  'var(--c-faint)',
  '#8a7fb8',
  '#5f8fd4',
]

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  to,
  delay,
}: {
  icon: typeof FileText
  label: string
  value: string
  sub: string
  to: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        to={to}
        className="group block rounded-2xl border border-line bg-paper p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
            <Icon className="size-5" aria-hidden />
          </span>
          <ArrowRight
            className="size-4 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden
          />
        </div>
        <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs text-faint">{sub}</p>
      </Link>
    </motion.div>
  )
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const documents = useDocumentsStore((s) => s.documents)
  const createDocument = useDocumentsStore((s) => s.createDocument)
  const voices = useBrandVoiceStore((s) => s.voices)
  const plannerEntries = usePlannerStore((s) => s.entries)
  const activity = useActivityStore((s) => s.items)

  const recent = useMemo(
    () =>
      [...documents]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [documents],
  )

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return [...plannerEntries]
      .filter((e) => e.date >= today && e.status !== 'published')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
  }, [plannerEntries])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of documents) map.set(d.category, (map.get(d.category) ?? 0) + 1)
    let i = 0
    return [...map.entries()].map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[i++ % CATEGORY_COLORS.length],
    }))
  }, [documents])

  const totalWords = documents.reduce((sum, d) => sum + d.wordCount, 0)
  const chartData = useMemo(() => seedWritingActivity(), [])

  const favoriteTemplates = useMemo(() => TEMPLATES.slice(0, 4), [])

  const newDoc = () => {
    const doc = createDocument()
    if (doc) navigate(`/app/writer?doc=${doc.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet">{greetingFor()},</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile.displayName}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Here is where your writing stands today. Numbers below reflect your local library —
            the activity chart is illustrative demo data.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" icon={<LayoutTemplate className="size-4" />} onClick={() => navigate('/app/templates')}>
            Templates
          </Button>
          <Button icon={<FilePlus2 className="size-4" />} onClick={newDoc}>
            New document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Documents"
          value={String(documents.length)}
          sub={documents.length === 1 ? '1 piece in the library' : `${documents.length} pieces in the library`}
          to="/app/documents"
          delay={0}
        />
        <StatCard
          icon={PenLine}
          label="Total words"
          value={totalWords.toLocaleString()}
          sub="across all documents"
          to="/app/documents"
          delay={0.06}
        />
        <StatCard
          icon={CalendarRange}
          label="Planned content"
          value={String(upcoming.length)}
          sub="upcoming entries"
          to="/app/planner"
          delay={0.12}
        />
        <StatCard
          icon={Mic}
          label="Brand voices"
          value={String(voices.length)}
          sub={voices.find((v) => v.active) ? `active: ${voices.find((v) => v.active)?.name}` : 'none active'}
          to="/app/brand-voice"
          delay={0.18}
        />
      </StaggerGroup>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Writing activity</CardTitle>
              <p className="mt-0.5 text-xs text-faint">Last 14 days · words per day</p>
            </div>
            <Badge tone="amber">
              <Info className="size-3" aria-hidden /> Illustrative demo data
            </Badge>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<div className="skeleton h-64" />}>
              <ActivityChart data={chartData} />
            </Suspense>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Library by category</CardTitle>
              <p className="mt-0.5 text-xs text-faint">Your documents, grouped</p>
            </div>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<div className="skeleton h-64" />}>
              <CategoryDonut data={categoryData} />
            </Suspense>
          </CardBody>
        </Card>
      </div>

      {/* Recent + upcoming */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently edited</CardTitle>
            <Link to="/app/documents" className="text-xs font-medium text-violet hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="pt-2">
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong py-10 text-center">
                <p className="text-sm text-muted">No documents yet.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={newDoc}>
                  Create your first
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((d: StoredDocument) => (
                  <li key={d.id}>
                    <Link
                      to={`/app/writer?doc=${d.id}`}
                      className="group flex items-center gap-3.5 py-3 transition-colors"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-sand/50 text-muted">
                        <FileText className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink group-hover:text-violet">
                          {d.title}
                        </span>
                        <span className="block text-xs text-faint">
                          {d.wordCount} words · {timeAgo(d.updatedAt)}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming content</CardTitle>
            <Link to="/app/planner" className="text-xs font-medium text-violet hover:underline">
              Open planner
            </Link>
          </CardHeader>
          <CardBody className="pt-2">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong py-10 text-center">
                <p className="text-sm text-muted">Nothing scheduled ahead.</p>
                <Link to="/app/planner">
                  <Button size="sm" variant="outline" className="mt-3">
                    Plan something
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center gap-3.5 py-3">
                    <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-sand/50 text-[10px] font-bold text-muted">
                      {new Date(e.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short' })}
                      <span className="text-sm leading-none">{e.date.slice(-2)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{e.title}</span>
                      <span className="block text-xs text-faint capitalize">{e.category}</span>
                    </span>
                    <Badge tone={e.status === 'draft' ? 'amber' : 'blue'}>{e.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick actions + templates + activity */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-2.5">
            {[
              { icon: FilePlus2, label: 'Blank document', action: newDoc },
              { icon: PenLine, label: 'Open the AI Writer', action: () => navigate('/app/writer') },
              { icon: LayoutTemplate, label: `Browse ${TEMPLATES.length} templates`, action: () => navigate('/app/templates') },
              { icon: Sparkles, label: 'Generate content ideas', action: () => navigate('/app/writer') },
              { icon: CalendarRange, label: 'Schedule a piece', action: () => navigate('/app/planner') },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.action}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-violet/40 hover:bg-violet-soft/40"
              >
                <a.icon className="size-4 text-violet" aria-hidden />
                {a.label}
              </button>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite templates</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-2">
            {favoriteTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate('/app/templates')}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left transition-colors hover:border-violet/40 hover:bg-violet-soft/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{t.name}</span>
                  <span className="block text-xs capitalize text-faint">{t.category}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-faint" aria-hidden />
              </button>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardBody className="pt-1">
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Nothing yet.</p>
            ) : (
              <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {activity.slice(0, 7).map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="leading-snug text-ink">{a.message}</p>
                    <p className="mt-0.5 text-[11px] text-faint">{timeAgo(a.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
