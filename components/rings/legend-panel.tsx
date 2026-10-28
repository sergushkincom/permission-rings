import type { ReactNode } from 'react'
import type { RingKey } from '@/lib/panel-data'
import { RING_LABEL } from '@/lib/rings'
import { RingDot, SelfSetMark, TemporaryMark } from './state-mark'

type LegendPanelProps = {
  counts: Record<'any' | 'hours' | 'ask', number>
  temporary: number
  selfSet: number
}

export function LegendPanel({ counts, temporary, selfSet }: LegendPanelProps) {
  const rings: ('any' | 'hours' | 'ask')[] = ['any', 'hours', 'ask']
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[13px] leading-[18px] text-muted-foreground">Rings</h2>
      <ul className="flex flex-col">
        {rings.map((ring) => (
          <Row key={ring} mark={<RingDot ring={ring as RingKey} />} label={RING_LABEL[ring]} count={counts[ring]} />
        ))}
      </ul>
      <div className="h-px bg-hairline" />
      <ul className="flex flex-col">
        <Row mark={<TemporaryMark />} label="Temporary" count={temporary} />
        <Row mark={<SelfSetMark />} label="Set by them" count={selfSet} />
      </ul>
      <p className="pt-1 text-[13px] leading-[18px] text-muted-foreground">Select a face to see its permission.</p>
    </div>
  )
}

function Row({ mark, label, count }: { mark: ReactNode; label: string; count: number }) {
  return (
    <li className="flex h-8 items-center gap-2 text-sm leading-5 text-body">
      <span className="flex size-3 items-center justify-center">{mark}</span>
      {label}
      <span className="ml-auto tabular-nums font-medium text-foreground">{count}</span>
    </li>
  )
}
