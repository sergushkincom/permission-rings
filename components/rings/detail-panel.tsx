'use client'

import { useState } from 'react'
import type { ContextKey, RingKey, RingPolicy } from '@/lib/panel-data'
import { CONTEXTS, OUTSIDE_RINGS, PERSON_RINGS, RING_HINT, RING_LABEL, type Entity } from '@/lib/rings'
import { cn } from '@/lib/utils'

type DetailPanelProps = {
  entity: Entity | undefined
  policy: RingPolicy | undefined
  context: ContextKey
  onSetRing: (context: ContextKey, ring: RingKey) => void
}

export function DetailPanel({ entity, policy, context, onSetRing }: DetailPanelProps) {
  const [showAll, setShowAll] = useState(false)

  if (!entity || !policy) {
    return (
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Select a face to see their week and choose when the scheduler can book them.
      </p>
    )
  }

  const rings = entity.kind === 'person' ? PERSON_RINGS : OUTSIDE_RINGS
  const contextLabel = CONTEXTS.find((c) => c.key === context)?.label ?? ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-foreground">
          {entity.kind === 'person' ? entity.person.name : entity.party.name}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {entity.kind === 'person' ? `${entity.person.role} · ${entity.person.location}` : entity.party.note}
        </p>
      </div>

      {entity.kind === 'person' && (
        <>
          <dl className="grid grid-cols-2 gap-4">
            <Figure label="A week with you" value={`${entity.person.interviewHoursPerWeek} h`} />
            <Figure label="Interviews this month" value={String(entity.person.interviewsThisMonth)} />
          </dl>

          <section aria-labelledby="meetings-heading">
            <h3 id="meetings-heading" className="text-xs text-muted-foreground">
              Recurring meetings with you
            </h3>
            <ul className="mt-2 divide-y divide-hairline border-y border-hairline">
              {entity.person.meetings.map((m) => (
                <li key={m.name} className="flex items-center justify-between py-2 text-[13px]">
                  <span className="text-foreground">{m.name}</span>
                  <span className="tabular-nums text-muted-foreground">{m.length}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="policy-heading">
        <h3 id="policy-heading" className="text-xs text-muted-foreground">
          {showAll ? 'When the scheduler can book, by context' : `When the scheduler can book · ${contextLabel}`}
        </h3>

        {showAll ? (
          <PolicyGrid rings={rings} policy={policy} context={context} onSetRing={onSetRing} />
        ) : (
          <fieldset className="mt-2 flex flex-col gap-1">
            <legend className="sr-only">{`Booking permission for ${contextLabel}`}</legend>
            {rings.map((ring) => {
              const checked = policy[context] === ring
              return (
                <label
                  key={ring}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors',
                    checked ? 'border-settled/40 bg-settled-soft' : 'border-hairline hover:bg-canvas',
                  )}
                >
                  <input
                    type="radio"
                    name={`ring-${entity.id}`}
                    value={ring}
                    checked={checked}
                    onChange={() => onSetRing(context, ring)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--settled)]"
                  />
                  <span className="flex flex-col">
                    <span className={cn('text-[13px]', checked ? 'text-foreground' : 'text-foreground/80')}>
                      {RING_LABEL[ring]}
                    </span>
                    <span className="text-xs text-muted-foreground">{RING_HINT[ring]}</span>
                  </span>
                </label>
              )
            })}
          </fieldset>
        )}

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-settled underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {showAll ? `Only ${contextLabel.toLowerCase()}` : 'All contexts'}
        </button>
      </section>
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

type PolicyGridProps = {
  rings: RingKey[]
  policy: RingPolicy
  context: ContextKey
  onSetRing: (context: ContextKey, ring: RingKey) => void
}

function PolicyGrid({ rings, policy, context, onSetRing }: PolicyGridProps) {
  return (
    <table className="mt-2 w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Context
          </th>
          {rings.map((ring) => (
            <th key={ring} scope="col" className="pb-2 text-center text-xs font-normal text-muted-foreground">
              {RING_LABEL[ring]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CONTEXTS.map((c) => (
          <tr key={c.key} className="border-t border-hairline">
            <th
              scope="row"
              className={cn(
                'py-2.5 pr-2 text-left font-normal',
                c.key === context ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {c.label}
            </th>
            {rings.map((ring) => {
              const checked = policy[c.key] === ring
              return (
                <td key={ring} className="py-2.5 text-center">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={`${c.label}: ${RING_LABEL[ring]}`}
                    onClick={() => onSetRing(c.key, ring)}
                    className="inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-settled"
                  >
                    <span
                      className={cn(
                        'block rounded-full transition-all',
                        checked ? 'size-3 bg-settled' : 'size-2 border border-muted-foreground/40 hover:border-foreground/60',
                      )}
                    />
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
