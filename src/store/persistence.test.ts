/**
 * CRITICAL persistence tests.
 *
 * These verify the acceptance criteria:
 *  - first-run initialization seeds defaults
 *  - saved edits are never overwritten by defaults on re-initialization
 *  - profile name & email edits survive a simulated page refresh
 *  - documents survive a simulated page refresh
 *
 * A "refresh" is simulated honestly with vi.resetModules() + dynamic imports,
 * so stores re-hydrate from localStorage / IndexedDB exactly as they would
 * when the app boots again.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROFILE, useProfileStore } from './profile'
import { useDocumentsStore } from './documents'
import { useBrandVoiceStore } from './brandVoice'
import { usePlannerStore } from './planner'
import { useActivityStore } from './activity'
import {
  __resetBootstrapForTests,
  bootstrapApplication,
  clearContentData,
  fullResetToDemoDefaults,
} from './bootstrap'
import { STORE_KEYS, storage } from '@/services/storage'
import { db } from '@/services/db'
import type { StoredDocument } from '@/types'

async function freshStorage() {
  localStorage.clear()
  useProfileStore.persist.clearStorage()
  useBrandVoiceStore.persist.clearStorage()
  usePlannerStore.persist.clearStorage()
  useActivityStore.persist.clearStorage()
  __resetBootstrapForTests()
  await db.clearAll()
}

/** Simulate a full page refresh: new module graph, stores re-hydrate. */
async function simulateRefresh() {
  vi.resetModules()
  const mod = await import('./bootstrap')
  await mod.bootstrapApplication()
  return {
    profile: (await import('./profile')).useProfileStore,
    documents: (await import('./documents')).useDocumentsStore,
    brandVoice: (await import('./brandVoice')).useBrandVoiceStore,
    planner: (await import('./planner')).usePlannerStore,
  }
}

describe('first-run initialization', () => {
  beforeEach(async () => {
    await freshStorage()
  })

  it('seeds demo data on the very first run', async () => {
    await bootstrapApplication()
    expect(useDocumentsStore.getState().documents.length).toBeGreaterThanOrEqual(4)
    expect(useDocumentsStore.getState().hydrated).toBe(true)
    expect(useBrandVoiceStore.getState().voices.length).toBeGreaterThanOrEqual(1)
    expect(usePlannerStore.getState().entries.length).toBeGreaterThanOrEqual(3)
    expect(storage.read(STORE_KEYS.meta)).not.toBeNull()
  })

  it('creates the default profile with the required initial values', async () => {
    await bootstrapApplication()
    const profile = useProfileStore.getState().profile
    expect(profile.displayName).toBe('Talha')
    expect(profile.email).toBe('talhamalikawan@example.com')
  })
})

describe('persistence across a simulated refresh (critical requirement)', () => {
  beforeEach(async () => {
    await freshStorage()
  })

  it('keeps a changed display name after refresh', async () => {
    await bootstrapApplication()
    const r1 = useProfileStore.getState().updateProfile({
      displayName: 'Ayesha Khan',
      email: DEFAULT_PROFILE.email,
    })
    expect(r1.ok).toBe(true)

    const after = await simulateRefresh()
    expect(after.profile.getState().profile.displayName).toBe('Ayesha Khan')
  })

  it('keeps a changed email after refresh', async () => {
    await bootstrapApplication()
    useProfileStore.getState().updateProfile({
      displayName: 'Talha',
      email: 'ayesha@example.com',
    })
    const after = await simulateRefresh()
    expect(after.profile.getState().profile.email).toBe('ayesha@example.com')
  })

  it('keeps created documents after refresh (seeds are never re-applied)', async () => {
    await bootstrapApplication()
    const seededCount = useDocumentsStore.getState().documents.length
    const doc = useDocumentsStore.getState().createDocument({ title: 'My important doc' })
    expect(doc).not.toBeNull()

    const after = await simulateRefresh()
    const docs = after.documents.getState().documents
    const found = docs.find((d) => d.id === doc!.id)
    expect(found).toBeDefined()
    expect(found?.title).toBe('My important doc')
    // The demo documents still exist alongside — the seed did NOT overwrite.
    expect(docs.length).toBe(seededCount + 1)
  })

  it('does not resurrect deleted demo documents on refresh', async () => {
    await bootstrapApplication()
    const afterFirst = useDocumentsStore.getState().documents.length
    const doomed = useDocumentsStore.getState().documents[0] as StoredDocument
    useDocumentsStore.getState().deleteDocument(doomed.id)

    const after = await simulateRefresh()
    expect(after.documents.getState().documents.length).toBe(afterFirst - 1)
  })

  it('rejects invalid profile updates', async () => {
    await bootstrapApplication()
    const bad = useProfileStore.getState().updateProfile({ displayName: 'T', email: 'nope' })
    expect(bad.ok).toBe(false)
    expect(useProfileStore.getState().profile.displayName).toBe('Talha')
  })

  it('updates are also visible in raw storage (what a boot reads)', async () => {
    await bootstrapApplication()
    useProfileStore.getState().updateProfile({ displayName: 'Storage Check', email: 'store@example.com' })
    const raw = storage.read<{ state: { profile: { displayName: string; email: string } } }>(STORE_KEYS.profile)
    expect(raw?.state.profile.displayName).toBe('Storage Check')
    expect(raw?.state.profile.email).toBe('store@example.com')
  })
})

describe('data management operations', () => {
  beforeEach(async () => {
    await freshStorage()
  })

  it('clearContentData keeps the profile', async () => {
    await bootstrapApplication()
    useProfileStore.getState().updateProfile({ displayName: 'Kept Name', email: 'kept@example.com' })
    await clearContentData()
    expect(useDocumentsStore.getState().documents).toHaveLength(0)
    expect(useProfileStore.getState().profile.displayName).toBe('Kept Name')
  })

  it('fullResetToDemoDefaults restores the default profile and seeds', async () => {
    await bootstrapApplication()
    useProfileStore.getState().updateProfile({ displayName: 'Temp', email: 'temp@example.com' })
    await fullResetToDemoDefaults()
    expect(useProfileStore.getState().profile.displayName).toBe('Talha')
    expect(useProfileStore.getState().profile.email).toBe('talhamalikawan@example.com')
    expect(useDocumentsStore.getState().documents.length).toBeGreaterThanOrEqual(4)
  })
})

describe('IndexedDB document store', () => {
  beforeEach(async () => {
    await freshStorage()
  })

  it('persists document updates to the database', async () => {
    await bootstrapApplication()
    const doc = useDocumentsStore.getState().createDocument({ title: 'DB roundtrip' })!
    useDocumentsStore.getState().updateDocument(doc.id, { content: '<p>updated body</p>' })

    // allow the debounced write to flush
    await new Promise((r) => setTimeout(r, 500))

    const all = await db.getAllDocuments()
    const found = all.find((d) => d.id === doc.id)
    expect(found?.content).toBe('<p>updated body</p>')
    expect(found?.wordCount).toBeGreaterThan(0)
  })

  it('duplicate creates a copy with a new id', async () => {
    await bootstrapApplication()
    const doc = useDocumentsStore.getState().createDocument({ title: 'Original' })!
    const copy = useDocumentsStore.getState().duplicateDocument(doc.id)
    expect(copy).not.toBeNull()
    expect(copy?.id).not.toBe(doc.id)
    expect(copy?.title).toBe('Original (copy)')
  })

  it('mutating actions are blocked before hydration', () => {
    useDocumentsStore.setState({ documents: [], hydrated: false })
    expect(useDocumentsStore.getState().createDocument()).toBeNull()
  })
})
