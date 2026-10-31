'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { people, requests as initialRequests } from '@/lib/panel-data'
import { cn } from '@/lib/utils'

export function ActionBar({ starting, onStart }: { starting: boolean; onStart: () => void }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialRequests)
  const listId = useId()

  const count = items.length
  const remove = (id: string) => setItems((list) => list.filter((r) => r.id !== id))

  return (
    <section aria-label="Requests and loops" className="rounded-xl border border-border bg-card">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-settled"
          >
            <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-full', count ? 'bg-alert' : 'bg-strong')} />
            <span aria-live="polite" className="text-sm leading-5 font-medium tabular-nums text-foreground">
              {count === 0 ? 'No requests waiting' : `${count} ${count === 1 ? 'request' : 'requests'} waiting`}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
            />
            <span className="sr-only">{open ? 'Hide requests' : 'Show requests'}</span>
          </button>

          <span aria-hidden="true" className="hidden h-5 w-px bg-hairline sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-settled" />
            <span className="whitespace-nowrap text-sm leading-5 font-semibold text-foreground">3 loops waiting</span>
            <span className="truncate text-[13px] leading-[18px] text-muted-foreground">
              Backend, Design systems, Product manager
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          aria-busy={starting}
          className="grid h-9 shrink-0 items-center rounded-lg bg-primary px-4 text-sm leading-5 font-semibold text-primary-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled disabled:cursor-default"
        >
          <span
            aria-hidden={starting}
            className={cn('[grid-area:1/1] transition-opacity duration-200', starting && 'opacity-0')}
          >
            Let the scheduler start
          </span>
          <span
            aria-hidden={!starting}
            className={cn('[grid-area:1/1] text-center transition-opacity duration-200', !starting && 'opacity-0')}
          >
            {'Starting…'}
          </span>
        </button>
      </div>

      {open && (
        <ul id={listId} className="divide-y divide-hairline border-t border-hairline">
          {items.length === 0 && (
            <li className="px-5 py-3 text-[13px] leading-[18px] text-muted-foreground">
              Nothing waiting. Ask-first requests land here.
            </li>
          )}
          {items.map((r) => {
            const interviewer = people.find((p) => p.id === r.interviewerId)
            return (
              <li
                key={r.id}
                className="grid grid-cols-1 items-center gap-2 px-5 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-4"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm leading-5 font-medium text-foreground">{r.candidate}</span>
                  <span className="truncate text-[13px] leading-[18px] text-muted-foreground">{r.role}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    src={`/faces/${r.interviewerId}.png`}
                    alt=""
                    className="size-6 shrink-0 rounded-full border-2 border-alert object-cover"
                  />
                  <span className="truncate text-sm leading-5 text-body">{interviewer?.name}</span>
                </div>
                <span className="text-sm leading-5 tabular-nums text-body">{r.slot}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    aria-label={`Approve ${r.candidate} with ${interviewer?.name}`}
                    className="text-[13px] leading-[18px] font-semibold text-settled underline-offset-4 outline-none hover:underline focus-visible:underline"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    aria-label={`Decline ${r.candidate} with ${interviewer?.name}`}
                    className="text-[13px] leading-[18px] font-medium text-body underline-offset-4 outline-none hover:underline focus-visible:underline"
                  >
                    Decline
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
