import type { RingKey } from '@/lib/panel-data'
import { RollingNumber } from './rolling-number'
import { StateMark } from './state-mark'

type CounterProps = {
  ring: RingKey
  label: string
  value: number
  caption: string
  delay: number
}

export function Counter({ ring, label, value, caption, delay }: CounterProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="flex items-center gap-2 text-[13px] leading-[18px] text-muted-foreground">
        <StateMark ring={ring} />
        {label}
      </dt>
      <dd className="text-[32px] leading-9 font-semibold tabular-nums text-foreground">
        <RollingNumber value={value} delay={delay} />
      </dd>
      <dd className="text-[13px] leading-[18px] tabular-nums text-muted-foreground">{caption}</dd>
    </div>
  )
}
