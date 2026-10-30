import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-sand/40 px-6 py-16 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-line bg-paper text-faint shadow-soft">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  )
}
