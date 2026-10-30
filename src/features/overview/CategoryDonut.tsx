import { useReducedMotion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface Datum {
  name: string
  value: number
  color: string
}

export default function CategoryDonut({ data }: { data: Datum[] }) {
  const reduced = useReducedMotion()

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="text-sm text-muted">No categories to chart yet.</p>
        <p className="mt-1 text-xs text-faint">Create documents and they will group here.</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex h-64 flex-col">
      <div className="flex-1" role="img" aria-label="Documents grouped by category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive={!reduced}
              animationDuration={800}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                const p = payload[0]
                const name = String(p.name ?? '')
                const value = Number(p.value ?? 0)
                return (
                  <div className="rounded-lg border border-line bg-paper px-3 py-2 text-xs shadow-lifted">
                    <p className="font-semibold capitalize text-ink">{name}</p>
                    <p className="mt-0.5 text-muted">
                      {value} doc{value === 1 ? '' : 's'} · {Math.round((value / total) * 100)}%
                    </p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-1.5 text-[11px] capitalize text-muted">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
            {d.name} · {d.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
