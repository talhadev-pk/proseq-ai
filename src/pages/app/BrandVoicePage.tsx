import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Check, Mic, Pencil, Plus, Trash2, Users } from 'lucide-react'
import type { BrandVoice, ToneId } from '@/types'
import { useBrandVoiceStore, type BrandVoiceDraft } from '@/store/brandVoice'
import { TONE_OPTIONS } from '@/services/ai'
import { toast } from '@/store/notifications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { FieldError, FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

const voiceSchema = z.object({
  name: z.string().trim().min(2, 'Give the voice a name (2+ characters)').max(40),
  description: z.string().trim().max(240).optional().default(''),
  tone: z.enum(['professional', 'friendly', 'formal', 'confident', 'concise', 'persuasive', 'academic']),
  audience: z.string().trim().max(160).optional().default(''),
  preferences: z.string().trim().max(600).optional().default(''),
  wordsToUse: z.string().trim().max(200).optional().default(''),
  wordsToAvoid: z.string().trim().max(200).optional().default(''),
})

type VoiceForm = z.infer<typeof voiceSchema>

const toDraft = (f: VoiceForm): BrandVoiceDraft => ({
  name: f.name,
  description: f.description ?? '',
  tone: f.tone as ToneId,
  audience: f.audience ?? '',
  preferences: f.preferences ?? '',
  wordsToUse: (f.wordsToUse ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12),
  wordsToAvoid: (f.wordsToAvoid ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12),
})

