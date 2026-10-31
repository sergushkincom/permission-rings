'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'system', label: 'System theme', Icon: Monitor },
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
] as const

const noopSubscribe = () => () => {}

export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const current = mounted ? (theme ?? 'system') : null

  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn('inline-flex rounded-lg bg-track p-[2px]', className)}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = current === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              'group relative grid size-[22px] place-items-center rounded-[6px] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled',
              active ? 'bg-segment text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-full right-0 z-20 mt-2 rounded-md bg-tooltip px-2 py-1 text-xs leading-4 whitespace-nowrap text-white opacity-0 shadow-float transition-opacity delay-0 group-hover:opacity-100 group-hover:delay-300 group-focus-visible:opacity-100"
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
