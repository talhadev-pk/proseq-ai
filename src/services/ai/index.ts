/**
 * ProseQ AI — demonstration AI engine.
 *
 * IMPORTANT: This is a rule-based local engine. It does NOT call any external
 * model or API. Every result it produces must be presented to the user as a
 * simulated demonstration.
 *
 * The `AIProvider` interface below is the seam where a real backend can be
 * integrated later (e.g. an `HttpAIProvider` that POSTs to /api/ai/run).
 * The rest of the app only depends on the interface, never on this file.
 */
import type { AIRunContext, AIResult, BrandVoice, ToneId, ToolId } from '@/types'
import { countWords, seededPick } from '@/lib/utils'
import {
  CONTRACTIONS,
  FILLER_WORDS,
  HEDGES,
  IDEA_ANGLES,
  PARAPHRASE_THESAURUS,
  SPELLING_FIXES,
  TONE_LEXICON,
  TRANSITION_OPENERS,
  WORDY_PHRASES,
} from './rules'
import { extractiveSummary, keywords, splitSentences, titleCase } from './text'

export interface AIRunRequest {
  tool: ToolId
  input: string
  tone?: ToneId
  context?: AIRunContext
}

export interface AIProvider {
  /** Stable provider id, surfaced in the UI so users know what ran. */
  id: string
  /** Human label, e.g. "Local demo engine (rule-based)". */
  label: string
  run(req: AIRunRequest): Promise<AIResult>
}

/* --- shared helpers ------------------------------------------------------- */

function preserveCase(word: string, replacement: string): string {
  if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applyWordMap(text: string, map: Record<string, string>): { text: string; swaps: number } {
  let swaps = 0
  let out = text
  // Multi-word lexicon entries first (e.g. "in conclusion").
  for (const [phrase, replacement] of Object.entries(map)) {
    if (!phrase.includes(' ')) continue
    const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi')
    out = out.replace(re, () => {
      swaps++
      return replacement
    })
  }
  // Then single-word swaps, case-preserving.
  const singles = Object.fromEntries(Object.entries(map).filter(([k]) => !k.includes(' ')))
  out = out.replace(/\b[\w']+\b/g, (word) => {
    const replacement = singles[word.toLowerCase()]
    if (!replacement) return word
    swaps++
    return preserveCase(word, replacement)
  })
  return { text: out, swaps }
}

function removeFillers(text: string): { text: string; removed: number } {
  let removed = 0
  let out = text
  for (const w of FILLER_WORDS) {
    const re = new RegExp(`\\b${w}\\b\\s*`, 'gi')
    out = out.replace(re, () => {
      removed++
      return ''
    })
  }
  return { text: out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?;:])/g, '$1'), removed }
}

function tightenPhrases(text: string): { text: string; swaps: number } {
  let swaps = 0
  let out = text
  for (const [re, replacement] of WORDY_PHRASES) {
    out = out.replace(re, () => {
      swaps++
      return replacement
    })
  }
  return { text: out, swaps }
}

function applyContractions(text: string): { text: string; swaps: number } {
  let swaps = 0
  let out = text
  for (const [re, long] of CONTRACTIONS) {
    out = out.replace(re, () => {
      swaps++
      return long
    })
  }
  return { text: out, swaps }
}

function capitalizeSentences(text: string): { text: string; changes: number } {
  let changes = 0
  const out = text.replace(/(^|[.!?]\s+|\n)([a-z])/g, (_m, pre: string, ch: string) => {
    changes++
    return pre + ch.toUpperCase()
  })
  return { text: out, changes }
}

function paragraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
}

function toHtml(text: string): string {
  return paragraphs(text)
    .map((p) => `<p>${p}</p>`)
    .join('')
}

