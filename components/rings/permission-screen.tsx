'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContextKey, RingKey } from '@/lib/panel-data'
import { stepInward, waitingCount } from '@/lib/candidates'
import { TIMING } from '@/lib/motion'
import {
  CONTEXTS,
  ENTITIES,
  FIELD,
  LOCKED,
  RING_LABEL,
  describeSwitch,
  initialPolicies,
  loopDays,
  tally,
  untilFriday,
  type Entity,
  type Expiry,
  type ExpiryKind,
  type Policies,
} from '@/lib/rings'
import { cn } from '@/lib/utils'
import { CandidatesPanel } from './candidates-panel'
import { ContextSwitch } from './context-switch'
import { Counter } from './counter'
import { DetailPanel } from './detail-panel'
import { FitToWidth } from './fit-to-width'
import { LegendPanel } from './legend-panel'
import { Outcome } from './outcome'
import { ActionBar } from './action-bar'
import { RingField } from './ring-field'
import { UndoBar } from './undo-bar'

type Snapshot = { policies: Policies; expiries: Record<string, Expiry> }
type Toast = { id: number; text: string; before: Snapshot }

const SWITCH_DURATION = TIMING.travel + TIMING.travelStagger * (ENTITIES.length - 1)

const entityName = (e: Entity | undefined) => (e ? (e.kind === 'person' ? e.person.name : e.party.name) : '')

export function PermissionScreen() {
  const router = useRouter()
  const [context, setContext] = useState<ContextKey>('normal')
  const [policies, setPolicies] = useState<Policies>(initialPolicies)
  const [expiries, setExpiries] = useState<Record<string, Expiry>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [motion, setMotion] = useState<'drop' | 'switch'>('drop')
  const [landed, setLanded] = useState<{ ring: RingKey; version: number } | null>(null)
  const [notice, setNotice] = useState<{ text: string; id: number } | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [spotlight, setSpotlight] = useState<string[] | null>(null)
  const [starting, setStarting] = useState(false)

  const counts = tally(policies, context)
  const days = loopDays(policies, context)
  const waiting = waitingCount(policies, context)
  const selected = ENTITIES.find((e) => e.id === selectedId)
  const candidatesSelected = selected?.kind === 'outside' && selected.party.kind === 'candidates'
  const contextLabel = (ctx: ContextKey) => CONTEXTS.find((c) => c.key === ctx)?.label ?? ''

  function announce(text: string) {
    setToast((t) => ({ id: (t?.id ?? 0) + 1, text, before: { policies, expiries } }))
  }

  function switchContext(next: ContextKey) {
    if (next === context) return
    const { text } = describeSwitch(policies, context, next)
    setMotion('switch')
    setNotice((n) => ({ text, id: (n?.id ?? 0) + 1 }))
    setContext(next)
  }

  function setRing(id: string, ctx: ContextKey, ring: RingKey) {
    if (LOCKED.has(id) || policies[id][ctx] === ring) return
    setPolicies((prev) => ({ ...prev, [id]: { ...prev[id], [ctx]: ring } }))
    const until = expiries[id] ? ` ${expiries[id].label}` : ''
    const where = ctx === context ? '' : ` in ${contextLabel(ctx)}`
    announce(`${entityName(ENTITIES.find((e) => e.id === id))} moved to ${RING_LABEL[ring]}${until}${where}.`)
    if (ctx === context) {
      setMotion('drop')
      setLanded((l) => ({ ring, version: (l?.version ?? 0) + 1 }))
    }
  }

  function setExpiry(id: string, kind: ExpiryKind | null) {
    if (LOCKED.has(id)) return
    const next = { ...expiries }
    if (kind) next[id] = { kind, label: untilFriday(kind) }
    else delete next[id]
    setExpiries(next)
    const name = entityName(ENTITIES.find((e) => e.id === id))
    const ring = RING_LABEL[policies[id][context]]
    announce(kind ? `${name} stays in ${ring} ${next[id].label}.` : `${name} stays in ${ring} with no end date.`)
  }

  function undo() {
    if (!toast) return
    setMotion('drop')
    setPolicies(toast.before.policies)
    setExpiries(toast.before.expiries)
    setToast(null)
  }

  function pickPerson(id: string) {
    setSelectedId(id)
    setRing(id, context, stepInward(policies[id][context]))
  }

  function start() {
    if (starting) return
    setStarting(true)
    setToast(null)
    router.prefetch('/loop')
    setTimeout(() => router.push('/loop'), 600)
  }

  return (
    <main className="min-h-dvh bg-canvas px-4 pt-6 pb-24 sm:px-8 sm:pt-8 text-sm leading-5 text-body">
      <div className="mx-auto flex max-w-[946px] flex-col gap-4">
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

        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-border bg-card px-4 py-4 sm:grid-cols-4 sm:gap-5 sm:px-5">
          <Counter
            ring="any"
            label="Books over focus"
            value={counts.anyCount}
            delay={motion === 'drop' ? TIMING.counterDelay : 0}
            caption={`${counts.anyHours.toFixed(1)} h of panel time a week`}
          />
          <Counter
            ring="hours"
            label="Waits for open time"
            value={counts.hoursCount}
            delay={motion === 'drop' ? TIMING.counterDelay : 0}
            caption="Inside their working hours"
          />
          <Counter
            ring="ask"
            label="Asks you first"
            value={counts.askCount}
            delay={motion === 'drop' ? TIMING.counterDelay : 0}
            caption="It sends you the request"
          />
          <Outcome
            days={days}
            delay={motion === 'drop' ? TIMING.daysDelay : 0}
            duration={motion === 'drop' ? TIMING.count : SWITCH_DURATION}
          />
        </dl>

        <ActionBar starting={starting} onStart={start} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <section
            aria-label="Booking permission rings"
            className={cn(
              'flex w-full justify-center rounded-xl border border-border bg-card transition-opacity duration-300 lg:w-auto lg:shrink-0',
              starting && 'opacity-50',
            )}
          >
            <FitToWidth size={FIELD}>
            <RingField
              context={context}
              policies={policies}
              selectedId={selectedId}
              stagger={motion === 'switch'}
              landed={landed}
              spotlight={spotlight}
              candidateCount={waiting}
              locked={LOCKED}
              expiries={expiries}
              onSelect={setSelectedId}
              onDrop={(id, ring) => setRing(id, context, ring)}
            />
            </FitToWidth>
          </section>

          <aside
            aria-label={candidatesSelected ? 'Candidates in flight' : selected ? 'Selected person' : 'Legend'}
            className="min-w-0 rounded-xl border border-border bg-card px-4 py-3 lg:flex-1 lg:self-start"
          >
            {candidatesSelected ? (
              <CandidatesPanel
                policies={policies}
                context={context}
                onSpotlight={setSpotlight}
                onPickPerson={pickPerson}
                onClose={() => setSelectedId(null)}
              />
            ) : selected && selectedId ? (
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

      <UndoBar toast={toast} onUndo={undo} onExpire={() => setToast(null)} />
    </main>
  )
}
