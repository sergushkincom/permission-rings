'use client'

import { useState } from 'react'
import type { ContextKey, RingKey } from '@/lib/panel-data'
import {
  ENTITIES,
  LOCKED,
  describeSwitch,
  initialPolicies,
  loopDays,
  tally,
  untilFriday,
  type Expiry,
  type ExpiryKind,
  type Policies,
} from '@/lib/rings'
import { ContextSwitch } from './context-switch'
import { Counter } from './counter'
import { DetailPanel } from './detail-panel'
import { LegendPanel } from './legend-panel'
import { Outcome } from './outcome'
import { RequestQueue } from './request-queue'
import { RingField } from './ring-field'

export function PermissionScreen() {
  const [context, setContext] = useState<ContextKey>('normal')
  const [policies, setPolicies] = useState<Policies>(initialPolicies)
  const [expiries, setExpiries] = useState<Record<string, Expiry>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stagger, setStagger] = useState(false)
  const [recent, setRecent] = useState<{ ids: string[]; version: number }>({ ids: [], version: 0 })
  const [notice, setNotice] = useState<{ text: string; id: number } | null>(null)

  const counts = tally(policies, context)
  const days = loopDays(policies, context)
  const selected = ENTITIES.find((e) => e.id === selectedId)

  function switchContext(next: ContextKey) {
    if (next === context) return
    const { text, moved } = describeSwitch(policies, context, next)
    setStagger(true)
    setRecent((r) => ({ ids: moved, version: r.version + 1 }))
    setNotice((n) => ({ text, id: (n?.id ?? 0) + 1 }))
    setContext(next)
  }

  function setRing(id: string, ctx: ContextKey, ring: RingKey) {
    if (LOCKED.has(id) || policies[id][ctx] === ring) return
    setPolicies((prev) => ({ ...prev, [id]: { ...prev[id], [ctx]: ring } }))
    if (ctx === context) {
      setStagger(false)
      setRecent((r) => ({ ids: [id], version: r.version + 1 }))
    }
  }

  function setExpiry(id: string, kind: ExpiryKind | null) {
    if (LOCKED.has(id)) return
    setExpiries((prev) => {
      const next = { ...prev }
      if (kind) next[id] = { kind, label: untilFriday(kind) }
      else delete next[id]
      return next
    })
  }

  return (
    <main className="min-h-dvh bg-canvas px-8 py-8 text-sm leading-5 text-body">
      <div className="mx-auto flex max-w-[1096px] flex-col gap-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl leading-7 font-semibold text-balance text-foreground">Who the scheduler can book</h1>
            <p className="text-[13px] leading-[18px] text-muted-foreground">Each face sized by interview hours a week</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ContextSwitch value={context} onChange={switchContext} />
            <p aria-live="polite" className="h-[18px] text-[13px] leading-[18px] tabular-nums text-body">
              {notice && (
                <span key={notice.id} className="anim-notice flex items-center gap-2">
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-alert" />
                  {notice.text}
                </span>
              )}
            </p>
          </div>
        </header>

        <dl className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card px-5 py-4 sm:grid-cols-[1fr_1fr_1fr_1.2fr] sm:gap-5">
          <Counter
            ring="any"
            label="Books over focus"
            value={counts.anyCount}
            caption={`${counts.anyHours.toFixed(1)} h of panel time a week`}
          />
          <Counter ring="hours" label="Waits for open time" value={counts.hoursCount} caption="Inside their working hours" />
          <Counter ring="ask" label="Asks you first" value={counts.askCount} caption="The scheduler sends you the request" />
          <Outcome days={days} />
        </dl>

        <RequestQueue />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
          <section
            aria-label="Booking permission rings"
            className="flex min-w-0 justify-center overflow-x-auto rounded-xl border border-border bg-card px-5 py-4"
          >
            <RingField
              context={context}
              policies={policies}
              selectedId={selectedId}
              stagger={stagger}
              recent={recent}
              locked={LOCKED}
              expiries={expiries}
              onSelect={setSelectedId}
              onDrop={(id, ring) => setRing(id, context, ring)}
            />
          </section>

          <aside
            aria-label={selected ? 'Selected person' : 'Legend'}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            {selected && selectedId ? (
              <DetailPanel
                key={selectedId}
                entity={selected}
                policy={policies[selectedId]}
                context={context}
                locked={LOCKED.has(selectedId)}
                expiry={expiries[selectedId]}
                onSetRing={(ctx, ring) => setRing(selectedId, ctx, ring)}
                onSetExpiry={(kind) => setExpiry(selectedId, kind)}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <LegendPanel
                counts={{ any: counts.anyCount, hours: counts.hoursCount, ask: counts.askCount }}
                temporary={Object.keys(expiries).length}
                selfSet={LOCKED.size}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
