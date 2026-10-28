'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ContextKey, RingKey, RingPolicy } from '@/lib/panel-data'
import {
  CONTEXTS,
  OUTSIDE_RINGS,
  PERSON_RINGS,
  RING_HINT,
  RING_LABEL,
  type Entity,
  type Expiry,
  type ExpiryKind,
} from '@/lib/rings'
import { cn } from '@/lib/utils'
import { StateMark } from './state-mark'

const EXPIRY_OPTIONS: { key: ExpiryKind | 'none'; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'two', label: 'Two weeks' },
  { key: 'none', label: 'No end date' },
]

type DetailPanelProps = {
  entity: Entity
  policy: RingPolicy
  context: ContextKey
  locked: boolean
  expiry: Expiry | undefined
  onSetRing: (context: ContextKey, ring: RingKey) => void
  onSetExpiry: (kind: ExpiryKind | null) => void
  onClose: () => void
}

export function DetailPanel({
  entity,
  policy,
  context,
  locked,
  expiry,
  onSetRing,
  onSetExpiry,
  onClose,
}: DetailPanelProps) {
  const [showAll, setShowAll] = useState(false)

  const rings = entity.kind === 'person' ? PERSON_RINGS : OUTSIDE_RINGS
  const contextLabel = CONTEXTS.find((c) => c.key === context)?.label ?? ''
  const name = entity.kind === 'person' ? entity.person.name : entity.party.name
  const firstName = name.split(' ')[0]
  const isPerson = entity.kind === 'person'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        {isPerson && <img src={`/faces/${entity.id}.png`} alt="" className="size-10 shrink-0 rounded-full object-cover" />}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base leading-6 font-semibold text-foreground">{name}</h2>
            {expiry && (
              <span className="inline-flex h-5 items-center rounded-full bg-chip px-2 text-xs leading-4 tabular-nums text-chip-foreground">
                {expiry.label}
              </span>
            )}
          </div>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            {entity.kind === 'person' ? `${entity.person.role} · ${entity.person.location}` : entity.party.note}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and show legend"
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
        <div className="flex items-center justify-between gap-2">
          <h3 id="policy-heading" className="text-[13px] leading-[18px] text-muted-foreground">
            {showAll ? 'When the scheduler can book, by context' : `When the scheduler can book · ${contextLabel}`}
          </h3>
          {isPerson && (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-chip px-2 text-xs leading-4 text-chip-foreground">
              {locked ? 'Set by them' : 'Set by you'}
            </span>
          )}
        </div>

        {showAll ? (
          <PolicyGrid rings={rings} policy={policy} context={context} disabled={locked} onSetRing={onSetRing} />
        ) : (
          <fieldset disabled={locked} className="flex flex-col gap-2">
            <legend className="sr-only">{`Booking permission for ${contextLabel}`}</legend>
            {rings.map((ring) => {
              const checked = policy[context] === ring
              return (
                <label
                  key={ring}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-settled',
                    checked ? 'border-settled bg-settled-soft' : 'border-hairline',
                    locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    !checked && !locked && 'hover:bg-canvas',
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
                    <span className={cn('text-sm leading-5', checked ? 'font-semibold text-foreground' : 'text-body')}>
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

        {locked && (
          <p className="text-[13px] leading-[18px] text-muted-foreground">{`Only ${firstName} can change this.`}</p>
        )}

        {isPerson && (
          <fieldset disabled={locked} className="flex flex-col gap-2 pt-1">
            <legend className="sr-only">Permission ends</legend>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((opt) => {
                const checked = (expiry?.kind ?? 'none') === opt.key
                return (
                  <label
                    key={opt.key}
                    className={cn(
                      'inline-flex h-7 items-center rounded-full border px-3 text-[13px] leading-[18px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-settled',
                      checked
                        ? 'border-settled bg-settled-soft font-medium text-foreground'
                        : 'border-hairline text-body',
                      locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                      !checked && !locked && 'hover:bg-canvas',
                    )}
                  >
                    <input
                      type="radio"
                      name={`expiry-${entity.id}`}
                      value={opt.key}
                      checked={checked}
                      onChange={() => onSetExpiry(opt.key === 'none' ? null : opt.key)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              A permission with no end date is one nobody revisits.
            </p>
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
  disabled: boolean
  onSetRing: (context: ContextKey, ring: RingKey) => void
}

function PolicyGrid({ rings, policy, context, disabled, onSetRing }: PolicyGridProps) {
  return (
    <table className={cn('w-full border-collapse text-sm leading-5', disabled && 'opacity-60')}>
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
                    disabled={disabled}
                    onClick={() => onSetRing(c.key, ring)}
                    className="inline-flex size-6 items-center justify-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-settled disabled:cursor-not-allowed"
                  >
                    <span
                      className={cn(
                        'block rounded-full transition-all',
                        checked ? 'size-3 bg-settled' : 'size-2 border border-strong',
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
