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

const FIGURE = /(\d+(?:\.\d+)?(?:\s?(?:h|days?|min)\b)?)/

export function StatCaption({ text }: { text: string }) {
  return (
    <>
      {text.split(FIGURE).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-medium text-secondary-foreground">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function Counter({ ring, label, value, caption, delay }: CounterProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="flex items-center gap-2 text-[13px] leading-[18px] font-medium text-secondary-foreground">
        <StateMark ring={ring} />
        {label}
      </dt>
      <dd className="text-[32px] leading-9 font-semibold tabular-nums text-foreground">
        <RollingNumber value={value} delay={delay} />
      </dd>
      <dd className="text-[13px] leading-[18px] font-normal tabular-nums text-muted-foreground">
        <StatCaption text={caption} />
      </dd>
    </div>
  )
}
