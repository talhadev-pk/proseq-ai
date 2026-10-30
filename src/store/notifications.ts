/** Ephemeral toast notifications. Never persisted. */
import { create } from 'zustand'
import { uid } from '@/lib/utils'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  description?: string
}

interface NotificationState {
  toasts: Toast[]
  push: (kind: ToastKind, title: string, description?: string) => void
  dismiss: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  push: (kind, title, description) =>
    set((s) => ({ toasts: [...s.toasts, { id: uid('toast'), kind, title, description }].slice(-4) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Convenience helper usable anywhere. */
export const toast = {
  success: (title: string, description?: string) =>
    useNotificationStore.getState().push('success', title, description),
  error: (title: string, description?: string) =>
    useNotificationStore.getState().push('error', title, description),
  info: (title: string, description?: string) =>
    useNotificationStore.getState().push('info', title, description),
}
