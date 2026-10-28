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
    <div
      role="radiogroup"
      aria-label="Scheduling context"
      className="inline-flex rounded-full bg-track p-1"
    >
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
              'rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-settled',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
