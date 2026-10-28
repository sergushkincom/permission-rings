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
      className="inline-flex rounded-md border border-hairline bg-card p-0.5"
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
              'rounded-[5px] px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-settled',
              active
                ? 'bg-canvas text-foreground shadow-[0_0_0_1px_var(--hairline)]'
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
