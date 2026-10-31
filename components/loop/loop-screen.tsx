'use client'

import { useState } from 'react'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  NOW_LABEL,
  candidate,
  initialSlots,
  loopOutlook,
  people,
  type Replacement,
  type Slot,
  type TimeOption,
} from '@/lib/loop-data'
import { StateLine } from './state-line'
import { SlotCard } from './slot-card'
import { AgentPlan, PlanChoice, type PlanRow } from './agent-plan'

const RETRIES = ['once', 'twice'] as const
const FALLBACKS = ['lukas', 'dana'] as const
const HAND_BACK = ['you', 'Hannah Vogel'] as const

const cycle = <T,>(list: readonly T[], current: T) => list[(list.indexOf(current) + 1) % list.length]

export function LoopScreen() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [retries, setRetries] = useState<(typeof RETRIES)[number]>('once')
  const [fallback, setFallback] = useState<(typeof FALLBACKS)[number]>('lukas')
  const [handBack, setHandBack] = useState<(typeof HAND_BACK)[number]>('you')

  const outlook = loopOutlook(slots)

  const update = (slotId: string, change: (slot: Slot) => Slot) =>
    setSlots((all) => all.map((s) => (s.id === slotId ? change(s) : s)))

  const approve = (slotId: string) =>
    update(slotId, (s) =>
      s.approveAt
        ? {
            ...s,
            state: { kind: 'confirmed', ...s.approveAt, note: `Approved by you ${NOW_LABEL}, inside open hours` },
          }
        : s,
    )

  const book = (slotId: string, option: TimeOption, how: 'moved' | 'booked') =>
    update(slotId, (s) => ({
      ...s,
      state: { kind: 'confirmed', ...option, note: `${how === 'moved' ? 'Moved' : 'Booked'} by you ${NOW_LABEL}` },
    }))

  const choose = (slotId: string, r: Replacement) =>
    update(slotId, (s) => ({
      ...s,
      person: r.person,
      state: {
        kind: 'confirmed',
        day: r.day,
        time: r.time,
        note: `Chosen by you ${NOW_LABEL}, ${r.facts[1].toLowerCase()}`,
      },
    }))

  const hiringManager = slots.find((s) => s.id === 'hiring-manager')
  const coding = slots.find((s) => s.id === 'coding')
  const waitingOnJonas = hiringManager?.state.kind === 'waiting'
  const anythingOpen = outlook.confirmed < outlook.total

  const rows: PlanRow[] = []
  if (waitingOnJonas) {
    rows.push(
      {
        at: 'Thu 09:00',
        text: (
          <>
            Asks Jonas again,{' '}
            <PlanChoice value={retries} label="How often to ask" onCycle={() => setRetries(cycle(RETRIES, retries))} />.
          </>
        ),
      },
      {
        at: 'Thu 17:00',
        text: (
          <>
            If no answer, proposes{' '}
            <PlanChoice
              value={people[fallback].name}
              label="Who to propose instead"
              onCycle={() => setFallback(cycle(FALLBACKS, fallback))}
            />{' '}
            for the hiring manager slot.
          </>
        ),
      },
    )
  } else if (coding?.state.kind === 'declined') {
    rows.push({ at: 'Thu 09:00', text: 'Holds the coding slot open until you choose an interviewer.' })
  }
  if (anythingOpen) {
    rows.push({
      at: 'Fri 09:00',
      text: (
        <>
          Stops asking and hands the loop back to{' '}
          <PlanChoice value={handBack} label="Who gets the loop back" onCycle={() => setHandBack(cycle(HAND_BACK, handBack))} />.
        </>
      ),
    })
  } else {
    rows.push({ at: 'Wed 18:30', text: `Sends ${candidate.name.split(' ')[0]} the confirmed schedule.` })
  }

  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-8 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl leading-7 font-semibold text-foreground">{candidate.name}</h1>
          <p className="text-[13px] leading-[18px] text-muted-foreground">{candidate.detail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-strong px-3 py-1 text-[13px] leading-[18px] text-foreground">
            {candidate.target}
          </span>
          <ThemeSwitch />
        </div>
      </header>

      <StateLine {...outlook} />

      <section aria-label="Interviews in the loop">
        <ul className="flex flex-col gap-3">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onApprove={approve} onBook={book} onChoose={choose} />
          ))}
        </ul>
      </section>

      <AgentPlan rows={rows} editable={anythingOpen} />
    </main>
  )
}
