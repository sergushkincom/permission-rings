'use client'

import type { ContextKey } from '@/lib/panel-data'
import { CONTEXTS } from '@/lib/rings'
import { cn } from '@/lib/utils'

type ContextSwitchProps = {
  value: ContextKey
  onChange: (next: ContextKey) => void
}

export function ContextSwitch({ value, onChange }: ContextSwitchProps) {
  return (
    <div role="radiogroup" aria-label="Scheduling context" className="inline-flex rounded-lg bg-track p-[2px]">
      {CONTEXTS.map((c) => {
        const active = c.key === value
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.key)}
            className={cn(
              'rounded-[6px] px-3 py-1 text-[13px] leading-[18px] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled',
              active ? 'bg-segment font-semibold text-foreground shadow-xs' : 'font-normal text-body hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
