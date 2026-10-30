/* ---------------------------------------------------------------------------
   ProseQ AI — shared domain types
--------------------------------------------------------------------------- */

export interface Profile {
  displayName: string
  email: string
  createdAt: string
  updatedAt: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface EditorPreferences {
  /** Editor body font size in px */
  fontSize: number
  /** Maximum width of the writing column */
  width: 'narrow' | 'comfortable' | 'wide'
  /** Native spellcheck on the editor surface */
  spellcheck: boolean
  /** Debounced autosave while writing */
  autosave: boolean
}

export interface Preferences {
  theme: ThemeMode
  editor: EditorPreferences
}

export type DocumentCategory =
  | 'business'
  | 'marketing'
  | 'education'
  | 'communication'
  | 'creative'
  | 'social'
  | 'blogging'
  | 'notes'

export interface StoredDocument {
  id: string
  title: string
  /** Rich text content stored as HTML */
  content: string
  category: DocumentCategory
  favorite: boolean
  wordCount: number
  createdAt: string
  updatedAt: string
}

export type TemplateCategory =
  | 'business'
  | 'marketing'
  | 'education'
  | 'communication'
  | 'creative'
  | 'social'
  | 'blogging'

export interface WritingTemplate {
  id: string
  name: string
  category: TemplateCategory
  description: string
  /** Short helper text shown in the preview */
  purpose: string
  /** Example structure — HTML, opens in the editor when used */
  structure: string
}

export type ToneId =
  | 'professional'
  | 'friendly'
  | 'formal'
  | 'confident'
  | 'concise'
  | 'persuasive'
  | 'academic'

export interface BrandVoice {
  id: string
  name: string
  description: string
  tone: ToneId
  audience: string
  /** Free-form writing preferences */
  preferences: string
  wordsToUse: string[]
  wordsToAvoid: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export type PlannerStatus = 'draft' | 'planned' | 'published'

export interface PlannerEntry {
  id: string
  title: string
  /** ISO date — YYYY-MM-DD */
  date: string
  category: DocumentCategory
  status: PlannerStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type SnapshotReason = 'save' | 'major' | 'restore' | 'template'

export interface VersionSnapshot {
  id: string
  documentId: string
  title: string
  content: string
  wordCount: number
  reason: SnapshotReason
  createdAt: string
}

export type ActivityType =
  | 'document-created'
  | 'document-saved'
  | 'document-deleted'
  | 'template-applied'
  | 'profile-updated'
  | 'settings-changed'
  | 'export-completed'
  | 'voice-updated'
  | 'planner-updated'
  | 'version-restored'
  | 'import-completed'

export interface ActivityItem {
  id: string
  type: ActivityType
  message: string
  at: string
}

export interface MetaRecord {
  version: number
  initializedAt: string
  lastActiveAt: string
}

/* --- Export / import payloads ------------------------------------------- */

export interface ExportPayload {
  app: 'proseq-ai'
  schemaVersion: 1
  exportedAt: string
  profile: Profile
  preferences: Preferences
  documents: StoredDocument[]
  brandVoices: BrandVoice[]
  planner: PlannerEntry[]
}

export interface ImportSummary {
  documents: number
  brandVoices: number
  plannerEntries: number
}

/* --- AI demonstration layer --------------------------------------------- */

export type ToolId =
  | 'improve'
  | 'grammar'
  | 'tone'
  | 'summarize'
  | 'expand'
  | 'shorten'
  | 'continue'
  | 'ideas'
  | 'outline'
  | 'rewrite'

export interface AIRunContext {
  documentTitle?: string
  voice?: BrandVoice | null
}

export interface AIResult {
  /** Transformed or generated text */
  output: string
  /** Human-readable notes describing what the demo engine changed */
  notes: string[]
  kind: 'transform' | 'generate'
}
