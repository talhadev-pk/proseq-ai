import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  Eraser,
  Monitor,
  Palette,
  PenLine,
  RotateCcw,
  Upload,
  UserRound,
} from 'lucide-react'
import type { ImportSummary } from '@/types'
import { useProfileStore } from '@/store/profile'
import { usePreferencesStore } from '@/store/preferences'
import { useDocumentsStore } from '@/store/documents'
import { useBrandVoiceStore } from '@/store/brandVoice'
import { usePlannerStore } from '@/store/planner'
import { useActivityStore } from '@/store/activity'
import { clearContentData, fullResetToDemoDefaults } from '@/store/bootstrap'
import { toast } from '@/store/notifications'
import {
  buildExportPayload,
  exportLibraryJson,
  validateImport,
  type ValidatedPayload,
} from '@/services/export'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { FieldError, FieldLabel, Input, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Avatar } from '@/components/ui/Avatar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { Tabs } from '@/components/ui/Tabs'

type SettingsTab = 'profile' | 'appearance' | 'editor' | 'data'

const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(48),
  email: z.string().trim().email('Enter a valid email address'),
})
type ProfileForm = z.infer<typeof profileSchema>

function ProfileSettings() {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const logActivity = useActivityStore((s) => s.log)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { displayName: profile.displayName, email: profile.email },
  })

  const onSubmit = (values: ProfileForm) => {
    const result = updateProfile(values)
    if (result.ok) {
      logActivity('profile-updated', 'Updated profile details')
      toast.success('Profile saved', 'Your changes persist across refreshes.')
    } else {
      toast.error('Could not save profile', result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar name={profile.displayName} size="lg" />
          <div>
            <CardTitle>Profile</CardTitle>
            <p className="mt-0.5 text-xs text-muted">
              Saved locally — survives refreshes and navigation.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form className="max-w-md space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <FieldLabel htmlFor="settings-name">Display name</FieldLabel>
            <Input id="settings-name" autoComplete="name" aria-invalid={!!errors.displayName} {...register('displayName')} />
            <FieldError message={errors.displayName?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="settings-email">Email address</FieldLabel>
            <Input id="settings-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" icon={<Check className="size-4" />}>
              Save changes
            </Button>
            {isDirty ? <span className="text-xs text-amber">Unsaved changes</span> : null}
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

function AppearanceSettings() {
  const logActivity = useActivityStore((s) => s.log)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
            <Palette className="size-5" aria-hidden />
          </span>
          <div>
            <CardTitle>Appearance</CardTitle>
            <p className="mt-0.5 text-xs text-muted">Light, dark, or follow your system.</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-wrap items-center gap-4">
          <ThemeToggle />
          <p className="max-w-xs text-xs leading-relaxed text-faint">
            <Monitor className="mr-1 inline size-3.5" aria-hidden />
            System mode follows your OS setting and updates live.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => {
            logActivity('settings-changed', 'Adjusted appearance settings')
            toast.info('Theme preference saved', 'It applies instantly and persists.')
          }}
        >
          Note: theme changes save automatically
        </Button>
      </CardBody>
    </Card>
  )
}

function EditorSettings() {
  const editor = usePreferencesStore((s) => s.editor)
  const setEditor = usePreferencesStore((s) => s.setEditor)
  const logActivity = useActivityStore((s) => s.log)
  const note = () => {
    logActivity('settings-changed', 'Adjusted editor preferences')
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
            <PenLine className="size-5" aria-hidden />
          </span>
          <div>
            <CardTitle>Editor preferences</CardTitle>
            <p className="mt-0.5 text-xs text-muted">How the writing surface feels.</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="max-w-md space-y-6">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="font-size" className="text-sm font-medium">
              Font size
            </label>
            <span className="font-mono text-xs text-muted">{editor.fontSize}px</span>
          </div>
          <input
            id="font-size"
            type="range"
            min={14}
            max={22}
            step={1}
            value={editor.fontSize}
            onChange={(e) => {
              setEditor({ fontSize: Number(e.target.value) })
              note()
            }}
            className="w-full accent-[var(--c-violet)]"
          />
          <p className="prose-editor mt-3" style={{ fontSize: `${editor.fontSize}px` }}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        <div>
          <FieldLabel htmlFor="editor-width">Editor width</FieldLabel>
          <Select
            id="editor-width"
            value={editor.width}
            onChange={(e) => {
              setEditor({ width: e.target.value as typeof editor.width })
              note()
            }}
          >
            <option value="narrow">Narrow — focused (640px)</option>
            <option value="comfortable">Comfortable — default (740px)</option>
            <option value="wide">Wide — spacious (900px)</option>
          </Select>
        </div>
        <Switch
          checked={editor.spellcheck}
          onCheckedChange={(v) => {
            setEditor({ spellcheck: v })
            note()
          }}
          label="Spellcheck"
          description="Uses your browser's native spellcheck on the editor surface."
        />
        <Switch
          checked={editor.autosave}
          onCheckedChange={(v) => {
            setEditor({ autosave: v })
            note()
            toast.info(v ? 'Autosave enabled' : 'Autosave disabled', v ? 'Changes save 1.4s after you stop typing.' : 'Remember to save manually.')
          }}
          label="Autosave"
          description="Save automatically ~1.4 seconds after you stop typing."
        />
      </CardBody>
    </Card>
  )
}

function DataSettings() {
  const profile = useProfileStore((s) => s.profile)
  const documents = useDocumentsStore((s) => s.documents)
  const voices = useBrandVoiceStore((s) => s.voices)
  const planner = usePlannerStore((s) => s.entries)
  const replaceDocs = useDocumentsStore((s) => s.replaceAll)
  const replaceVoices = useBrandVoiceStore((s) => s.replaceAll)
  const replacePlanner = usePlannerStore((s) => s.replaceAll)
  const logActivity = useActivityStore((s) => s.log)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<{
    payload: ValidatedPayload
    summary: ImportSummary
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const doExport = () => {
    const payload = buildExportPayload({
      profile,
      preferences: usePreferencesStore.getState(),
      documents,
      brandVoices: voices,
      planner,
    })
    exportLibraryJson(payload)
    logActivity('export-completed', 'Exported the full library as JSON')
    toast.success('Backup exported', 'A JSON file with your documents, voices, and planner has downloaded.')
  }

  const onFile = async (file: File) => {
    setImportError(null)
    const text = await file.text()
    const result = validateImport(text)
    if (!result.ok) {
      setImportError(result.error)
      toast.error('Import failed', result.error)
      return
    }
    const p = result.payload
    const existing = new Set(documents.map((d) => d.id))
    const conflicts = p.documents.filter((d) => existing.has(d.id)).length
    setPendingImport({
      payload: p,
      summary: {
        documents: p.documents.length,
        brandVoices: p.brandVoices.length,
        plannerEntries: p.planner.length,
      },
    })
    if (conflicts > 0) {
      setImportError(
        `${conflicts} document${conflicts > 1 ? 's' : ''} already exist${conflicts > 1 ? '' : 's'} by id. Importing will overwrite them — continue only if that is what you want.`,
      )
    }
  }

  const applyImport = () => {
    if (!pendingImport) return
    const p = pendingImport.payload
    // Coerce planner categories to the known union (backups may contain stray values).
    const validCategories = ['business', 'marketing', 'education', 'communication', 'creative', 'social', 'blogging', 'notes'] as const
    const planner = p.planner.map((e) => ({
      ...e,
      category: (validCategories as readonly string[]).includes(e.category)
        ? (e.category as (typeof validCategories)[number])
        : ('notes' as const),
    }))
    replaceDocs(p.documents)
    replaceVoices(p.brandVoices)
    replacePlanner(planner)
    logActivity('import-completed', 'Imported a library backup')
    toast.success('Import complete', `${p.documents.length} documents, ${p.brandVoices.length} voices, ${p.planner.length} planner entries.`)
    setPendingImport(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-sand/60 text-violet">
              <Database className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle>Your data</CardTitle>
              <p className="mt-0.5 text-xs text-muted">
                {documents.length} documents · {voices.length} brand voices · {planner.length} planner entries — all stored in this browser.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" icon={<Download className="size-4" />} onClick={doExport}>
              Export everything (JSON)
            </Button>
            <Button variant="outline" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import backup file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onFile(f)
              }}
            />
          </div>

          {importError ? (
            <p role="alert" className="rounded-xl border border-amber/30 bg-amber-soft px-3.5 py-2.5 text-xs leading-relaxed text-amber">
              {importError}
            </p>
          ) : null}

          {pendingImport ? (
            <div className="rounded-xl border border-violet/30 bg-violet-soft/50 p-4">
              <p className="text-sm font-semibold">Backup verified — ready to import</p>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                <li>• {pendingImport.summary.documents} documents</li>
                <li>• {pendingImport.summary.brandVoices} brand voices</li>
                <li>• {pendingImport.summary.plannerEntries} planner entries</li>
                <li>• Profile from the backup: {pendingImport.payload.profile.displayName}</li>
              </ul>
              <div className="mt-3.5 flex gap-2.5">
                <Button size="sm" onClick={applyImport}>
                  Import and replace
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingImport(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-clay/30 bg-clay-soft text-clay">
              <Eraser className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle>Reset options</CardTitle>
              <p className="mt-0.5 text-xs text-muted">Destructive actions — both ask for confirmation.</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
            <div>
              <p className="text-sm font-medium">Clear demo data</p>
              <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted">
                Removes documents, brand voices, planner entries, and activity. Your profile and
                preferences are kept.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>
              Clear content
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/30 bg-clay-soft/40 p-4">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <AlertTriangle className="size-4 text-clay" aria-hidden /> Complete reset
              </p>
              <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted">
                Wipes everything — including your profile — and restores the original demonstration
                defaults (Talha / talhamalikawan@example.com).
              </p>
            </div>
            <Button variant="danger" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={() => setConfirmReset(true)}>
              Full reset
            </Button>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear demo content?"
        body={
          <>
            All documents, brand voices, planner entries, and activity will be deleted.{' '}
            <strong className="text-ink">Your profile and preferences are kept.</strong>
          </>
        }
        confirmLabel="Clear content"
        destructive
        onConfirm={async () => {
          await clearContentData()
          toast.success('Content cleared', 'Your profile was preserved.')
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Complete reset to demo defaults?"
        body={
          <>
            This deletes <strong className="text-ink">everything</strong>, including your profile,
            and re-seeds the original demonstration data. This is the only action that resets your
            saved name and email.
          </>
        }
        confirmLabel="Erase everything & reset"
        destructive
        onConfirm={async () => {
          await fullResetToDemoDefaults()
          toast.success('Reset complete', 'The workspace is back to its first-run demo state.')
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1.5 text-sm text-muted">Profile, appearance, editor, and your data.</p>
        </div>
        <Tabs
          items={[
            { id: 'profile', label: 'Profile', icon: <UserRound className="size-3.5" /> },
            { id: 'appearance', label: 'Appearance', icon: <Palette className="size-3.5" /> },
            { id: 'editor', label: 'Editor', icon: <PenLine className="size-3.5" /> },
            { id: 'data', label: 'Data', icon: <Database className="size-3.5" /> },
          ]}
          value={tab}
          onChange={setTab}
          size="sm"
        />
      </div>

      <div className="mt-8">
        {tab === 'profile' ? <ProfileSettings /> : null}
        {tab === 'appearance' ? <AppearanceSettings /> : null}
        {tab === 'editor' ? <EditorSettings /> : null}
        {tab === 'data' ? <DataSettings /> : null}
      </div>

      <p className="mt-8 text-center text-xs text-faint">
        <Badge tone="neutral" className="mr-2">Demo edition</Badge>
        Settings persist locally. Nothing is transmitted anywhere.
      </p>
    </div>
  )
}
