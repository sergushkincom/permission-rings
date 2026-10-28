import type { RingKey } from '@/lib/panel-data'
import { cn } from '@/lib/utils'

const MARK: Record<RingKey, string> = {
  any: 'border-2 border-settled bg-settled-soft',
  hours: 'border border-strong',
  ask: 'border-[1.5px] border-dashed border-alert',
  none: 'bg-strong',
}

export function StateMark({ ring, className }: { ring: RingKey; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-3 shrink-0 rounded-full', MARK[ring], className)} />
}
