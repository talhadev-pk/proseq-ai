import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  Info,
  Minimize2,
  PenLine,
  Pilcrow,
  ScanText,
  Sparkles,
  Wand2,
} from 'lucide-react'
import type { AIResult, BrandVoice, ToneId, ToolId } from '@/types'
import { aiProvider, TONE_OPTIONS, TOOL_LABELS } from '@/services/ai'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { cn, countWords } from '@/lib/utils'

type Target = 'selection' | 'document'

interface ToolMeta {
  id: ToolId
  icon: typeof Wand2
  blurb: string
  kind: 'transform' | 'generate'
  group: 'Refine' | 'Tone' | 'Length' | 'Create'
}

const TOOLS: ToolMeta[] = [
  { id: 'improve', icon: Wand2, blurb: 'Tighten wording, cut fillers, apply your brand voice.', kind: 'transform', group: 'Refine' },
  { id: 'grammar', icon: ScanText, blurb: 'Fix common spelling, spacing, and agreement slips.', kind: 'transform', group: 'Refine' },
  { id: 'rewrite', icon: Pilcrow, blurb: 'Paraphrase a paragraph while keeping its meaning.', kind: 'transform', group: 'Refine' },
  { id: 'tone', icon: PenLine, blurb: 'Shift the register: professional, friendly, formal…', kind: 'transform', group: 'Tone' },
  { id: 'summarize', icon: Minimize2, blurb: 'Keep the strongest sentences, drop the rest.', kind: 'transform', group: 'Length' },
  { id: 'shorten', icon: Minimize2, blurb: 'Remove filler and wordy phrases.', kind: 'transform', group: 'Length' },
  { id: 'expand', icon: Sparkles, blurb: 'Elaborate on each idea with added sentences.', kind: 'transform', group: 'Length' },
  { id: 'continue', icon: PenLine, blurb: 'Draft the next few sentences from your ending.', kind: 'generate', group: 'Create' },
  { id: 'ideas', icon: Sparkles, blurb: 'Generate eight content angles from a topic.', kind: 'generate', group: 'Create' },
  { id: 'outline', icon: PenLine, blurb: 'Derive a structured outline from your text.', kind: 'generate', group: 'Create' },
]

const GROUPS = ['Refine', 'Tone', 'Length', 'Create'] as const

function ToolIcon({ tool }: { tool: ToolId }) {
  const meta = TOOLS.find((t) => t.id === tool)
  if (!meta) return <Wand2 className="size-4" aria-hidden />
  const Icon = meta.icon
  return <Icon className="size-4" aria-hidden />
}

function ResultNotes({ notes }: { notes: string[] }) {
  return (
    <ul className="space-y-1.5">
      {notes.map((n, i) => (
        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <Check className="mt-0.5 size-3.5 shrink-0 text-moss" aria-hidden />
          {n}
        </li>
      ))}
    </ul>
  )
}

