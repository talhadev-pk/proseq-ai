/**
 * Application bootstrap — runs once before the UI mounts.
 *
 * ORDER OF OPERATIONS (critical for data safety):
 * 1. Read the meta record. If it exists, the app has initialized before:
 *    load the user's saved documents + snapshots. NEVER seed.
 * 2. If it does not exist, this is a genuine first run: seed demo data,
 *    then write the meta record. If seeding fails, we still do not retry
 *    destructively.
 *
 * This guarantees "refresh never overwrites saved data with demo seeds".
 */
import type { MetaRecord } from '@/types'
import { STORE_KEYS, storage } from '@/services/storage'
import { db } from '@/services/db'
import { seedActivity, seedBrandVoices, seedDocuments, seedPlannerEntries } from '@/data/demo'
import { uid } from '@/lib/utils'
import { useDocumentsStore } from './documents'
import { useHistoryStore } from './history'
import { useBrandVoiceStore } from './brandVoice'
import { usePlannerStore } from './planner'
import { useActivityStore } from './activity'
import { useProfileStore } from './profile'
import { usePreferencesStore } from './preferences'

const SCHEMA_VERSION = 1

let bootstrapPromise: Promise<void> | null = null

async function loadExisting(): Promise<void> {
  const [documents, snapshots] = await Promise.all([db.getAllDocuments(), db.getAllSnapshots()])
  useDocumentsStore.getState().setAll(documents)
  useHistoryStore.getState().setAll(snapshots)
}

async function seedFirstRun(): Promise<void> {
  const docs = seedDocuments()
  await db.putDocuments(docs)
  useDocumentsStore.getState().setAll(docs)

  // Seed a starting snapshot for each demo document so History has content.
  const now = new Date().toISOString()
  const snaps = docs.map((doc) => ({
    id: uid('snap'),
    documentId: doc.id,
    title: doc.title,
    content: doc.content,
    wordCount: doc.wordCount,
    reason: 'save' as const,
    createdAt: doc.createdAt,
  }))
  for (const snap of snaps) await db.putSnapshot(snap)
  useHistoryStore.getState().setAll(snaps)

  useBrandVoiceStore.getState().replaceAll(seedBrandVoices())
  usePlannerStore.getState().replaceAll(seedPlannerEntries())
  useActivityStore.getState().replaceAll(seedActivity())

  storage.write(STORE_KEYS.meta, {
    version: SCHEMA_VERSION,
    initializedAt: now,
    lastActiveAt: now,
  } satisfies MetaRecord)
}

/** Test-only: forget the memoized bootstrap so the next call re-reads storage. */
export function __resetBootstrapForTests(): void {
  bootstrapPromise = null
}

export function bootstrapApplication(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise
  bootstrapPromise = (async () => {
    try {
      const meta = storage.read<MetaRecord>(STORE_KEYS.meta)
      if (meta) {
        await loadExisting()
        storage.write(STORE_KEYS.meta, { ...meta, lastActiveAt: new Date().toISOString() })
      } else {
        await seedFirstRun()
      }
    } catch {
      // Never leave the app unusable: fall back to empty, hydrated stores.
      useDocumentsStore.getState().setAll([])
      useHistoryStore.getState().setAll([])
    }
  })()
  return bootstrapPromise
}

/**
 * Data management operations used by Settings.
 */

/** Clear content data but KEEP the profile and preferences. */
export async function clearContentData(): Promise<void> {
  await useDocumentsStore.getState().clearAll()
  await useHistoryStore.getState().clearAll()
  useBrandVoiceStore.getState().clearAll()
  usePlannerStore.getState().clearAll()
  useActivityStore.getState().clear()
}

/**
 * Complete reset — wipes EVERYTHING (including profile) and restores the
 * demonstration defaults. Requires an explicit confirmation in the UI.
 */
export async function fullResetToDemoDefaults(): Promise<void> {
  await clearContentData()
  storage.clearAll()
  useProfileStore.getState().resetToDefaults()
  usePreferencesStore.getState().reset()
  // Re-seed as a fresh first run.
  await seedFirstRun()
}
