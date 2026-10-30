/**
 * Export / import operations for user-owned data.
 * All file downloads are generated locally in the browser — nothing is uploaded.
 */
import { z } from 'zod'
import type { BrandVoice, ExportPayload, PlannerEntry, Profile, StoredDocument } from '@/types'
import { htmlToPlainText } from '@/lib/utils'
import { htmlToMarkdown } from '@/lib/markdown'
import { safeFilename } from '@/lib/utils'

/** Trigger a client-side file download. */
export function downloadFile(filename: string, content: string | Blob, mime = 'text/plain'): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: `${mime};charset=utf-8` }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function exportDocumentAsTxt(doc: StoredDocument): void {
  const text = `${doc.title}\n${'='.repeat(Math.min(60, Math.max(3, doc.title.length)))}\n\n${htmlToPlainText(doc.content)}\n`
  downloadFile(`${safeFilename(doc.title)}.txt`, text)
}

export function exportDocumentAsMarkdown(doc: StoredDocument): void {
  const md = `# ${doc.title}\n\n${htmlToMarkdown(doc.content)}\n`
  downloadFile(`${safeFilename(doc.title)}.md`, md, 'text/markdown')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/* --- Library export / import ---------------------------------------------- */

const isoDate = z.string()

const documentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  category: z.enum([
    'business',
    'marketing',
    'education',
    'communication',
    'creative',
    'social',
    'blogging',
    'notes',
  ]),
  favorite: z.boolean(),
  wordCount: z.number(),
  createdAt: isoDate,
  updatedAt: isoDate,
})

const brandVoiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  tone: z.enum(['professional', 'friendly', 'formal', 'confident', 'concise', 'persuasive', 'academic']),
  audience: z.string(),
  preferences: z.string(),
  wordsToUse: z.array(z.string()),
  wordsToAvoid: z.array(z.string()),
  active: z.boolean(),
  createdAt: isoDate,
  updatedAt: isoDate,
})

const plannerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string(),
  status: z.enum(['draft', 'planned', 'published']),
  notes: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
})

const profileSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  createdAt: isoDate,
  updatedAt: isoDate,
})

export const exportPayloadSchema = z.object({
  app: z.literal('proseq-ai'),
  schemaVersion: z.literal(1),
  exportedAt: isoDate,
  profile: profileSchema,
  preferences: z.object({ theme: z.string(), editor: z.object({}).passthrough() }),
  documents: z.array(documentSchema),
  brandVoices: z.array(brandVoiceSchema),
  planner: z.array(plannerSchema),
})

export type ValidatedPayload = z.infer<typeof exportPayloadSchema>

/** Parse + validate an import file. Returns a typed result — never throws. */
export function validateImport(raw: string): { ok: true; payload: ValidatedPayload } | { ok: false; error: string } {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
  const parsed = exportPayloadSchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: `The backup does not match the ProseQ AI schema${first ? ` (problem at: ${first.path.join(' → ') || 'root'})` : ''}.`,
    }
  }
  return { ok: true, payload: parsed.data }
}

export function buildExportPayload(args: {
  profile: Profile
  preferences: unknown
  documents: StoredDocument[]
  brandVoices: BrandVoice[]
  planner: PlannerEntry[]
}): ExportPayload {
  return {
    app: 'proseq-ai',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: args.profile,
    preferences: args.preferences as ExportPayload['preferences'],
    documents: args.documents,
    brandVoices: args.brandVoices,
    planner: args.planner,
  }
}

export function exportLibraryJson(payload: ExportPayload): void {
  downloadFile(
    `proseq-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}