export function ToolsPanel({
  selectionText,
  documentText,
  documentTitle,
  voice,
  onApply,
}: {
  selectionText: string
  documentText: string
  documentTitle: string
  voice: BrandVoice | null
  /** Called with the accepted result; the page owns the editor and applies it. */
  onApply: (result: AIResult) => void
}) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [tone, setTone] = useState<ToneId | 'voice'>('voice')
  const [target, setTarget] = useState<Target>('selection')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasSelection = selectionText.trim().length > 0
  const effectiveTone: ToneId | undefined =
    tone === 'voice' ? (voice?.tone ?? 'professional') : tone

  const inputText = useMemo(() => {
    if (target === 'selection' && hasSelection) return selectionText
    return documentText
  }, [target, hasSelection, selectionText, documentText])

  const openTool = (tool: ToolId) => {
    setActiveTool(tool)
    setResult(null)
    setError(null)
    setTarget(hasSelection ? 'selection' : 'document')
    const meta = TOOLS.find((t) => t.id === tool)
    setRunning(false)
    if (meta?.kind === 'generate') setTarget('document')
  }

  const run = async () => {
    if (!activeTool) return
    if (!inputText.trim()) {
      setError('There is no text to work with — write or select something first.')
      return
    }
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await aiProvider.run({
        tool: activeTool,
        input: inputText,
        tone: effectiveTone,
        context: { documentTitle, voice },
      })
      setResult(res)
    } catch {
      setError('The demo engine could not process that text. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  const back = () => {
    setActiveTool(null)
    setResult(null)
    setError(null)
  }

  return (
    <aside
      aria-label="AI writing tools"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-soft"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
        {activeTool ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back to tools"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-sand hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Sparkles className="size-4 text-violet" aria-hidden />
        )}
        <h2 className="font-display text-sm font-semibold">
          {activeTool ? TOOL_LABELS[activeTool] : 'Writing tools'}
        </h2>
        <Badge tone="amber" className="ml-auto">
          <Info className="size-3" aria-hidden /> Demo engine
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          {!activeTool ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="p-4"
            >
              <p className="mb-4 rounded-xl border border-amber/25 bg-amber-soft px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
                These tools run a <strong className="text-ink">local, rule-based simulation</strong> —
                not a real AI model. Every result is previewed for your approval before anything
                changes.
              </p>
              {GROUPS.map((group) => (
                <div key={group} className="mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {TOOLS.filter((t) => t.group === group).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openTool(t.id)}
                        className="flex w-full items-start gap-3 rounded-xl border border-line bg-paper px-3.5 py-3 text-left transition-all duration-150 hover:-translate-y-px hover:border-violet/40 hover:shadow-soft"
                      >
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-soft text-violet-deep">
                          <t.icon className="size-3.5" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-ink">{TOOL_LABELS[t.id]}</span>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                            {t.blurb}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`tool-${activeTool}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="p-4"
            >
              {/* Options */}
              <div className="space-y-4">
                {activeTool === 'tone' ? (
                  <div>
                    <label htmlFor="tone-select" className="mb-1.5 block text-xs font-semibold text-ink">
                      Tone
                    </label>
                    <Select
                      id="tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value as ToneId | 'voice')}
                    >
                      {voice ? (
                        <option value="voice">Use active brand voice ({voice.tone})</option>
                      ) : null}
                      {TONE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label} — {t.hint}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}

                <fieldset>
                  <legend className="mb-1.5 text-xs font-semibold text-ink">Text to work on</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={target === 'selection'}
                      disabled={!hasSelection}
                      onClick={() => setTarget('selection')}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-left text-xs transition-colors disabled:opacity-40',
                        target === 'selection'
                          ? 'border-violet bg-violet-soft/60 text-ink'
                          : 'border-line text-muted hover:border-line-strong',
                      )}
                    >
                      <span className="block font-semibold">Selected text</span>
                      <span className="text-[10px]">
                        {hasSelection ? `${countWords(selectionText)} words selected` : 'Select text in the editor'}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={target === 'document'}
                      onClick={() => setTarget('document')}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-left text-xs transition-colors',
                        target === 'document'
                          ? 'border-violet bg-violet-soft/60 text-ink'
                          : 'border-line text-muted hover:border-line-strong',
                      )}
                    >
                      <span className="block font-semibold">Whole document</span>
                      <span className="text-[10px]">
                        {countWords(documentText)} words · formatting simplifies
                      </span>
                    </button>
                  </div>
                </fieldset>

                <Button
                  className="w-full"
                  loading={running}
                  icon={<ToolIcon tool={activeTool} />}
                  onClick={run}
                >
                  {running ? 'Processing…' : `Run ${TOOL_LABELS[activeTool]}`}
                </Button>

                {error ? (
                  <p role="alert" className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-xs text-clay">
                    {error}
                  </p>
                ) : null}
              </div>

              {/* Processing */}
              {running ? (
                <div className="mt-5 rounded-xl border border-line bg-sand/50 p-4" aria-live="polite">
                  <div className="flex items-center gap-2.5 text-sm text-muted">
                    <Wand2 className="size-4 animate-pulse text-violet" aria-hidden />
                    Demo engine working
                    <span className="flex gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="size-1.5 rounded-full bg-violet"
                          animate={{ opacity: [0.25, 1, 0.25] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="skeleton h-3 w-11/12" />
                    <div className="skeleton h-3 w-9/12" />
                    <div className="skeleton h-3 w-10/12" />
                  </div>
                </div>
              ) : null}

              {/* Result */}
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5"
                  aria-live="polite"
                >
                  <div className="rounded-xl border border-violet/30 bg-violet-soft/40 p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-deep">
                      <Info className="size-3.5" aria-hidden />
                      Simulated result — rule-based demo engine, not a real AI model
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl border border-line">
                    <div className="border-b border-line bg-sand/50 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      {result.kind === 'transform' ? 'Proposed text' : 'Generated content'}
                      {result.kind === 'transform' ? (
                        <span className="ml-2 normal-case tracking-normal text-muted">
                          {countWords(inputText)} → {countWords(result.output)} words
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        'prose-editor max-h-72 overflow-y-auto px-4 py-3.5 text-sm',
                        result.kind === 'transform' && '!font-sans',
                      )}
                      dangerouslySetInnerHTML={{
                        __html:
                          result.kind === 'transform'
                            ? result.output
                                .split(/\n{2,}/)
                                .map((p) => `<p>${p}</p>`)
                                .join('')
                            : result.output,
                      }}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-line bg-paper p-3.5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      What changed
                    </p>
                    <ResultNotes notes={result.notes} />
                  </div>

                  <div className="mt-4 flex gap-2.5">
                    <Button
                      variant="ghost"
                      icon={<ClipboardCopy className="size-4" />}
                      onClick={() => {
                        void navigator.clipboard.writeText(result.output.replace(/<[^>]+>/g, ' '))
                      }}
                    >
                      Copy
                    </Button>
                    <Button className="flex-1" onClick={() => onApply(result)}>
                      {result.kind === 'transform' ? 'Apply to document' : 'Insert at cursor'}
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
