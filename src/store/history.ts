/**
 * Version history — document snapshots stored in IndexedDB.
 *
 * Snapshot strategy (deliberately conservative):
 * - A snapshot is taken on explicit save when the content actually changed.
 * - Autosave only snapshots on a significant delta (>= 40 words) or when the
 *   last snapshot is older than 10 minutes.
 * - Maximum 20 snapshots per document; the oldest are pruned.
 */
import { create } from 'zustand'
import type { SnapshotReason, StoredDocument, VersionSnapshot } from '@/types'
import { db } from '@/services/db'
import { uid } from '@/lib/utils'
import { useActivityStore } from './activity'

const MAX_PER_DOC = 20
const SIGNIFICANT_WORD_DELTA = 40
const STALE_AFTER_MS = 10 * 60 * 1000

interface HistoryState {
  snapshots: VersionSnapshot[]
  hydrated: boolean
  setAll: (snaps: VersionSnapshot[]) => void
  listFor: (documentId: string) => VersionSnapshot[]
  /** Decides whether a snapshot is worth taking, then takes it. */
  maybeSnapshot: (doc: StoredDocument, reason: SnapshotReason) => Promise<VersionSnapshot | null>
  /** Force a snapshot (template creation, restore points). */
  snapshot: (doc: StoredDocument, reason: SnapshotReason) => Promise<VersionSnapshot>
  restore: (snapshotId: string) => Promise<VersionSnapshot | null>
  deleteForDocument: (documentId: string) => Promise<void>
  clearAll: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  snapshots: [],
  hydrated: false,

  setAll: (snaps) => set({ snapshots: snaps, hydrated: true }),

  listFor: (documentId) =>
    get()
      .snapshots.filter((s) => s.documentId === documentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  maybeSnapshot: async (doc, reason) => {
    if (!get().hydrated) return null
    const last = get()
      .snapshots.filter((s) => s.documentId === doc.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

    const changed = !last || last.content !== doc.content
    if (!changed) return null

    if (reason === 'major') {
      const wordDelta = Math.abs((last?.wordCount ?? 0) - doc.wordCount)
      const isStale = !last || Date.now() - new Date(last.createdAt).getTime() > STALE_AFTER_MS
      if (wordDelta < SIGNIFICANT_WORD_DELTA && !isStale) return null
    }
    return get().snapshot(doc, reason)
  },

  snapshot: async (doc, reason) => {
    const snap: VersionSnapshot = {
      id: uid('snap'),
      documentId: doc.id,
      title: doc.title,
      content: doc.content,
      wordCount: doc.wordCount,
      reason,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ snapshots: [...s.snapshots, snap] }))
    await db.putSnapshot(snap)

    // Prune per-document history.
    const mine = get()
      .snapshots.filter((s) => s.documentId === doc.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (mine.length > MAX_PER_DOC) {
      const doomed = mine.slice(MAX_PER_DOC)
      set((s) => ({ snapshots: s.snapshots.filter((x) => !doomed.some((d) => d.id === x.id)) }))
      for (const d of doomed) await db.deleteSnapshots(d.documentId).catch(() => undefined)
    }
    return snap
  },

  restore: async (snapshotId) => {
    const snap = get().snapshots.find((s) => s.id === snapshotId)
    if (!snap) return null
    useActivityStore.getState().log('version-restored', `Restored a version of “${snap.title}”`)
    // The restore itself becomes a new snapshot of the *current* state is
    // handled by the caller (writer page) before applying. Here we simply
    // return the snapshot for the caller to apply.
    return snap
  },

  deleteForDocument: async (documentId) => {
    set((s) => ({ snapshots: s.snapshots.filter((x) => x.documentId !== documentId) }))
    await db.deleteSnapshots(documentId)
  },

  clearAll: async () => {
    set({ snapshots: [] })
    await db.clearAll()
  },
}))
