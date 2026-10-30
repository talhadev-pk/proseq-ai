import { cn } from '@/lib/utils'

/**
 * The ProseQ AI mark: a "Q" drawn as an open circle with a quill-nib tail,
 * stroked in the violet→blue brand gradient.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-8', className)} role="img" aria-label="ProseQ AI logo">
      <defs>
        <linearGradient id="proseq-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--c-violet)" />
          <stop offset="100%" stopColor="var(--c-blue)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="var(--c-bg)" stroke="var(--c-border)" strokeWidth="1.5" />
      {/* Open circle of the Q */}
      <circle
        cx="30"
        cy="29"
        r="14.5"
        fill="none"
        stroke="url(#proseq-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray="72 19"
        transform="rotate(51 30 29)"
      />
      {/* Quill tail */}
      <path
        d="M42.5 40.5 L52 51"
        stroke="url(#proseq-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Nib dot */}
      <circle cx="46.5" cy="35.5" r="2.6" fill="var(--c-blue)" />
    </svg>
  )
}

export function Logo({
  className,
  showWord = true,
  compact = false,
}: {
  className?: string
  showWord?: boolean
  compact?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={compact ? 'size-7' : 'size-8'} />
      {showWord ? (
        <span className="font-display text-[1.18rem] font-semibold tracking-tight">
          ProseQ <span className="text-gradient-brand">AI</span>
        </span>
      ) : null}
    </span>
  )
}
