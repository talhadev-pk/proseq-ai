import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onCheckedChange, label, description, className, ...rest }: SwitchProps) {
  return (
    <label className={cn('flex cursor-pointer items-start justify-between gap-4', className)}>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          aria-label={label}
          {...rest}
        />
        <span
          className={cn(
            'block h-6 w-11 rounded-full border transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet',
            checked ? 'border-violet bg-violet' : 'border-line-strong bg-sand',
          )}
        />
        <span
          className={cn(
            'absolute top-1 left-1 size-4 rounded-full bg-paper shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </label>
  )
}
