/** Text-analysis primitives shared by the demo AI tools. */
import { STOPWORDS } from './rules'

export interface Sentence {
  text: string
  start: number
  end: number
}

/** Split text into sentences, preserving offsets so output can stay ordered. */
export function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = []
  const re = /[^.!?\n]+[.!?]*[\s]*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const raw = m[0]
    if (raw.trim().length === 0) continue
    out.push({ text: raw.trim(), start: m.index, end: m.index + raw.length })
    if (re.lastIndex === m.index) re.lastIndex++ // safety against zero-length matches
  }
  return out
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** Content words ranked by frequency (stopwords removed). */
export function keywords(text: string, limit = 8): string[] {
  const tokens = tokenize(text).filter((t) => !STOPWORDS.has(t) && t.length > 2)
  const freq = new Map<string, number>()
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1)
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w)
}

/** Frequency-based extractive summary: keeps the highest-scoring sentences. */
export function extractiveSummary(text: string, ratio = 0.35): { summary: string; kept: number; total: number } {
  const sentences = splitSentences(text)
  if (sentences.length <= 2) {
    return { summary: text.trim(), kept: sentences.length, total: sentences.length }
  }
  const freq = new Map<string, number>()
  for (const t of tokenize(text)) {
    if (!STOPWORDS.has(t) && t.length > 2) freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  const scored = sentences.map((s, i) => {
    const words = tokenize(s.text).filter((t) => !STOPWORDS.has(t) && t.length > 2)
    const score = words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / Math.sqrt(words.length || 1)
    return { i, score, first: i === 0 }
  })
  // Always keep the opening sentence; boost it as an anchor.
  const withBoost = scored.map((s) => ({ ...s, score: s.first ? s.score * 1.35 : s.score }))
  const keepCount = Math.max(1, Math.round(sentences.length * ratio))
  const keep = new Set(
    withBoost
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, keepCount)
      .map((s) => s.i),
  )
  const summary = sentences
    .filter((_, i) => keep.has(i))
    .map((s) => s.text)
    .join(' ')
  return { summary, kept: keep.size, total: sentences.length }
}

/** Title-case a short phrase for outline headings. */
export function titleCase(s: string): string {
  const small = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'at', 'by'])
  return s
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
