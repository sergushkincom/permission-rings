'use client'

import { useState } from 'react'
import type { RingKey } from '@/lib/panel-data'
import { StateMark } from './state-mark'

type CounterProps = {
  ring: RingKey
  label: string
  value: number
  caption: string
}

export function Counter({ ring, label, value, caption }: CounterProps) {
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
      <dt className="flex items-center gap-2 text-[13px] leading-[18px] text-muted-foreground">
        <StateMark ring={ring} />
        {label}
      </dt>
      <dd className="grid text-[32px] leading-9 font-semibold tabular-nums text-foreground">
        {previousValue !== null && version > 0 && (
          <span key={`out-${version}`} aria-hidden="true" className="anim-number-out [grid-area:1/1]">
            {previousValue}
          </span>
        )}
        <span key={`in-${version}`} className={`[grid-area:1/1] ${version > 0 ? 'anim-number-in' : ''}`}>
          {value}
        </span>
      </dd>
      <dd className="flex items-center gap-2 text-[13px] leading-[18px] tabular-nums text-muted-foreground">
        {caption}
        {version > 0 && (
          <span
            key={`changed-${version}`}
            aria-hidden="true"
            className="anim-moved-flash size-1.5 shrink-0 rounded-full bg-alert"
          />
        )}
      </dd>
    </div>
  )
}
