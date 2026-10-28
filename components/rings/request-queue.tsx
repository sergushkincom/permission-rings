'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { people, requests as initialRequests } from '@/lib/panel-data'
import { cn } from '@/lib/utils'

export function RequestQueue() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialRequests)
  const listId = useId()

  const count = items.length
  const remove = (id: string) => setItems((list) => list.filter((r) => r.id !== id))

  return (
    <section aria-label="Ask-first requests" className="rounded-xl border border-border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between gap-4 rounded-xl px-5 outline-none focus-visible:outline-2 focus-visible:outline-settled"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className={cn('size-2 rounded-full', count ? 'bg-alert' : 'bg-strong')} />
          <span aria-live="polite" className="text-sm leading-5 font-semibold tabular-nums text-foreground">
            {count === 0 ? 'No requests waiting' : `${count} ${count === 1 ? 'request' : 'requests'} waiting`}
          </span>
        </span>
        <span className="flex items-center gap-1 text-[13px] leading-[18px] text-muted-foreground">
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
          />
          {open ? 'Close' : 'Open'}
        </span>
      </button>

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
