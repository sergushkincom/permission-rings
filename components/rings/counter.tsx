'use client'

import { useState } from 'react'

type CounterProps = {
  label: string
  value: number
  caption: string
}

export function Counter({ label, value, caption }: CounterProps) {
  const [seen, setSeen] = useState({ value, caption })
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [version, setVersion] = useState(0)

  if (seen.value !== value || seen.caption !== caption) {
    setPreviousValue(seen.value !== value ? seen.value : null)
    setSeen({ value, caption })
    setVersion((v) => v + 1)
  }

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="grid text-4xl font-medium leading-tight tracking-tight tabular-nums text-foreground">
        {previousValue !== null && version > 0 && (
          <span key={`out-${version}`} aria-hidden="true" className="anim-number-out [grid-area:1/1]">
            {previousValue}
          </span>
        )}
        <span key={`in-${version}`} className={`[grid-area:1/1] ${version > 0 ? 'anim-number-in' : ''}`}>
          {value}
        </span>
      </dd>
      <dd
        key={`caption-${version}`}
        className={`text-[13px] tabular-nums text-muted-foreground ${version > 0 ? 'anim-caption-flash' : ''}`}
      >
        {caption}
      </dd>
    </div>
  )
}
