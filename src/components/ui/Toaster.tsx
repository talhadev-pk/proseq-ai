import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useNotificationStore } from '@/store/notifications'
import type { Toast, ToastKind } from '@/store/notifications'

const icons: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const accents: Record<ToastKind, string> = {
  success: 'text-moss',
  error: 'text-clay',
  info: 'text-blue',
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200)
    return () => clearTimeout(t)
  }, [onDismiss])

  const Icon = icons[toast.kind]
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
      className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-line bg-paper p-3.5 shadow-lifted"
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${accents[toast.kind]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs leading-relaxed text-muted">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-faint transition-colors hover:bg-sand hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </motion.li>
  )
}

/** Global toast viewport — mount once at the app root. */
export function Toaster() {
  const toasts = useNotificationStore((s) => s.toasts)
  const dismiss = useNotificationStore((s) => s.dismiss)

  return (
    <ul
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-2.5"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
