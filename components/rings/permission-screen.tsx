'use client'

import { useState } from 'react'
import type { ContextKey, RingKey } from '@/lib/panel-data'
import { ENTITIES, describeSwitch, initialPolicies, tally, type Policies } from '@/lib/rings'
import { ContextSwitch } from './context-switch'
import { Counter } from './counter'
import { DetailPanel } from './detail-panel'
import { RingField } from './ring-field'

export function PermissionScreen() {
  const [context, setContext] = useState<ContextKey>('normal')
  const [policies, setPolicies] = useState<Policies>(initialPolicies)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stagger, setStagger] = useState(false)
  const [recent, setRecent] = useState<{ ids: string[]; version: number }>({ ids: [], version: 0 })
  const [notice, setNotice] = useState<{ text: string; id: number } | null>(null)

  const counts = tally(policies, context)
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
    if (policies[id][ctx] === ring) return
    setPolicies((prev) => ({ ...prev, [id]: { ...prev[id], [ctx]: ring } }))
    if (ctx === context) {
      setStagger(false)
      setRecent((r) => ({ ids: [id], version: r.version + 1 }))
    }
  }

  return (
    <main className="radix-wash min-h-dvh px-8 py-10 text-sm text-foreground">
      <div className="mx-auto flex max-w-[1140px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-none tracking-[-0.04em] text-balance">
              Who the scheduler can book
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">Each face sized by interview hours a week</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ContextSwitch value={context} onChange={switchContext} />
            <p aria-live="polite" className="h-4 text-xs tabular-nums text-alert">
              {notice && (
                <span key={notice.id} className="anim-notice block">
                  {notice.text}
                </span>
              )}
            </p>
          </div>
        </header>

        <dl className="grid grid-cols-3 gap-6 rounded-xl bg-card px-6 py-5 shadow-panel">
          <Counter
            label="Books over focus"
            value={counts.anyCount}
            caption={`${counts.anyHours.toFixed(1)} h of panel time a week`}
          />
          <Counter label="Waits for open time" value={counts.hoursCount} caption="Inside their working hours" />
          <Counter label="Asks you first" value={counts.askCount} caption="The scheduler sends you the request" />
        </dl>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <section
            aria-label="Booking permission rings"
            className="flex min-w-0 flex-1 justify-center overflow-x-auto rounded-xl bg-card p-4 shadow-panel"
          >
            <RingField
              context={context}
              policies={policies}
              selectedId={selectedId}
              stagger={stagger}
              recent={recent}
              onSelect={setSelectedId}
              onDrop={(id, ring) => setRing(id, context, ring)}
            />
          </section>

          <aside
            aria-label="Selected person"
            className="w-full shrink-0 rounded-xl bg-card p-5 shadow-panel lg:w-[360px]"
          >
            <DetailPanel
              key={selectedId ?? 'none'}
              entity={selected}
              policy={selectedId ? policies[selectedId] : undefined}
              context={context}
              onSetRing={(ctx, ring) => selectedId && setRing(selectedId, ctx, ring)}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}
