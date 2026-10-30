/**
 * First-run demonstration data.
 *
 * IMPORTANT: Seeds are only applied when the meta record shows the app has
 * never initialized (see store/bootstrap.ts). They are NEVER written over
 * existing user data on refresh.
 */
import type { ActivityItem, BrandVoice, PlannerEntry, StoredDocument } from '@/types'
import { countWords, dateKey, uid } from '@/lib/utils'

const daysAgo = (n: number, hour = 10): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 24, 0, 0)
  return d.toISOString()
}

const daysAhead = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

export function seedDocuments(): StoredDocument[] {
  const docs: Array<Omit<StoredDocument, 'wordCount'>> = [
    {
      id: uid('doc'),
      title: 'Q4 Launch Announcement — Draft',
      category: 'business',
      favorite: true,
      content: `<h1>Q4 Launch Announcement</h1>
<p>Later this quarter we will be releasing the biggest update in our product's history. This document collects the messaging we will use across channels.</p>
<h2>The headline</h2>
<p>One sentence, no jargon: <strong>everything you write, in one calm workspace.</strong></p>
<h2>Why now</h2>
<p>Our users told us the same thing three different ways: they love the editor, but their writing lives in too many places. This release brings documents, planning, and brand voice under one roof.</p>
<h2>What ships</h2>
<ul><li>The unified writing workspace</li><li>Tone controls for every selection</li><li>A content planner with statuses</li></ul>
<blockquote>If the announcement does one thing, it must make a busy reader curious enough to click.</blockquote>`,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1, 16),
    },
    {
      id: uid('doc'),
      title: 'Onboarding Email Sequence',
      category: 'communication',
      favorite: false,
      content: `<h1>Onboarding Email Sequence</h1>
<h2>Email 1 — Welcome (Day 0)</h2>
<p>Hi there, and welcome. You signed up to write with intention — this short sequence shows you the three features that make the biggest difference in the first week.</p>
<h2>Email 2 — The editor (Day 2)</h2>
<p>Most tools make you choose between power and calm. Show, do not tell: one screenshot, one tip, one link.</p>
<h2>Email 3 — Templates (Day 5)</h2>
<p>Nobody starts from a blank page every day. Point to the template library and pick a favorite for their use case.</p>
<h2>Email 4 — Planning (Day 8)</h2>
<p>Writers do not just write; they plan. Introduce the planner gently and end with a question that invites a reply.</p>`,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(3, 11),
    },
    {
      id: uid('doc'),
      title: 'The Quiet Craft of Revision — Blog Draft',
      category: 'blogging',
      favorite: true,
      content: `<h1>The Quiet Craft of Revision</h1>
<p>Everyone romanticizes the first draft. Almost nobody talks about the fourth.</p>
<p>Revision is where writing actually happens. The draft exists so you have something to disagree with. The edit exists so your reader never has to.</p>
<h2>Read it aloud</h2>
<p>Your ear catches what your eye forgives. A sentence you cannot say in one breath is a sentence your reader will not finish.</p>
<h2>Cut the first paragraph</h2>
<p>Most drafts warm up on the page. Delete the warm-up. Start where the thinking starts.</p>
<h2>One idea per sentence</h2>
<p>Not because readers are simple — because clarity is a form of respect.</p>`,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(7, 15),
    },
    {
      id: uid('doc'),
      title: 'Product Sync — Meeting Notes',
      category: 'notes',
      favorite: false,
      content: `<h1>Product Sync — Notes</h1>
<p><strong>Attendees:</strong> Product, Design, Support · <strong>Duration:</strong> 40 minutes</p>
<h2>Decisions</h2>
<ol><li>The templates page ships with category filters in the first release.</li><li>Autosave interval moves from 5s to 1.5s of inactivity.</li></ol>
<h2>Action items</h2>
<ul><li>Spec the planner calendar — <strong>Design</strong> — Friday</li><li>Audit editor keyboard shortcuts — <strong>Product</strong> — next week</li></ul>
<h2>Open questions</h2>
<p>Do we need offline support before or after the public launch?</p>`,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2, 18),
    },
  ]
  return docs.map((d) => ({ ...d, wordCount: countWords(d.content.replace(/<[^>]+>/g, ' ')) }))
}

export function seedBrandVoices(): BrandVoice[] {
  return [
    {
      id: uid('voice'),
      name: 'Clear & Confident',
      description:
        'The default demonstration voice. Says what it means in the fewest words that still sound human.',
      tone: 'professional',
      audience: 'Busy professionals who skim once and decide',
      preferences: 'Short sentences. Concrete nouns. No hype, no exclamation marks. Lead with the useful part.',
      wordsToUse: ['clear', 'direct', 'useful', 'considered', 'practical'],
      wordsToAvoid: ['synergy', 'leverage', 'revolutionary', 'game-changing'],
      active: true,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  ]
}

export function seedPlannerEntries(): PlannerEntry[] {
  const mk = (n: number, title: string, category: PlannerEntry['category'], status: PlannerEntry['status'], notes: string): PlannerEntry => ({
    id: uid('plan'),
    title,
    date: dateKey(new Date(daysAhead(n))),
    category,
    status,
    notes,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  })
  return [
    mk(0, 'Launch announcement post', 'marketing', 'planned', 'Coordinate with the product blog draft.'),
    mk(3, 'Newsletter #14 — "Revision week"', 'marketing', 'draft', 'Pull from the revision blog post.'),
    mk(7, 'LinkedIn: writing workspace lessons', 'social', 'planned', 'Three lessons, one per paragraph.'),
    mk(12, 'Case study outline — solo consultant', 'blogging', 'draft', 'Illustrative persona; clearly label it.'),
    mk(-2, 'Template library tour', 'blogging', 'published', 'Published with screenshots.'),
  ]
}

export function seedActivity(): ActivityItem[] {
  const items: Array<[ActivityItem['type'], string, number]> = [
    ['document-saved', 'Saved “Q4 Launch Announcement — Draft”', 1],
    ['template-applied', 'Applied the Marketing Campaign Brief template', 3],
    ['document-created', 'Created “Product Sync — Meeting Notes”', 2],
    ['version-restored', 'Restored an earlier version of the blog draft', 7],
    ['settings-changed', 'Switched editor to comfortable width', 9],
    ['planner-updated', 'Marked “Template library tour” as published', 2],
  ]
  return items.map(([type, message, days]) => ({
    id: uid('act'),
    type,
    message,
    at: daysAgo(days, 14),
  }))
}

/**
 * Illustrative writing activity for the overview chart (words per day).
 * Clearly labeled as demo data in the UI — never presented as real usage.
 */
export function seedWritingActivity(): Array<{ day: string; words: number }> {
  const base = [420, 380, 610, 240, 700, 150, 90, 530, 460, 320, 680, 410, 260, 520]
  const out: Array<{ day: string; words: number }> = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({ day: dateKey(d), words: base[13 - i] ?? 0 })
  }
  return out
}
