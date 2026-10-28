import { X } from 'lucide-react'
import type { ContextKey } from '@/lib/panel-data'
import { WITHDRAWN_NOTE, bestUnblock, candidateStates, formatWait } from '@/lib/candidates'
import { RING_LABEL, initials, type Policies } from '@/lib/rings'
import { cn } from '@/lib/utils'

const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four', 'five']

type CandidatesPanelProps = {
  policies: Policies
  context: ContextKey
  onSpotlight: (ids: string[] | null) => void
  onPickPerson: (id: string) => void
  onClose: () => void
}

export function CandidatesPanel({ policies, context, onSpotlight, onPickPerson, onClose }: CandidatesPanelProps) {
  const rows = candidateStates(policies, context)
  const waiting = rows.filter((r) => r.state === 'waiting')

  if (waiting.length === 0) {
    return <p className="text-sm leading-5 text-foreground">Nobody is waiting.</p>
  }

  const longest = Math.max(...waiting.map((r) => r.waitDays))
  const unblock = bestUnblock(rows, policies, context)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base leading-6 font-semibold text-foreground">Candidates in flight</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and show legend"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-track hover:text-foreground focus-visible:outline-2 focus-visible:outline-settled"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-[13px] leading-[18px] text-muted-foreground">Waiting now</dt>
          <dd className="text-xl leading-7 font-semibold tabular-nums text-foreground">{waiting.length}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[13px] leading-[18px] text-muted-foreground">Longest wait</dt>
          <dd className="text-xl leading-7 font-semibold tabular-nums text-alert">{formatWait(longest)}</dd>
        </div>
      </dl>

      <ul className="divide-y divide-hairline border-y border-hairline">
        {rows.map((c) => (
          <li
            key={c.id}
            tabIndex={0}
            aria-label={`${c.name}, ${c.role}, ${c.stage}. ${c.label}`}
            onPointerEnter={() => onSpotlight(c.waitingOn.length ? c.waitingOn : null)}
            onPointerLeave={() => onSpotlight(null)}
            onFocus={() => onSpotlight(c.waitingOn.length ? c.waitingOn : null)}
            onBlur={() => onSpotlight(null)}
            className="flex items-center gap-3 py-3 outline-none focus-visible:bg-track"
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chip text-xs leading-4 font-semibold text-chip-foreground"
            >
              {initials(c.name)}
            </span>
            <div aria-hidden="true" className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm leading-5 font-semibold text-foreground">{c.name}</span>
              <span className="text-[13px] leading-[18px] text-muted-foreground">{`${c.role} · ${c.stage}`}</span>
            </div>
            <span
              aria-hidden="true"
              className={cn(
                'max-w-[42%] shrink-0 text-right text-[13px] leading-[18px] tabular-nums',
                c.state === 'waiting' && c.waitDays > 7
                  ? 'text-alert'
                  : c.state === 'waiting'
                    ? 'text-body'
                    : 'text-settled',
              )}
            >
              {c.label}
            </span>
          </li>
        ))}
      </ul>

      {unblock && (
        <p className="text-[13px] leading-[18px] text-foreground">
          {'Moving '}
          <button
            type="button"
            onPointerEnter={() => onSpotlight([unblock.id])}
            onPointerLeave={() => onSpotlight(null)}
            onFocus={() => onSpotlight([unblock.id])}
            onBlur={() => onSpotlight(null)}
            onClick={() => {
              onSpotlight(null)
              onPickPerson(unblock.id)
            }}
            className="font-semibold text-settled underline underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled"
          >
            {unblock.person.name}
          </button>
          {` to ${unblock.nextRing === 'hours' ? 'open hours' : RING_LABEL[unblock.nextRing].toLowerCase()} would unblock ${
            NUMBER_WORDS[unblock.count] ?? unblock.count
          } of these.`}
        </p>
      )}

      <p className="rounded-lg bg-alert-soft p-3 text-[13px] leading-[18px] text-alert">{WITHDRAWN_NOTE}</p>
    </div>
  )
}
