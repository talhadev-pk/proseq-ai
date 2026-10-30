/** Tests for export/import: validation, markdown conversion, safe filenames. */
import { describe, expect, it } from 'vitest'
import { validateImport } from './export'
import { htmlToMarkdown } from '@/lib/markdown'
import { safeFilename } from '@/lib/utils'
import type { ExportPayload } from '@/types'

function samplePayload(): ExportPayload {
  const now = new Date().toISOString()
  return {
    app: 'proseq-ai',
    schemaVersion: 1,
    exportedAt: now,
    profile: { displayName: 'Talha', email: 'talhamalikawan@example.com', createdAt: now, updatedAt: now },
    preferences: { theme: 'system', editor: { fontSize: 17, width: 'comfortable', spellcheck: true, autosave: true } },
    documents: [
      {
        id: 'doc_1',
        title: 'Sample',
        content: '<p>Hello</p>',
        category: 'notes',
        favorite: false,
        wordCount: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
    brandVoices: [],
    planner: [],
  }
}

describe('import validation', () => {
  it('accepts a valid payload', () => {
    const res = validateImport(JSON.stringify(samplePayload()))
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.payload.documents).toHaveLength(1)
      expect(res.payload.profile.displayName).toBe('Talha')
    }
  })

  it('rejects broken JSON', () => {
    const res = validateImport('{ not json')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/not valid JSON/i)
  })

  it('rejects a payload from a different app', () => {
    const payload = samplePayload() as unknown as Record<string, unknown>
    payload.app = 'other-app'
    const res = validateImport(JSON.stringify(payload))
    expect(res.ok).toBe(false)
  })

  it('rejects a wrong schema version', () => {
    const payload = samplePayload() as unknown as Record<string, unknown>
    payload.schemaVersion = 99
    const res = validateImport(JSON.stringify(payload))
    expect(res.ok).toBe(false)
  })

  it('rejects a payload with an invalid email in the profile', () => {
    const payload = samplePayload()
    payload.profile.email = 'not-an-email'
    const res = validateImport(JSON.stringify(payload))
    expect(res.ok).toBe(false)
  })

  it('rejects a payload with malformed planner dates', () => {
    const payload = samplePayload()
    payload.planner = [
      {
        id: 'p1',
        title: 'X',
        date: 'not-a-date',
        category: 'blogging',
        status: 'draft',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    const res = validateImport(JSON.stringify(payload))
    expect(res.ok).toBe(false)
  })
})

describe('markdown conversion', () => {
  it('converts headings, bold, and lists', () => {
    const md = htmlToMarkdown(
      '<h1>Title</h1><p>A <strong>bold</strong> and <em>italic</em> line.</p><ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol><blockquote>A quote</blockquote>',
    )
    expect(md).toContain('# Title')
    expect(md).toContain('**bold**')
    expect(md).toContain('*italic*')
    expect(md).toContain('- one')
    expect(md).toContain('- two')
    expect(md).toContain('1. first')
    expect(md).toContain('2. second')
    expect(md).toContain('> A quote')
  })

  it('handles nested lists', () => {
    const md = htmlToMarkdown('<ul><li>parent<ul><li>child</li></ul></li></ul>')
    expect(md).toContain('- parent')
    expect(md).toContain('  - child')
  })
})

describe('safe filenames', () => {
  it('strips unsafe characters', () => {
    expect(safeFilename('My/Doc: "Q4" <plan>?')).not.toMatch(/[/:"<>?]/)
  })

  it('collapses whitespace into dashes', () => {
    expect(safeFilename('Q4 launch   announcement')).toBe('Q4-launch-announcement')
  })

  it('falls back when nothing remains', () => {
    expect(safeFilename('!!!')).toBe('untitled')
  })
})
