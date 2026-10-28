'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ContextKey, RingKey, RingPolicy } from '@/lib/panel-data'
import { CONTEXTS, OUTSIDE_RINGS, PERSON_RINGS, RING_HINT, RING_LABEL, type Entity } from '@/lib/rings'
import { cn } from '@/lib/utils'
import { StateMark } from './state-mark'

type DetailPanelProps = {
  entity: Entity
  policy: RingPolicy
  context: ContextKey
  onSetRing: (context: ContextKey, ring: RingKey) => void
  onClose: () => void
}

export function DetailPanel({ entity, policy, context, onSetRing, onClose }: DetailPanelProps) {
  const [showAll, setShowAll] = useState(false)

  const rings = entity.kind === 'person' ? PERSON_RINGS : OUTSIDE_RINGS
  const contextLabel = CONTEXTS.find((c) => c.key === context)?.label ?? ''
  const name = entity.kind === 'person' ? entity.person.name : entity.party.name

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        {entity.kind === 'person' && (
          <img src={`/faces/${entity.id}.png`} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-base leading-6 font-semibold text-foreground">{name}</h2>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            {entity.kind === 'person' ? `${entity.person.role} · ${entity.person.location}` : entity.party.note}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and show summary"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-track hover:text-foreground focus-visible:outline-2 focus-visible:outline-settled"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {entity.kind === 'person' && (
        <>
          <dl className="grid grid-cols-2 gap-4">
            <Figure label="A week with you" value={`${entity.person.interviewHoursPerWeek} h`} />
            <Figure label="Interviews this month" value={String(entity.person.interviewsThisMonth)} />
          </dl>

          <section aria-labelledby="meetings-heading" className="flex flex-col gap-3">
            <h3 id="meetings-heading" className="text-[13px] leading-[18px] text-muted-foreground">
              Recurring meetings with you
            </h3>
            <ul className="divide-y divide-hairline border-y border-hairline">
              {entity.person.meetings.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-4 py-2 text-sm leading-5">
                  <span className="text-foreground">{m.name}</span>
                  <span className="tabular-nums text-muted-foreground">{m.length}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="policy-heading" className="flex flex-col gap-3">
        <h3 id="policy-heading" className="text-[13px] leading-[18px] text-muted-foreground">
          {showAll ? 'When the scheduler can book, by context' : `When the scheduler can book · ${contextLabel}`}
        </h3>

        {showAll ? (
          <PolicyGrid rings={rings} policy={policy} context={context} onSetRing={onSetRing} />
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{`Booking permission for ${contextLabel}`}</legend>
            {rings.map((ring) => {
              const checked = policy[context] === ring
              return (
                <label
                  key={ring}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-settled',
                    checked ? 'border-settled bg-settled-soft' : 'border-hairline hover:bg-canvas',
                  )}
                >
                  <input
                    type="radio"
                    name={`ring-${entity.id}`}
                    value={ring}
                    checked={checked}
                    onChange={() => onSetRing(context, ring)}
                    className="sr-only"
                  />
                  <StateMark ring={ring} className="mt-1" />
                  <span className="flex flex-1 flex-col">
                    <span
                      className={cn('text-sm leading-5', checked ? 'font-semibold text-foreground' : 'text-body')}
                    >
                      {RING_LABEL[ring]}
                    </span>
                    <span className="text-[13px] leading-[18px] text-muted-foreground">{RING_HINT[ring]}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border',
                      checked ? 'border-settled' : 'border-strong',
                    )}
                  >
                    {checked && <span className="size-2 rounded-full bg-settled" />}
                  </span>
                </label>
              )
            })}
          </fieldset>
        )}

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="self-start text-[13px] leading-[18px] text-settled underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          {showAll ? `Only ${contextLabel.toLowerCase()}` : 'All contexts'}
        </button>
      </section>
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[13px] leading-[18px] text-muted-foreground">{label}</dt>
      <dd className="text-base leading-6 font-semibold tabular-nums text-foreground">{value}</dd>
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
    <table className="w-full border-collapse text-sm leading-5">
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Context
          </th>
          {rings.map((ring) => (
            <th
              key={ring}
              scope="col"
              className="pb-2 text-center text-[13px] leading-[18px] font-normal text-muted-foreground"
            >
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
                'py-2 pr-2 text-left',
                c.key === context ? 'font-semibold text-foreground' : 'font-normal text-body',
              )}
            >
              {c.label}
            </th>
            {rings.map((ring) => {
              const checked = policy[c.key] === ring
              return (
                <td key={ring} className="py-2 text-center">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={`${c.label}: ${RING_LABEL[ring]}`}
                    onClick={() => onSetRing(c.key, ring)}
                    className="inline-flex size-6 items-center justify-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-settled"
                  >
                    <span
                      className={cn(
                        'block rounded-full transition-all',
                        checked ? 'size-3 bg-settled' : 'size-2 border border-strong hover:border-muted-foreground',
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
