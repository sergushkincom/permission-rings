'use client'

import type { ContextKey, RingKey } from '@/lib/panel-data'
import { ENTITIES, RING_HINT, RING_LABEL, type Entity, type Policies } from '@/lib/rings'
import { cn } from '@/lib/utils'
import { StateMark } from './state-mark'

const GROUPS: RingKey[] = ['any', 'hours', 'ask', 'none']

const CHIP_TONE: Record<RingKey, string> = {
  any: 'bg-settled/10 text-settled',
  hours: 'bg-chip text-chip-foreground',
  ask: 'bg-alert/10 text-alert',
  none: 'bg-chip text-muted-foreground',
}

type SummaryPanelProps = {
  policies: Policies
  context: ContextKey
  onSelect: (id: string) => void
}

export function SummaryPanel({ policies, context, onSelect }: SummaryPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((ring) => {
        const members = ENTITIES.filter((e) => policies[e.id][context] === ring)
        if (ring === 'none' && members.length === 0) return null
        return (
          <section key={ring} aria-labelledby={`group-${ring}`} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <h2
                  id={`group-${ring}`}
                  className="flex items-center gap-2 text-base leading-6 font-semibold text-foreground"
                >
                  <StateMark ring={ring} />
                  {RING_LABEL[ring]}
                </h2>
                <span className="text-[13px] leading-[18px] tabular-nums text-muted-foreground">{members.length}</span>
              </div>
              <p className="text-[13px] leading-[18px] text-muted-foreground">{RING_HINT[ring]}</p>
            </div>
            {members.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {members.map((e) => (
                  <li key={e.id}>
                    <Chip entity={e} ring={ring} onSelect={onSelect} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] leading-[18px] text-muted-foreground">Nobody in this context</p>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Chip({ entity, ring, onSelect }: { entity: Entity; ring: RingKey; onSelect: (id: string) => void }) {
  const name = entity.kind === 'person' ? entity.person.name : entity.party.name
  return (
    <button
      type="button"
      onClick={() => onSelect(entity.id)}
      aria-label={name}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs transition-opacity outline-none hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled',
        CHIP_TONE[ring],
      )}
    >
      {entity.kind === 'person' && (
        <img src={`/faces/${entity.id}.png`} alt="" className="-ml-1 size-4 rounded-full object-cover" />
      )}
      {entity.kind === 'person' ? entity.person.name.split(' ')[0] : entity.party.name}
    </button>
  )
}
