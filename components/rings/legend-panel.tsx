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
  const rings = (['any', 'hours', 'ask'] as const).filter((ring) => counts[ring] > 0)
  const markers = [
    { key: 'temporary', mark: <TemporaryMark />, label: 'Temporary', count: temporary },
    { key: 'self', mark: <SelfSetMark />, label: 'Set by them', count: selfSet },
  ].filter((m) => m.count > 0)
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[13px] leading-[18px] text-muted-foreground">Rings</h2>
      {rings.length > 0 && (
        <ul className="flex flex-col">
          {rings.map((ring) => (
            <Row key={ring} mark={<RingDot ring={ring as RingKey} />} label={RING_LABEL[ring]} count={counts[ring]} />
          ))}
        </ul>
      )}
      {rings.length > 0 && markers.length > 0 && <div className="h-px bg-hairline" />}
      {markers.length > 0 && (
        <ul className="flex flex-col">
          {markers.map((m) => (
            <Row key={m.key} mark={m.mark} label={m.label} count={m.count} />
          ))}
        </ul>
      )}
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
