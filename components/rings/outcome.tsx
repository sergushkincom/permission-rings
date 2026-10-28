'use client'

import { useState } from 'react'

export function Outcome({ days }: { days: number }) {
  const [seen, setSeen] = useState(days)
  const [previous, setPrevious] = useState<number | null>(null)
  const [direction, setDirection] = useState<'better' | 'worse' | null>(null)
  const [version, setVersion] = useState(0)

  if (seen !== days) {
    setPrevious(seen)
    setDirection(days < seen ? 'better' : 'worse')
    setSeen(days)
    setVersion((v) => v + 1)
  }

  return (
    <div className="flex flex-col gap-1 sm:border-l sm:border-hairline sm:pl-5">
      <dt className="text-[13px] leading-[18px] text-muted-foreground">A four-person loop schedules in</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="grid text-[32px] leading-9 font-semibold tabular-nums text-foreground">
          {previous !== null && version > 0 && (
            <span key={`out-${version}`} aria-hidden="true" className="anim-number-out [grid-area:1/1]">
              {previous.toFixed(1)}
            </span>
          )}
          <span key={`in-${version}`} className={`[grid-area:1/1] ${version > 0 ? 'anim-number-in' : ''}`}>
            {days.toFixed(1)}
          </span>
        </span>
        <span className="text-sm leading-5 font-medium text-muted-foreground">days</span>
      </dd>
      <dd
        key={`caption-${version}`}
        className={`text-[13px] leading-[18px] text-muted-foreground ${
          direction === 'better' ? 'anim-caption-better' : direction === 'worse' ? 'anim-caption-worse' : ''
        }`}
      >
        Median across the current panel
      </dd>
    </div>
  )
}
