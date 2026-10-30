/** Template library integrity + shared utility tests. */
import { describe, expect, it } from 'vitest'
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplate } from './templates'
import { countWords, readingTime, initialsOf, dateKey } from '@/lib/utils'

describe('template library', () => {
  it('contains at least 24 templates', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(24)
  })

  it('has unique ids', () => {
    const ids = new Set(TEMPLATES.map((t) => t.id))
    expect(ids.size).toBe(TEMPLATES.length)
  })

  it('covers every advertised category with at least 3 templates', () => {
    for (const cat of TEMPLATE_CATEGORIES) {
      const count = TEMPLATES.filter((t) => t.category === cat.id).length
      expect(count, `category ${cat.id}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('every template has a non-empty structure, description, and purpose', () => {
    for (const t of TEMPLATES) {
      expect(t.name.trim().length).toBeGreaterThan(0)
      expect(t.description.trim().length).toBeGreaterThan(10)
      expect(t.structure.trim().length).toBeGreaterThan(40)
    }
  })

  it('structures are valid HTML with headings or paragraphs', () => {
    for (const t of TEMPLATES) {
      expect(t.structure).toMatch(/<(h[123]|p|ul|ol)\b/)
    }
  })

  it('getTemplate resolves by id', () => {
    const first = TEMPLATES[0]
    expect(getTemplate(first.id)?.name).toBe(first.name)
    expect(getTemplate('does-not-exist')).toBeUndefined()
  })
})

describe('text utilities', () => {
  it('counts words correctly', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('one two  three')).toBe(3)
    expect(countWords('  spaced\tout\nwords ')).toBe(3)
  })

  it('estimates reading time', () => {
    expect(readingTime(0)).toBe('0 min read')
    expect(readingTime(150)).toBe('< 1 min read')
    expect(readingTime(600)).toBe('3 min read')
  })

  it('derives initials', () => {
    expect(initialsOf('Talha')).toBe('TA')
    expect(initialsOf('Ayesha Khan')).toBe('AK')
    expect(initialsOf('')).toBe('?')
  })

  it('formats local date keys', () => {
    expect(dateKey(new Date(2026, 9, 5))).toBe('2026-10-05')
  })
})
