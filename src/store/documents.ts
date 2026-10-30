/**
 * Document store — backed by IndexedDB (localStorage fallback via services/db).
 *
 * HYDRATION-SAFE DESIGN:
 * - `hydrated` starts false. Every mutating action no-ops until `setAll`
 *   completes, so a refresh can never clobber saved documents with the
 *   empty initial state.
 * - Writes are debounced and batched.
 */
import { create } from 'zustand'
import type { DocumentCategory, StoredDocument, WritingTemplate } from '@/types'
import { db } from '@/services/db'
import { countWords, htmlToPlainText, uid } from '@/lib/utils'
import { useActivityStore } from './activity'

interface DocumentsState {
  documents: StoredDocument[]
  hydrated: boolean
  /** Called once during bootstrap with everything loaded from storage. */
  setAll: (docs: StoredDocument[]) => void
  createDocument: (init?: {
    title?: string
    content?: string
    category?: DocumentCategory
  }) => StoredDocument | null
  updateDocument: (id: string, patch: Partial<Omit<StoredDocument, 'id' | 'createdAt'>>) => boolean
  renameDocument: (id: string, title: string) => boolean
  deleteDocument: (id: string) => boolean
  duplicateDocument: (id: string) => StoredDocument | null
  toggleFavorite: (id: string) => boolean
  createFromTemplate: (template: WritingTemplate) => StoredDocument | null
  replaceAll: (docs: StoredDocument[]) => void
  clearAll: () => void
}

function makeDoc(init: {
  title?: string
  content?: string
  category?: DocumentCategory
}): StoredDocument {
  const now = new Date().toISOString()
  const content = init.content ?? '<p></p>'
  return {
    id: uid('doc'),
    title: init.title?.trim() || 'Untitled document',
    content,
    category: init.category ?? 'notes',
    favorite: false,
    wordCount: countWords(htmlToPlainText(content)),
    createdAt: now,
    updatedAt: now,
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null
let writeQueue: string[] = []

function flushWritesNow(): void {
  if (writeTimer) {
    clearTimeout(writeTimer)
    writeTimer = null
  }
  const ids = new Set(writeQueue)
  writeQueue = []
  const state = useDocumentsStore?.getState?.()
  if (!state || !state.hydrated) return
  const docs = state.documents.filter((d) => ids.has(d.id))
  for (const doc of docs) void db.putDocument(doc)
}

// Never lose the last debounced edit when the tab closes or navigates away.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushWritesNow)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushWritesNow()
  })
}

export const useDocumentsStore = create<DocumentsState>((set, get) => {
  /** Immediate write-through — used for creates and deletes. */
  async function persistNow(id: string) {
    if (!get().hydrated) return
    const doc = get().documents.find((d) => d.id === id)
    if (doc) await db.putDocument(doc)
  }

  /** Debounced write — used for content/title updates while typing. */
  function persistDoc(id: string) {
    if (!get().hydrated) return
    writeQueue.push(id)
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(flushWritesNow, 300)
  }

  return {
    documents: [],
    hydrated: false,

    setAll: (docs) => set({ documents: docs, hydrated: true }),

    createDocument: (init) => {
      if (!get().hydrated) return null
      const doc = makeDoc(init ?? {})
      set((s) => ({ documents: [doc, ...s.documents] }))
      useActivityStore.getState().log('document-created', `Created “${doc.title}”`)
      void persistNow(doc.id)
      return doc
    },

    updateDocument: (id, patch) => {
      if (!get().hydrated) return false
      let ok = false
      set((s) => ({
        documents: s.documents.map((d) => {
          if (d.id !== id) return d
          ok = true
          const next = { ...d, ...patch, updatedAt: new Date().toISOString() }
          if (patch.content !== undefined) {
            next.wordCount = countWords(htmlToPlainText(patch.content))
          }
          return next
        }),
      }))
      if (ok) void persistDoc(id)
      return ok
    },

    renameDocument: (id, title) => {
      const t = title.trim()
      if (!t) return false
      return get().updateDocument(id, { title: t })
    },

    deleteDocument: (id) => {
      if (!get().hydrated) return false
      const doc = get().documents.find((d) => d.id === id)
      if (!doc) return false
      set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }))
      useActivityStore.getState().log('document-deleted', `Deleted “${doc.title}”`)
      void db.deleteDocument(id)
      return true
    },

    duplicateDocument: (id) => {
      if (!get().hydrated) return null
      const source = get().documents.find((d) => d.id === id)
      if (!source) return null
      const now = new Date().toISOString()
      const copy: StoredDocument = {
        ...source,
        id: uid('doc'),
        title: `${source.title} (copy)`,
        favorite: false,
        createdAt: now,
        updatedAt: now,
      }
      set((s) => ({ documents: [copy, ...s.documents] }))
      useActivityStore.getState().log('document-created', `Duplicated “${source.title}”`)
      void persistNow(copy.id)
      return copy
    },

    toggleFavorite: (id) => get().updateDocument(id, { favorite: !get().documents.find((d) => d.id === id)?.favorite }),

    createFromTemplate: (template) => {
      if (!get().hydrated) return null
      const doc = makeDoc({
        title: template.name,
        content: template.structure,
        category: template.category,
      })
      set((s) => ({ documents: [doc, ...s.documents] }))
      useActivityStore.getState().log('template-applied', `Applied the ${template.name} template`)
      void persistNow(doc.id)
      return doc
    },

    replaceAll: (docs) => {
      set({ documents: docs })
      void db.putDocuments(docs)
    },

    clearAll: async () => {
      set({ documents: [] })
      await db.clearDocuments()
    },
  }
})