function ensureTrailingPeriod(text: string): string {
  const t = text.trimEnd()
  if (!t) return t
  return /[.!?…"'）)]$/.test(t) ? t : t + '.'
}

/* --- individual tools ------------------------------------------------------ */

function runGrammar(input: string): AIResult {
  const notes: string[] = []
  let text = input

  // 1. Spelling fixes (case-preserving)
  let spellingFixes = 0
  text = text.replace(/\b[\w']+\b/g, (word) => {
    const fix = SPELLING_FIXES[word.toLowerCase()]
    if (!fix) return word
    spellingFixes++
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return fix.charAt(0).toUpperCase() + fix.slice(1)
    }
    return fix
  })
  if (spellingFixes) notes.push(`Corrected ${spellingFixes} misspelled word${spellingFixes > 1 ? 's' : ''}`)

  // 2. Spacing around punctuation
  text = text
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,.!?;:])(?=[A-Za-z])/g, '$1 ')
    .replace(/ {2,}/g, ' ')

  // 3. Subject–verb agreement basics
  for (const [re, rep] of [
    [/\b(they|we|you) was\b/gi, '$1 were'],
    [/\b(they|we|you) doesn't\b/gi, "$1 don't"],
    [/\bthere is many\b/gi, 'there are many'],
    [/\bthese is\b/gi, 'these are'],
    [/\bhe don't\b/gi, "he doesn't"],
    [/\bshe don't\b/gi, "she doesn't"],
    [/\bit don't\b/gi, "it doesn't"],
    [/\ba apple\b/gi, 'an apple'],
  ] as const) {
    text = text.replace(re, rep)
  }

  // 4. Standalone "i" → "I"
  const iFixes = (text.match(/\bi\b/g) ?? []).length
  text = text.replace(/\bi\b/g, 'I')
  if (iFixes) notes.push(`Capitalized ${iFixes} standalone "i"`)

  // 5. Sentence capitalization
  const cap = capitalizeSentences(text)
  text = cap.text
  if (cap.changes) notes.push(`Capitalized ${cap.changes} sentence${cap.changes > 1 ? 's' : ''}`)

  notes.push('Normalized spacing around punctuation')
  return { output: text.trim(), notes, kind: 'transform' }
}

function runImprove(input: string, voice?: BrandVoice | null): AIResult {
  const notes: string[] = []
  const fillers = removeFillers(input)
  let text = fillers.text
  if (fillers.removed) notes.push(`Removed ${fillers.removed} filler word${fillers.removed > 1 ? 's' : ''}`)

  const tightened = tightenPhrases(text)
  text = tightened.text
  if (tightened.swaps) notes.push(`Tightened ${tightened.swaps} wordy phrase${tightened.swaps > 1 ? 's' : ''}`)

  const cap = capitalizeSentences(text)
  text = cap.text

  // Brand-voice awareness: swap "words to avoid" for "words to use".
  if (voice && voice.wordsToAvoid.length > 0) {
    let swaps = 0
    for (const bad of voice.wordsToAvoid) {
      if (!bad.trim()) continue
      const replacement = voice.wordsToUse[swaps % Math.max(1, voice.wordsToUse.length)] ?? 'a clearer term'
      const re = new RegExp(`\\b${bad.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      text = text.replace(re, () => {
        swaps++
        return replacement
      })
    }
    if (swaps) notes.push(`Applied your “${voice.name}” voice: replaced ${swaps} word${swaps > 1 ? 's' : ''} to avoid`)
  }

  text = paragraphs(text)
    .map(ensureTrailingPeriod)
    .join('\n\n')
  if (cap.changes) notes.push(`Capitalized ${cap.changes} sentence${cap.changes > 1 ? 's' : ''}`)
  return { output: text, notes, kind: 'transform' }
}

function runTone(input: string, tone: ToneId): AIResult {
  const notes: string[] = []
  let text = input

  // Formal & academic expand contractions; friendly contracts nothing extra.
  if (tone === 'formal' || tone === 'academic' || tone === 'professional') {
    const c = applyContractions(text)
    text = c.text
    if (c.swaps) notes.push(`Expanded ${c.swaps} contraction${c.swaps > 1 ? 's' : ''}`)
  }

  const lex = TONE_LEXICON[tone]
  const mapped = applyWordMap(text, lex)
  text = mapped.text
  if (mapped.swaps) notes.push(`Swapped ${mapped.swaps} word choice${mapped.swaps > 1 ? 's' : ''} toward a ${tone} register`)

  if (tone === 'confident' || tone === 'concise' || tone === 'professional') {
    let hedged = 0
    for (const re of HEDGES) {
      text = text.replace(re, () => {
        hedged++
        return ''
      })
    }
    text = text.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?;:])/g, '$1')
    if (hedged) notes.push(`Removed ${hedged} hedging phrase${hedged > 1 ? 's' : ''}`)
  }

  if (tone === 'concise') {
    const t = tightenPhrases(text)
    text = t.text
    if (t.swaps) notes.push(`Tightened ${t.swaps} wordy phrase${t.swaps > 1 ? 's' : ''}`)
    const f = removeFillers(text)
    text = f.text
    if (f.removed) notes.push(`Cut ${f.removed} filler word${f.removed > 1 ? 's' : ''}`)
  }

  if (tone === 'friendly') {
    text = text.replace(/!/g, '.').replace(/\bHello,\s*/gi, 'Hi! ')
    notes.push('Kept the register warm and direct')
  } else if (tone === 'persuasive') {
    text = text.replace(/\.\s*$/, '.') + ''
    notes.push('Strengthened benefit-oriented word choices')
  } else if (tone === 'academic') {
    text = text.replace(/!/g, '.')
    notes.push('Removed exclamation marks for an even register')
  }

  if (tone === 'formal' || tone === 'academic' || tone === 'professional') {
    text = text.replace(/!/g, '.')
  }

  const cap = capitalizeSentences(text)
  text = cap.text
  return { output: paragraphs(text).map(ensureTrailingPeriod).join('\n\n'), notes, kind: 'transform' }
}

function runSummarize(input: string): AIResult {
  const { summary, kept, total } = extractiveSummary(input)
  const before = countWords(input)
  const after = countWords(summary)
  const notes = [
    `Kept ${kept} of ${total} sentences`,
    `Reduced length by ~${before === 0 ? 0 : Math.max(1, Math.round(((before - after) / before) * 100))}% (${before} → ${after} words)`,
    'Extractive method: the highest-scoring original sentences, in original order',
  ]
  return { output: summary, notes, kind: 'transform' }
}

function runShorten(input: string): AIResult {
  const notes: string[] = []
  const fillers = removeFillers(input)
  let text = fillers.text
  if (fillers.removed) notes.push(`Removed ${fillers.removed} filler word${fillers.removed > 1 ? 's' : ''}`)
  const tightened = tightenPhrases(text)
  text = tightened.text
  if (tightened.swaps) notes.push(`Tightened ${tightened.swaps} wordy phrase${tightened.swaps > 1 ? 's' : ''}`)
  // Drop redundant "that"
  text = text.replace(/\b(that)\s+(?=\w+\s+(is|was|are|were|has|have|can|will|should)\b)/gi, '')
  const before = countWords(input)
  const after = countWords(text)
  notes.push(`Length: ${before} → ${after} words`)
  return { output: paragraphs(text).map(ensureTrailingPeriod).join('\n\n'), notes, kind: 'transform' }
}

function runExpand(input: string): AIResult {
  const kws = keywords(input, 10)
  const subject = kws[0] ?? 'this idea'
  const angle = kws[1] ?? 'the details'
  const additions = [
    `In practice, this means ${subject} directly shapes how the rest of the plan comes together — worth pausing on before moving ahead.`,
    `The detail that matters here is ${angle}: it is usually where the difference between a rushed draft and a considered one becomes obvious.`,
    `A quick test helps: if a reader unfamiliar with ${subject} can follow this paragraph without re-reading it, it is doing its job.`,
  ]
  const sentences = splitSentences(input)
  let si = 0
  const out = sentences.map((s) => {
    const addition = additions[si % additions.length]
    si++
    return si % 2 === 0 ? `${s.text} ${addition}` : s.text
  })
  const before = countWords(input)
  const after = countWords(out.join(' '))
  return {
    output: toHtml(out.join(' ')).replace(/<\/p><p>/g, '</p>\n<p>'),
    notes: [
      'Added an elaboration sentence after alternating sentences',
      `Length: ${before} → ${after} words`,
      'Additions are template-based demonstrations, not model output',
    ],
    kind: 'transform',
  }
}

function runContinue(input: string): AIResult {
  const kws = keywords(input, 6)
  const subject = kws[0] ?? 'this'
  const second = kws[1] ?? 'the next step'
  const seed = input.slice(-64)
  const continuations = [
    `Building on that, ${subject} opens a few directions worth exploring — starting with ${second}, then widening the frame once the foundation feels stable.`,
    `There is also a quieter point underneath all of this: progress on ${subject} rarely comes from one decisive moment, but from the compounding of small, deliberate choices.`,
    `The next sensible move is to take ${second} and give it room on the page — an outline, three rough sentences, anything that turns the abstract into the concrete.`,
  ]
  const chosen = continuations.map((c) => c).join(' ')
  return {
    output: `<p>${chosen}</p>`,
    notes: [
      'Generated three continuation sentences from the topics detected in your text',
      `Detected topics: ${kws.slice(0, 3).join(', ') || '—'}`,
      `Simulated continuation seeded by the last sentence: “${seed.length > 48 ? seed.slice(0, 48) + '…' : seed}”`,
      `Deterministic seed: “${seed}”`,
    ].slice(0, 3),
    kind: 'generate',
  }
}

function runIdeas(input: string): AIResult {
  const kws = keywords(input, 8)
  const topic = titleCase(kws.slice(0, 2).join(' ') || 'your topic')
  const topicShort = kws[0] ?? 'this topic'
  const angles = IDEA_ANGLES.map((a, i) => {
    const filled = a.template.replace(/\{topic\}/g, topic).replace(/\{topic_short\}/g, topicShort)
    return `<p><strong>${i + 1}. ${a.title}</strong> — ${filled}</p>`
  })
  return {
    output: angleListHtml(angles),
    notes: [
      `Derived ${angles.length} content angles from the topic “${topic}”`,
      'Each angle follows a proven editorial format (guide, comparison, checklist…)',
      'Generated locally by rule-based demo logic',
    ],
    kind: 'generate',
  }
}

function angleListHtml(items: string[]): string {
  return items.join('\n')
}

function runOutline(input: string): AIResult {
  const kws = keywords(input, 10)
  const topic = titleCase(kws.slice(0, 2).join(' ') || 'Untitled Topic')
  const sentences = splitSentences(input)
  const sectionCandidates = sentences
    .map((s) => s.text.replace(/^[^A-Za-z]+/, ''))
    .filter((s) => s.length > 30)
    .slice(0, 4)
  const sections = sectionCandidates.map((s, i) => {
    const words = s.split(/\s+/).slice(0, 6).join(' ')
    const heading = titleCase(words.replace(/[.,!?;:]$/, ''))
    return `<h3>${i + 2}. ${heading}</h3><ul><li>Key point one, drawn from: “${s.slice(0, 70)}${s.length > 70 ? '…' : ''}”</li><li>Supporting detail or example</li></ul>`
  })
  const html = [
    `<h1>${topic}</h1>`,
    '<h2>1. Introduction</h2><ul><li>Why this topic matters now</li><li>What the reader will take away</li></ul>',
    ...sections,
    `<h2>${sectionCandidates.length + 2}. Conclusion</h2><ul><li>Recap the core argument</li><li>Suggested next step for the reader</li></ul>`,
  ].join('\n')
  return {
    output: html,
    notes: [
      `Built a ${sectionCandidates.length + 2}-section outline`,
      `Topic detected: “${topic}”`,
      'Section names derive from your strongest sentences',
    ],
    kind: 'generate',
  }
}

function runRewrite(input: string, voice?: BrandVoice | null): AIResult {
  const notes: string[] = []
  const sentences = splitSentences(input)
  const rewritten = sentences.map((s, i) => {
    let t = s.text
    // Paraphrase via thesaurus, preserving case of first letter.
    let swaps = 0
    t = t.replace(/\b[\w']+\b/g, (word) => {
      const syn = PARAPHRASE_THESAURUS[word.toLowerCase()]
      if (!syn) return word
      swaps++
      if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
        return syn.charAt(0).toUpperCase() + syn.slice(1)
      }
      return syn
    })
    if (i === 1 && swaps === 0 && t.length > 20) {
      t = `${seededPick(TRANSITION_OPENERS, t)} ${t.charAt(0).toLowerCase()}${t.slice(1)}`
    }
    return ensureTrailingPeriod(t)
  })
  let text = rewritten.join(' ')
  if (voice && voice.wordsToAvoid.length) {
    let swaps = 0
    for (const bad of voice.wordsToAvoid) {
      if (!bad.trim()) continue
      const replacement = voice.wordsToUse[swaps % Math.max(1, voice.wordsToUse.length)] ?? 'a clearer term'
      const re = new RegExp(`\\b${bad.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      text = text.replace(re, () => {
        swaps++
        return replacement
      })
    }
    if (swaps) notes.push(`Applied “${voice.name}” voice: ${swaps} avoided word${swaps > 1 ? 's' : ''} replaced`)
  }
  const before = countWords(input)
  const after = countWords(text)
  notes.unshift(`Paraphrased ${sentences.length} sentence${sentences.length > 1 ? 's' : ''} (${before} → ${after} words)`)
  return { output: text, notes, kind: 'transform' }
}

/* --- provider ------------------------------------------------------------- */

const SIMULATED_LATENCY = [420, 700, 950]

export const demoAIProvider: AIProvider = {
  id: 'demo-local-rules',
  label: 'Local demo engine (rule-based, simulated)',
  async run(req: AIRunRequest): Promise<AIResult> {
    const delay = SIMULATED_LATENCY[Math.floor(Math.random() * SIMULATED_LATENCY.length)] ?? 600
    await new Promise((r) => setTimeout(r, delay))
    const voice = req.context?.voice ?? null
    const input = req.input.trim()
    if (!input) {
      return {
        output: '',
        notes: ['Nothing to work with — write or select some text first.'],
        kind: 'transform',
      }
    }
    switch (req.tool) {
      case 'grammar':
        return runGrammar(input)
      case 'improve':
        return runImprove(input, voice)
      case 'tone':
        return runTone(input, req.tone ?? 'professional')
      case 'summarize':
        return runSummarize(input)
      case 'expand':
        return runExpand(input)
      case 'shorten':
        return runShorten(input)
      case 'continue':
        return runContinue(input)
      case 'ideas':
        return runIdeas(input)
      case 'outline':
        return runOutline(input)
      case 'rewrite':
        return runRewrite(input, voice)
      default:
        return { output: input, notes: ['Unknown tool.'], kind: 'transform' }
    }
  },
}

/**
 * The active provider. Swap this for a real backend adapter when one exists —
 * the whole application talks to this interface only.
 */
export const aiProvider: AIProvider = demoAIProvider

export const TOOL_LABELS: Record<ToolId, string> = {
  improve: 'Improve Writing',
  grammar: 'Fix Grammar',
  tone: 'Change Tone',
  summarize: 'Summarize',
  expand: 'Expand Text',
  shorten: 'Shorten Text',
  continue: 'Continue Writing',
  ideas: 'Generate Ideas',
  outline: 'Create Outline',
  rewrite: 'Rewrite Paragraph',
}

export const TONE_OPTIONS: Array<{ id: ToneId; label: string; hint: string }> = [
  { id: 'professional', label: 'Professional', hint: 'Polished and business-ready' },
  { id: 'friendly', label: 'Friendly', hint: 'Warm, direct, human' },
  { id: 'formal', label: 'Formal', hint: 'Expanded, ceremonial register' },
  { id: 'confident', label: 'Confident', hint: 'Hedges removed, stance strengthened' },
  { id: 'concise', label: 'Concise', hint: 'Tightened to the essentials' },
  { id: 'persuasive', label: 'Persuasive', hint: 'Benefit-oriented, stronger verbs' },
  { id: 'academic', label: 'Academic', hint: 'Measured, precise, evidence-flavored' },
]
