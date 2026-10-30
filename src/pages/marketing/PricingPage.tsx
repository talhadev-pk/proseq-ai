import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Info, Users, Zap } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'
import { cn } from '@/lib/utils'

type Interval = 'monthly' | 'yearly'

interface Tier {
  id: string
  name: string
  icon: typeof Zap
  blurb: string
  monthly: number
  yearly: number
  cta: string
  featured?: boolean
  features: string[]
}

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    blurb: 'For personal writing and trying everything the workspace offers.',
    monthly: 0,
    yearly: 0,
    cta: 'Start free',
    features: [
      'Unlimited local documents',
      'All 28 templates',
      'All ten demo writing tools',
      'One brand voice profile',
      'Content planner',
      'Version history (20 per document)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: ArrowRight,
    blurb: 'For professional writers who live in the editor every day.',
    monthly: 12,
    yearly: 120,
    cta: 'Choose Pro',
    featured: true,
    features: [
      'Everything in Free',
      'Unlimited brand voice profiles',
      'Priority access to future AI features',
      'Advanced export options',
      'Custom template drafts',
      'Email support (demonstration)',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    icon: Users,
    blurb: 'For content teams that need shared voice and planning.',
    monthly: 29,
    yearly: 290,
    cta: 'Choose Team',
    features: [
      'Everything in Pro',
      'Shared brand voice library',
      'Collaborative content planner',
      'Team activity feed',
      'Admin controls',
      'Onboarding session (demonstration)',
    ],
  },
]

export default function PricingPage() {
  useSEO({
    title: 'Pricing (demonstration)',
    description:
      'Illustrative pricing tiers for the ProseQ AI writing workspace. Clearly labeled demonstration content — no payments are processed.',
  })
  const [interval, setInterval] = useState<Interval>('monthly')

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(50% 40% at 20% 0%, var(--c-blue-soft), transparent 70%)',
          }}
        />
        <div className="container-site py-16 text-center sm:py-20">
          <Reveal>
            <span className="kicker">
              <Info className="size-3.5 text-blue" aria-hidden /> Demonstration pricing
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Simple plans, honestly pretend
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              These tiers illustrate how ProseQ AI would be priced as a product. No payment
              processing exists here, no subscriptions can be activated, and every feature is
              available in the free local app regardless of plan.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <div
              role="radiogroup"
              aria-label="Billing interval"
              className="inline-flex items-center rounded-full border border-line bg-paper p-1 shadow-soft"
            >
              {(['monthly', 'yearly'] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={interval === i}
                  onClick={() => setInterval(i)}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    interval === i ? 'text-bg' : 'text-muted hover:text-ink',
                  )}
                >
                  {interval === i ? (
                    <motion.span
                      layoutId="interval-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10 capitalize">{i}</span>
                </button>
              ))}
              <span className="ml-1.5 mr-2 hidden text-xs font-semibold text-moss sm:inline">
                2 months free
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-site">
          <StaggerGroup className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((t) => {
              const price = interval === 'monthly' ? t.monthly : t.yearly
              return (
                <StaggerItem key={t.id}>
                  <article
                    className={cn(
                      'relative flex h-full flex-col rounded-2xl border bg-paper p-7 shadow-soft transition-shadow duration-200 hover:shadow-lifted',
                      t.featured ? 'border-violet/50 shadow-lifted' : 'border-line',
                    )}
                  >
                    {t.featured ? (
                      <span className="absolute -top-3 left-6">
                        <Badge tone="violet">Most popular</Badge>
                      </span>
                    ) : null}
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'inline-flex size-10 items-center justify-center rounded-xl',
                          t.featured
                            ? 'bg-gradient-to-br from-violet to-blue text-white'
                            : 'border border-line bg-sand/60 text-violet',
                        )}
                      >
                        <t.icon className="size-5" aria-hidden />
                      </span>
                      <h2 className="font-display text-xl font-semibold">{t.name}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{t.blurb}</p>
                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-display text-5xl font-semibold tracking-tight">
                        ${price}
                      </span>
                      <span className="text-sm text-muted">
                        /{interval === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-faint">
                      {price === 0 ? 'Free forever — in this demo, everything is' : 'Illustrative price — never charged'}
                    </p>
                    <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-6">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                          <Check className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/app" className="mt-7">
                      <Button className="w-full" variant={t.featured ? 'primary' : 'outline'}>
                        {t.cta}
                      </Button>
                    </Link>
                  </article>
                </StaggerItem>
              )
            })}
          </StaggerGroup>

          <Reveal delay={0.1} className="mt-12">
            <div className="mx-auto flex max-w-3xl items-start gap-3.5 rounded-2xl border border-amber/30 bg-amber-soft p-5">
              <Info className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">
                  To be clear: this pricing page is illustrative demonstration content.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  There is no payment processor, no billing, and no account system in this project.
                  The buttons above simply open the application, where every feature is available
                  because it runs entirely in your browser.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-sand/40 py-16 sm:py-20">
        <div className="container-site">
          <SectionHeading
            kicker="Pricing FAQ"
            title="The questions a demo pricing page should answer"
          />
          <Reveal className="mx-auto mt-10 max-w-3xl space-y-4">
            {[
              {
                q: 'Can I actually subscribe?',
                a: 'No. Clicking any plan simply opens the app. Implementing fake payment processing would be dishonest, so none exists.',
              },
              {
                q: 'Why show pricing at all?',
                a: 'Because this project demonstrates a complete SaaS product experience — pricing is part of that story, clearly labeled as illustrative.',
              },
              {
                q: 'Do the tiers limit anything?',
                a: 'No. Every feature in the application is fully available. The tier feature lists describe a hypothetical product, not the demo you are using.',
              },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
                <h3 className="font-display text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
