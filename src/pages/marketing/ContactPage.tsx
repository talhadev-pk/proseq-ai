import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, Info, Mail, MapPin, Send } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { FieldError, FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { STORE_KEYS, storage } from '@/services/storage'
import { uid } from '@/lib/utils'
import { toast } from '@/store/notifications'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name (at least 2 characters)').max(60),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(4, 'Give your message a subject (at least 4 characters)').max(90),
  message: z.string().trim().min(20, 'Tell me a little more — at least 20 characters').max(3000),
})

type ContactForm = z.infer<typeof contactSchema>

interface Submission extends ContactForm {
  id: string
  submittedAt: string
}

function saveSubmission(form: ContactForm): boolean {
  const existing = storage.read<Submission[]>(STORE_KEYS.contactSubmissions) ?? []
  const entry: Submission = { ...form, id: uid('msg'), submittedAt: new Date().toISOString() }
  return storage.write(STORE_KEYS.contactSubmissions, [entry, ...existing].slice(0, 20))
}

export default function ContactPage() {
  useSEO({
    title: 'Contact',
    description:
      'Get in touch about ProseQ AI. The contact form is demonstration-only — submissions are stored locally and no email is sent.',
  })

  const [sent, setSent] = useState<ContactForm | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  const onSubmit = async (values: ContactForm) => {
    // Simulated processing — no backend exists.
    await new Promise((r) => setTimeout(r, 650))
    const ok = saveSubmission(values)
    if (ok) {
      setSent(values)
      reset()
      toast.info('Message recorded locally', 'This is a demo form — no email was sent.')
    } else {
      toast.error('Could not record the message', 'Local storage is unavailable in this browser.')
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(45% 35% at 15% 0%, var(--c-blue-soft), transparent 70%)',
        }}
      />
      <div className="container-site grid grid-cols-1 gap-12 py-16 sm:py-20 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Reveal>
            <span className="kicker">
              <Mail className="size-3.5 text-blue" aria-hidden /> Contact
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Say hello
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Feedback on the project, questions about the approach, or a thought about what a
              writing workspace should be — this form is the place for all of it.
            </p>

            <div className="mt-8 flex items-start gap-3.5 rounded-2xl border border-amber/30 bg-amber-soft p-5">
              <Info className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
              <div>
                <p className="text-sm font-semibold">This form is demonstration-only.</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  There is no backend or email service behind it. When you submit, the message is
                  validated and stored locally in your browser so you can see the flow work — but
                  no email is sent and nothing leaves your device.
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-muted">
              <li className="flex items-center gap-3">
                <Clock className="size-4.5 text-faint" aria-hidden />
                A real product would answer within two business days.
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4.5 text-faint" aria-hidden />
                Built in Gujranwala, Pakistan — and in the browser, wherever you are.
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-3">
          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-soft sm:p-8">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-moss-soft text-moss">
                      <CheckCircle2 className="size-7" aria-hidden />
                    </span>
                    <h2 className="mt-5 font-display text-xl font-semibold">
                      Message recorded — demo style
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      Thanks, {sent.name.split(' ')[0]}. Your message was validated and saved to
                      this browser’s local storage as part of the demonstration. To be perfectly
                      clear: <strong className="text-ink">no email was sent</strong>, because no
                      backend exists.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setSent(null)}>
                      Write another message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                        <Input
                          id="contact-name"
                          autoComplete="name"
                          placeholder="Your name"
                          aria-invalid={!!errors.name}
                          {...register('name')}
                        />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div>
                        <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                        <Input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                          {...register('email')}
                        />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>
                    <div>
                      <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
                      <Input
                        id="contact-subject"
                        placeholder="What is this about?"
                        aria-invalid={!!errors.subject}
                        {...register('subject')}
                      />
                      <FieldError message={errors.subject?.message} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="contact-message" hint="20–3000 characters">
                        Message
                      </FieldLabel>
                      <Textarea
                        id="contact-message"
                        rows={6}
                        placeholder="Say what you would like to say…"
                        aria-invalid={!!errors.message}
                        {...register('message')}
                      />
                      <FieldError message={errors.message?.message} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs text-faint">
                        Stored locally only · never transmitted
                      </p>
                      <Button type="submit" loading={isSubmitting} icon={<Send className="size-4" />}>
                        {isSubmitting ? 'Recording…' : 'Send message'}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
