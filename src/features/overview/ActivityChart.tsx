import { useReducedMotion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Datum {
  day: string
  words: number
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string | number
}) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value
  const d = typeof label === 'string' ? label : ''
  const pretty = new Date(d + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return (
    <div className="rounded-lg border border-line bg-paper px-3 py-2 text-xs shadow-lifted">
      <p className="font-semibold text-ink">{pretty}</p>
      <p className="mt-0.5 text-muted">{value} words (demo)</p>
    </div>
  )
}

export default function ActivityChart({ data }: { data: Datum[] }) {
  const reduced = useReducedMotion()
  return (
    <div className="h-64 w-full" role="img" aria-label="Illustrative writing activity for the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-violet)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--c-violet)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(v: string) => new Date(v + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric' })}
            tick={{ fontSize: 11, fill: 'var(--c-faint)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--c-faint)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--c-border-strong)' }} />
          <Area
            type="monotone"
            dataKey="words"
            stroke="var(--c-violet)"
            strokeWidth={2.5}
            fill="url(#activity-fill)"
            isAnimationActive={!reduced}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
