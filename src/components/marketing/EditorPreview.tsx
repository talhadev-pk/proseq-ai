import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Bold, Italic, List, Quote, Sparkles, Wand2 } from 'lucide-react'

const BEFORE =
  'i think our new onboarding emails are definately to long, and they dont explain the value very fast'
const AFTER =
  'Our new onboarding emails run too long and take too long to reach the value. We will tighten them.'

/**
 * The homepage's animated editor preview: types a sentence, "runs" the
 * Improve Writing demo tool, and swaps in the improved result. Loops gently.
 */
export function EditorPreview() {
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState<'typing' | 'processing' | 'result'>('typing')

  useEffect(() => {
    if (reduced) {
      setTyped(BEFORE)
      setPhase('result')
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const typeText = () => {
      setPhase('typing')
      setTyped('')
      let i = 0
      const tick = () => {
        if (cancelled) return
        i += 1 + Math.floor(Math.random() * 2)
        setTyped(BEFORE.slice(0, i))
        if (i < BEFORE.length) {
          timer = setTimeout(tick, 34)
        } else {
          timer = setTimeout(() => setPhase('processing'), 700)
        }
      }
      timer = setTimeout(tick, 500)
    }

    const run = () => {
      if (cancelled) return
      if (phase === 'processing') {
        timer = setTimeout(() => setPhase('result'), 1100)
      } else if (phase === 'result') {
        timer = setTimeout(typeText, 5200)
      }
    }

    if (phase === 'typing' && typed === '') typeText()
    else run()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduced])

  return (
    <div className="relative">
      {/* Ambient gradient wash behind the card */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            'radial-gradient(40% 60% at 30% 20%, var(--c-violet-soft), transparent), radial-gradient(40% 60% at 75% 80%, var(--c-blue-soft), transparent)',
        }}
      />
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-pop">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-sand/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-clay/60" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber/60" aria-hidden />
          <span className="size-2.5 rounded-full bg-moss/60" aria-hidden />
          <span className="ml-2 truncate font-mono text-[11px] text-faint">
            proseq-ai · Onboarding email — draft
          </span>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-moss-soft px-2 py-0.5 text-[10px] font-semibold text-moss sm:inline-flex">
            <span className="size-1.5 rounded-full bg-moss" /> Autosaved
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-line px-3 py-2">
          {[Bold, Italic, List, Quote].map((Icon, i) => (
            <span
              key={i}
              className="rounded-md p-1.5 text-faint"
              aria-hidden
            >
              <Icon className="size-4" />
            </span>
          ))}
          <span className="mx-1 h-4 w-px bg-line" aria-hidden />
          <span className="flex items-center gap-1.5 rounded-md bg-violet-soft px-2 py-1 text-[11px] font-semibold text-violet-deep">
            <Sparkles className="size-3.5" /> Improve Writing
          </span>
          <span className="ml-auto font-mono text-[10px] text-faint">
            {phase === 'result' ? '38 words' : `${typed.split(' ').filter(Boolean).length} words`}
          </span>
        </div>

        {/* Writing surface */}
        <div className="min-h-[168px] px-6 py-5 sm:px-8">
          <div className="prose-editor text-[15px] sm:text-base">
            {phase === 'result' ? (
              <motion.p
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="!text-ink"
              >
                {AFTER}
              </motion.p>
            ) : phase === 'processing' ? (
              <div className="flex h-9 items-center gap-2 text-sm text-muted">
                <Wand2 className="size-4 animate-pulse text-violet" aria-hidden />
                <span>Demo engine analyzing the sentence…</span>
                <motion.span
                  className="flex gap-1"
                  aria-hidden
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-violet"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.span>
              </div>
            ) : (
              <p className="!text-ink">
                {typed}
                <span
                  className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-violet animate-caret-blink"
                  aria-hidden
                />
              </p>
            )}
          </div>
        </div>

        {/* Demo footer strip */}
        <div className="flex items-center justify-between border-t border-line bg-sand/40 px-4 py-2.5">
          <span className="text-[11px] font-medium text-faint">
            {phase === 'result' ? 'Simulated result — rule-based demo engine' : 'Simulated typing preview'}
          </span>
          {phase === 'result' ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-moss-soft px-2.5 py-0.5 text-[10px] font-semibold text-moss"
            >
              6 issues addressed
            </motion.span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
