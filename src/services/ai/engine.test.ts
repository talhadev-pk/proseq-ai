/** Tests for the rule-based demonstration AI engine. */
import { describe, expect, it } from 'vitest'
import { demoAIProvider } from './index'
import { countWords } from '@/lib/utils'

const run = (
  tool: Parameters<typeof demoAIProvider.run>[0]['tool'],
  input: string,
  tone?: 'formal' | 'friendly',
) => demoAIProvider.run({ tool, input, tone })

describe('Fix Grammar (demo)', () => {
  it('fixes common misspellings case-preservingly', async () => {
    const res = await run('grammar', 'we recieved teh report')
    expect(res.output).toContain('received')
    expect(res.output).toContain('the report')
  })

  it('capitalizes standalone i and sentence starts', async () => {
    const res = await run('grammar', "i think this is fine. it works")
    expect(res.output.startsWith('I think')).toBe(true)
    expect(res.output).toContain('. It works')
  })

  it('normalizes spacing around punctuation', async () => {
    const res = await run('grammar', 'hello ,world.this is a test')
    expect(res.output).not.toContain(' ,')
    expect(res.output).toContain(', world. This')
  })

  it('fixes basic agreement slips', async () => {
    const res = await run('grammar', 'They was late')
    expect(res.output).toContain('They were')
  })
})

describe('Summarize (demo)', () => {
  it('keeps fewer sentences and only original text', async () => {
    const text =
      'Writing is rewriting. The first draft exists to be disagreed with. Revision is where clarity is earned. ' +
      'Most sentences can lose a third of their words. Reading aloud catches what the eye forgives. ' +
      'A paragraph should do one job well. The conclusion earns its place by adding, not repeating.'
    const res = await run('summarize', text)
    expect(countWords(res.output)).toBeLessThan(countWords(text))
    for (const sentence of res.output.split(/(?<=\.)\s+/)) {
      expect(text).toContain(sentence.trim().replace(/\.$/, ''))
    }
  })

  it('returns short text unchanged', async () => {
    const res = await run('summarize', 'Only one sentence here.')
    expect(res.output).toBe('Only one sentence here.')
  })
})

describe('Tone (demo)', () => {
  it('formal expands contractions', async () => {
    const res = await run('tone', "We don't think it's ready", 'formal')
    expect(res.output).toContain('do not')
    expect(res.output).toContain('it is')
  })

  it('confident removes hedges', async () => {
    const res = await run('tone', 'I think maybe this could possibly work')
    expect(res.output).not.toContain('I think')
    expect(res.output).not.toContain('maybe')
    expect(res.output).not.toContain('possibly')
  })

  it('friendly relaxes formal vocabulary', async () => {
    const res = await run('tone', 'We utilize this to assist customers.', 'friendly')
    expect(res.output).toContain('use')
    expect(res.output).toContain('help')
  })
})

describe('Shorten / Improve (demo)', () => {
  it('shorten removes filler words', async () => {
    const res = await run('shorten', 'This is very really quite basically a long sentence.')
    expect(res.output).not.toContain('very')
    expect(res.output).not.toContain('basically')
    expect(countWords(res.output)).toBeLessThan(countWords('This is very really quite basically a long sentence.'))
  })

  it('improve tightens wordy phrases', async () => {
    const res = await run('improve', 'In order to proceed, we need to make a decision.')
    expect(res.output).toContain('To proceed')
    expect(res.output).toContain('decide')
  })

  it('improve respects brand voice words to avoid', async () => {
    const res = await demoAIProvider.run({
      tool: 'improve',
      input: 'This synergy will leverage our growth.',
      context: {
        voice: {
          id: 'v1',
          name: 'No Buzzwords',
          description: '',
          tone: 'professional',
          audience: '',
          preferences: '',
          wordsToUse: ['partnership'],
          wordsToAvoid: ['synergy', 'leverage'],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    })
    expect(res.output).not.toContain('synergy')
    expect(res.notes.some((n) => n.includes('voice'))).toBe(true)
  })
})

describe('Generative tools (demo)', () => {
  it('ideas returns eight angles mentioning the topic', async () => {
    const res = await run('ideas', 'content planning for a small bakery business')
    expect(res.kind).toBe('generate')
    expect((res.output.match(/<p>/g) ?? []).length).toBe(8)
    expect(res.output.toLowerCase()).toContain('bakery')
  })

  it('outline produces headings and lists', async () => {
    const res = await run('outline', 'Remote work changes how teams write and coordinate their projects across time zones.')
    expect(res.output).toContain('<h1>')
    expect(res.output).toContain('<h2>')
    expect(res.output).toContain('<ul>')
  })

  it('continue generates paragraphs seeded by the input', async () => {
    const res = await run('continue', 'The garden needed attention before winter arrived.')
    expect(res.kind).toBe('generate')
    expect(res.output).toContain('<p>')
    expect(res.notes.length).toBeGreaterThan(0)
  })

  it('rewrite paraphrases with different wording', async () => {
    const res = await run('rewrite', 'The big problem was that people did not use the new tool.')
    expect(res.output).not.toBe('The big problem was that people did not use the new tool.')
    expect(res.output.toLowerCase()).toMatch(/substantial|challenge|individuals|apply/)
  })
})

describe('provider honesty', () => {
  it('labels itself as the local demo engine', () => {
    expect(demoAIProvider.id).toBe('demo-local-rules')
    expect(demoAIProvider.label).toMatch(/rule-based/i)
  })

  it('handles empty input gracefully', async () => {
    const res = await run('grammar', '   ')
    expect(res.notes[0]).toMatch(/nothing to work with/i)
  })
})
