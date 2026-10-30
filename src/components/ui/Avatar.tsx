import { initialsOf, cn } from '@/lib/utils'

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-16 text-xl',
  }
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 select-none items-center justify-center rounded-full border border-line bg-gradient-to-br from-violet-soft to-blue-soft font-semibold text-violet-deep',
        sizes[size],
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