export default function BrandVoicePage() {
  const voices = useBrandVoiceStore((s) => s.voices)
  const createVoice = useBrandVoiceStore((s) => s.createVoice)
  const updateVoice = useBrandVoiceStore((s) => s.updateVoice)
  const deleteVoice = useBrandVoiceStore((s) => s.deleteVoice)
  const setActive = useBrandVoiceStore((s) => s.setActive)

  const [editing, setEditing] = useState<BrandVoice | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<BrandVoice | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoiceForm>({
    resolver: zodResolver(voiceSchema),
    defaultValues: { name: '', tone: 'professional', description: '', audience: '', preferences: '', wordsToUse: '', wordsToAvoid: '' },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', tone: 'professional', description: '', audience: '', preferences: '', wordsToUse: '', wordsToAvoid: '' })
    setModalOpen(true)
  }

  const openEdit = (voice: BrandVoice) => {
    setEditing(voice)
    reset({
      name: voice.name,
      tone: voice.tone,
      description: voice.description,
      audience: voice.audience,
      preferences: voice.preferences,
      wordsToUse: voice.wordsToUse.join(', '),
      wordsToAvoid: voice.wordsToAvoid.join(', '),
    })
    setModalOpen(true)
  }

  const onSubmit = (values: VoiceForm) => {
    const draft = toDraft(values)
    if (editing) {
      if (updateVoice(editing.id, draft)) {
        toast.success('Voice updated', `“${draft.name}” saved.`)
        setModalOpen(false)
      } else {
        toast.error('Update failed', 'Please check the name field.')
      }
    } else {
      const created = createVoice(draft)
      if (created) {
        toast.success('Voice created', `“${created.name}” is ready. ${created.active ? 'It is now active.' : 'Activate it when you need it.'}`)
        setModalOpen(false)
      } else {
        toast.error('Could not create', 'The name field is required.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Brand voice</h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted">
            Define how you sound. The active voice shapes the demo engine’s improvements and
            rewrites — words to avoid get replaced, tone gets respected.
          </p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={openCreate}>
          New voice
        </Button>
      </div>

      {voices.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Mic className="size-6" />}
            title="No brand voices yet"
            description="Create a voice profile with your preferred tone, audience, and vocabulary. The demo engine will use it when improving or rewriting text."
            action={<Button onClick={openCreate}>Create your first voice</Button>}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {voices.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className={v.active ? 'h-full border-violet/50 shadow-lifted' : 'h-full'}>
                <CardBody className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-11 items-center justify-center rounded-xl ${
                          v.active ? 'bg-gradient-to-br from-violet to-blue text-white' : 'border border-line bg-sand/60 text-violet'
                        }`}
                      >
                        <Mic className="size-5" aria-hidden />
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-semibold">{v.name}</h2>
                        <p className="text-xs capitalize text-muted">{v.tone} tone</p>
                      </div>
                    </div>
                    {v.active ? (
                      <Badge tone="violet">
                        <Check className="size-3" aria-hidden /> Active
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setActive(v.id); toast.info(`“${v.name}” is now active`) }}>
                        Set active
                      </Button>
                    )}
                  </div>

                  {v.description ? (
                    <p className="mt-3.5 text-sm leading-relaxed text-muted">{v.description}</p>
                  ) : null}

                  <dl className="mt-4 space-y-2.5 text-[13px]">
                    {v.audience ? (
                      <div className="flex gap-2">
                        <dt className="flex shrink-0 items-center gap-1.5 text-faint">
                          <Users className="size-3.5" aria-hidden /> Audience
                        </dt>
                        <dd className="text-muted">{v.audience}</dd>
                      </div>
                    ) : null}
                    {v.preferences ? (
                      <div>
                        <dt className="text-faint">Preferences</dt>
                        <dd className="mt-0.5 text-muted">{v.preferences}</dd>
                      </div>
                    ) : null}
                    {v.wordsToUse.length ? (
                      <div>
                        <dt className="text-faint">Words to use</dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {v.wordsToUse.map((w) => (
                            <span key={w} className="rounded-full bg-moss-soft px-2 py-0.5 text-[11px] font-medium text-moss">
                              {w}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null}
                    {v.wordsToAvoid.length ? (
                      <div>
                        <dt className="text-faint">Words to avoid</dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {v.wordsToAvoid.map((w) => (
                            <span key={w} className="rounded-full bg-clay-soft px-2 py-0.5 text-[11px] font-medium text-clay">
                              {w}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <p className="text-[11px] text-faint">Updated {formatDate(v.updatedAt)}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => openEdit(v)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(v)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit “${editing.name}”` : 'New brand voice'}
        description="Everything here is optional except the name — build the profile that fits how you write."
        labelId="voice-form-title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>{editing ? 'Save changes' : 'Create voice'}</Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="voice-name">Voice name</FieldLabel>
              <Input id="voice-name" placeholder="e.g. Clear & Confident" aria-invalid={!!errors.name} {...register('name')} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <FieldLabel htmlFor="voice-tone">Preferred tone</FieldLabel>
              <Select id="voice-tone" {...register('tone')}>
                {TONE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.hint}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="voice-description">Description</FieldLabel>
            <Input id="voice-description" placeholder="What is this voice for?" {...register('description')} />
            <FieldError message={errors.description?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="voice-audience">Target audience</FieldLabel>
            <Input id="voice-audience" placeholder="Who reads writing in this voice?" {...register('audience')} />
          </div>
          <div>
            <FieldLabel htmlFor="voice-preferences">Writing preferences</FieldLabel>
            <Textarea id="voice-preferences" rows={3} placeholder="Sentence length, formality, things you always or never do…" {...register('preferences')} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="voice-use" hint="comma separated">
                Words to use
              </FieldLabel>
              <Input id="voice-use" placeholder="clear, practical, direct" {...register('wordsToUse')} />
            </div>
            <div>
              <FieldLabel htmlFor="voice-avoid" hint="comma separated">
                Words to avoid
              </FieldLabel>
              <Input id="voice-avoid" placeholder="synergy, leverage" {...register('wordsToAvoid')} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this brand voice?"
        body={
          <>
            “<strong className="text-ink">{deleting?.name}</strong>” will be removed. Documents are
            not affected.
          </>
        }
        confirmLabel="Delete voice"
        destructive
        onConfirm={() => {
          if (deleting && deleteVoice(deleting.id)) {
            toast.success('Voice deleted', `“${deleting.name}” was removed.`)
          }
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
