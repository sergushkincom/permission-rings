'use client'

import { useState } from 'react'

type ShiftingTextProps = {
  value: string
  rank?: number
  before?: string
  after?: string
  className?: string
}

export function ShiftingText({ value, rank = 0, before = '', after = '', className = '' }: ShiftingTextProps) {
  const [seen, setSeen] = useState({ value, rank })
  const [previous, setPrevious] = useState<string | null>(null)
  const [direction, setDirection] = useState<'better' | 'worse' | null>(null)
  const [version, setVersion] = useState(0)

  if (seen.value !== value) {
    setPrevious(seen.value)
    setDirection(rank < seen.rank ? 'better' : rank > seen.rank ? 'worse' : null)
    setSeen({ value, rank })
    setVersion((v) => v + 1)
  }

  const flash = version > 0 && direction ? (direction === 'better' ? 'anim-flash-better' : 'anim-flash-worse') : ''

  return (
    <span key={version} className={`${className} ${flash}`}>
      {before}
      <span className="relative inline-block tabular-nums">
        {previous !== null && version > 0 && (
          <span
            key={`out-${version}`}
            aria-hidden="true"
            className="anim-number-out absolute top-0 left-0 whitespace-nowrap"
          >
            {previous}
          </span>
        )}
        <span key={`in-${version}`} className={`inline-block ${version > 0 ? 'anim-number-in' : ''}`}>
          {value}
        </span>
      </span>
      {after}
    </span>
  )
}
