/**
 * IndexedDB-backed document & snapshot storage, with a localStorage fallback
 * for environments where IndexedDB is unavailable (some browsers, tests).
 *
 * The public API is intentionally async and small so stores can treat it like
 * any other persistence adapter.
 */
import type { StoredDocument, VersionSnapshot } from '@/types'
import { STORE_KEYS, storage } from './storage'

const DB_NAME = 'proseq-ai'
const DB_VERSION = 1
const DOCS = 'documents'
const SNAPSHOTS = 'snapshots'

let dbPromise: Promise<IDBDatabase | null> | null = null

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

function openDB(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB()) return Promise.resolve(null)
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(DOCS)) {
          db.createObjectStore(DOCS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(SNAPSHOTS)) {
          const store = db.createObjectStore(SNAPSHOTS, { keyPath: 'id' })
          store.createIndex('documentId', 'documentId', { unique: false })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDB().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null)
          return
        }
        try {
          const t = db.transaction(store, mode)
          const req = run(t.objectStore(store))
          req.onsuccess = () => resolve(req.result)
          req.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }),
  )
}

/* --- localStorage fallback ------------------------------------------------ */

function fallbackRead<T>(key: string): T[] {
  return storage.read<T[]>(key) ?? []
}

/* --- Public API ----------------------------------------------------------- */

export const db = {
  get isIndexedDB() {
    return hasIndexedDB()
  },

  async getAllDocuments(): Promise<StoredDocument[]> {
    const res = await tx<StoredDocument[]>(DOCS, 'readonly', (s) => s.getAll() as IDBRequest<StoredDocument[]>)
    if (res !== null) return res
    return fallbackRead<StoredDocument>(STORE_KEYS.dbDocuments)
  },

  async putDocument(doc: StoredDocument): Promise<void> {
    const res = await tx<IDBValidKey>(DOCS, 'readwrite', (s) => s.put(doc))
    if (res === null) {
      const all = fallbackRead<StoredDocument>(STORE_KEYS.dbDocuments)
      const idx = all.findIndex((d) => d.id === doc.id)
      if (idx >= 0) all[idx] = doc
      else all.push(doc)
      storage.write(STORE_KEYS.dbDocuments, all)
    }
  },

  async putDocuments(docs: StoredDocument[]): Promise<void> {
    const res = await tx<unknown>(DOCS, 'readwrite', (s) => {
      for (const d of docs) s.put(d)
      return s.getAll() as IDBRequest<unknown>
    })
    if (res === null) {
      storage.write(STORE_KEYS.dbDocuments, docs)
    }
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await tx<undefined>(DOCS, 'readwrite', (s) => s.delete(id) as unknown as IDBRequest<undefined>)
    if (res === null) {
      const all = fallbackRead<StoredDocument>(STORE_KEYS.dbDocuments).filter((d) => d.id !== id)
      storage.write(STORE_KEYS.dbDocuments, all)
      // Snapshots too.
      const snaps = fallbackRead<VersionSnapshot>(STORE_KEYS.dbSnapshots).filter((s) => s.documentId !== id)
      storage.write(STORE_KEYS.dbSnapshots, snaps)
    }
  },

  async clearDocuments(): Promise<void> {
    const res = await tx<undefined>(DOCS, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)
    if (res === null) storage.write(STORE_KEYS.dbDocuments, [])
  },

  async getAllSnapshots(): Promise<VersionSnapshot[]> {
    const res = await tx<VersionSnapshot[]>(SNAPSHOTS, 'readonly', (s) => s.getAll() as IDBRequest<VersionSnapshot[]>)
    if (res !== null) return res
    return fallbackRead<VersionSnapshot>(STORE_KEYS.dbSnapshots)
  },

  async putSnapshot(snap: VersionSnapshot): Promise<void> {
    const res = await tx<IDBValidKey>(SNAPSHOTS, 'readwrite', (s) => s.put(snap))
    if (res === null) {
      const all = fallbackRead<VersionSnapshot>(STORE_KEYS.dbSnapshots)
      all.push(snap)
      storage.write(STORE_KEYS.dbSnapshots, all)
    }
  },

  async deleteSnapshots(documentId: string): Promise<void> {
    const all = await this.getAllSnapshots()
    const keep = all.filter((s) => s.documentId !== documentId)
    const res = await tx<unknown>(SNAPSHOTS, 'readwrite', (s) => {
      for (const snap of all) if (snap.documentId === documentId) s.delete(snap.id)
      return s.getAll() as IDBRequest<unknown>
    })
    if (res === null) {
      storage.write(STORE_KEYS.dbSnapshots, keep)
    }
  },

  async clearAll(): Promise<void> {
    await tx<undefined>(DOCS, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)
    await tx<undefined>(SNAPSHOTS, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)
    storage.write(STORE_KEYS.dbDocuments, [])
    storage.write(STORE_KEYS.dbSnapshots, [])
  },
}
