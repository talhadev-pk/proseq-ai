import type { ReactNode } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" labelId="confirm-title">
      <div className="flex gap-3.5">
        <span
          className={
            destructive
              ? 'flex size-10 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay'
              : 'flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber'
          }
        >
          {destructive ? <Trash2 className="size-5" /> : <AlertTriangle className="size-5" />}
        </span>
        <div className="text-sm leading-relaxed text-muted">{body}</div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
