'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion'

type OutcomeProps = { days: number; delay: number; duration: number }

export function Outcome({ days, delay, duration }: OutcomeProps) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(days)
  const shownRef = useRef(days)
  const [target, setTarget] = useState(days)
  const [change, setChange] = useState<{ direction: 'better' | 'worse'; id: number } | null>(null)

  if (target !== days) {
    setTarget(days)
    setChange((c) => ({ direction: days < target ? 'better' : 'worse', id: (c?.id ?? 0) + 1 }))
  }

  useEffect(() => {
    const from = shownRef.current
    if (from === days) return
    if (reduced) {
      shownRef.current = days
      setShown(days)
      return
    }
    const start = performance.now() + delay
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / duration, 0), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = from + (days - from) * eased
      shownRef.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [days, delay, duration, reduced])

  const timing = { animationDelay: `${delay}ms` }

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:-ml-2.5 sm:border-l sm:border-hairline sm:pl-2.5">
      <dt className="text-[13px] leading-[18px] font-medium text-secondary-foreground">A four-person loop schedules in</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="sr-only">{`${days.toFixed(1)} days`}</span>
        <span
          key={change?.direction === 'better' ? `lift-${change.id}` : 'still'}
          aria-hidden="true"
          className={`text-[32px] leading-9 font-semibold tabular-nums text-foreground ${
            change?.direction === 'better' ? 'anim-lift' : ''
          }`}
          style={timing}
        >
          {shown.toFixed(1)}
        </span>
        <span aria-hidden="true" className="text-base leading-6 font-normal text-muted-foreground">
          days
        </span>
      </dd>
      <dd
        key={`caption-${change?.id ?? 0}`}
        className={`text-[13px] leading-[18px] font-normal text-muted-foreground ${
          change ? (change.direction === 'better' ? 'anim-caption-better' : 'anim-caption-worse') : ''
        }`}
        style={timing}
      >
        Median across the current panel
      </dd>
    </div>
  )
}
