import type { RingKey } from '@/lib/panel-data'
import { cn } from '@/lib/utils'

const MARK: Record<RingKey, string> = {
  any: 'border-2 border-settled',
  hours: 'border-2 border-strong',
  ask: 'border-2 border-alert',
  none: 'bg-strong',
}

export function StateMark({ ring, className }: { ring: RingKey; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-3 shrink-0 rounded-full', MARK[ring], className)} />
}

export function RingDot({ ring, className }: { ring: RingKey; className?: string }) {
  const tone: Record<RingKey, string> = {
    any: 'bg-settled',
    hours: 'bg-strong',
    ask: 'bg-alert',
    none: 'bg-strong',
  }
  return <span aria-hidden="true" className={cn('inline-block size-2.5 shrink-0 rounded-full', tone[ring], className)} />
}

export function TemporaryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={cn('size-3 shrink-0', className)}>
      <path
        d="M 1.76 1.76 A 6 6 0 0 1 10.24 1.76"
        transform="translate(0 2)"
        fill="none"
        stroke="var(--body)"
        strokeWidth="1.5"
        strokeDasharray="2 1.5"
      />
      <circle cx="6" cy="7.5" r="3.5" fill="var(--strong)" />
    </svg>
  )
}

export function SelfSetMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex size-3 shrink-0 rounded-full border-[1.5px] border-body p-px', className)}
    >
      <span className="size-full rounded-full bg-strong" />
    </span>
  )
}
