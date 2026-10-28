'use client'

import { useState } from 'react'
import { DAYS, people, type Replacement, type Slot, type TimeOption } from '@/lib/loop-data'
import { PersonCell } from './person-cell'
import { TimePicker } from './time-picker'
import { ReplacementList } from './replacement-list'

type SlotCardProps = {
  slot: Slot
  onApprove: (slotId: string) => void
  onBook: (slotId: string, option: TimeOption, how: 'moved' | 'booked') => void
  onChoose: (slotId: string, replacement: Replacement) => void
}

type Panel = 'picker' | 'replacements' | null

const BAR = {
  confirmed: 'bg-settled',
  waiting: 'bg-strong',
  declined: 'bg-alert',
} as const

const actionClass =
  'rounded-sm text-[13px] leading-5 font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled'

export function SlotCard({ slot, onApprove, onBook, onChoose }: SlotCardProps) {
  const [panel, setPanel] = useState<Panel>(null)
  const toggle = (next: Exclude<Panel, null>) => setPanel((p) => (p === next ? null : next))
  const { state } = slot
  const person = slot.person ? people[slot.person] : null
  const panelId = `${slot.id}-panel`

  return (
    <li className="flex overflow-hidden rounded-xl border border-hairline bg-card shadow-xs">
      <div aria-hidden="true" className={`w-1 shrink-0 transition-colors duration-300 ${BAR[state.kind]}`} />
      <div className="min-w-0 flex-1 px-5 py-4">
        <div className="grid grid-cols-[170px_230px_minmax(0,1fr)_auto] items-center gap-6">
          <div>
            <h3 className="text-sm leading-5 font-semibold text-foreground">{slot.name}</h3>
            <p className="text-[13px] leading-[18px] text-muted-foreground">{slot.meta}</p>
          </div>

          <PersonCell person={person} />

          <div className="min-w-0">
            {state.kind === 'confirmed' && (
              <>
                <p className="text-sm leading-5 font-semibold tabular-nums text-foreground">
                  {DAYS[state.day]}, {state.time}
                </p>
                <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-muted-foreground">
                  {state.overFocus ? (
                    <>
                      {state.note.split(', over focus time')[0]},
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-settled" />
                      over focus time
                    </>
                  ) : (
                    state.note
                  )}
                </p>
              </>
            )}
            {state.kind === 'waiting' && person && (
              <>
                <p className="text-sm leading-5 text-foreground">
                  Asked {person.name} {state.askedAgo}
                </p>
                <p className="text-[13px] leading-[18px] text-muted-foreground">{state.detail}</p>
              </>
            )}
            {state.kind === 'declined' && (
              <>
                <p className="text-sm leading-5 text-foreground">
                  {people[state.by].name} declined {state.when}
                </p>
                <p className="text-[13px] leading-[18px] text-muted-foreground">{state.reason}</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-4">
            {state.kind === 'confirmed' && (
              <button
                type="button"
                className={actionClass}
                aria-expanded={panel === 'picker'}
                aria-controls={panelId}
                onClick={() => toggle('picker')}
              >
                Move
              </button>
            )}
            {state.kind === 'waiting' && person && (
              <>
                <button
                  type="button"
                  className={`${actionClass} text-settled`}
                  onClick={() => onApprove(slot.id)}
                >
                  Approve for {person.name.split(' ')[0]}
                </button>
                <button
                  type="button"
                  className={actionClass}
                  aria-expanded={panel === 'replacements'}
                  aria-controls={panelId}
                  onClick={() => toggle('replacements')}
                >
                  Pick someone else
                </button>
                <button
                  type="button"
                  className={actionClass}
                  aria-expanded={panel === 'picker'}
                  aria-controls={panelId}
                  onClick={() => toggle('picker')}
                >
                  Book it myself
                </button>
              </>
            )}
            {state.kind === 'declined' && (
              <button
                type="button"
                className={actionClass}
                aria-expanded={panel === 'replacements'}
                aria-controls={panelId}
                onClick={() => toggle('replacements')}
              >
                {panel === 'replacements' ? 'Hide replacements' : 'See replacements'}
              </button>
            )}
          </div>
        </div>

        {panel && (
          <div id={panelId} className="mt-4 border-t border-hairline pt-4">
            {panel === 'picker' && (
              <TimePicker
                slotName={slot.name}
                options={slot.times.filter(
                  (t) => !(state.kind === 'confirmed' && t.day === state.day && t.time === state.time),
                )}
                onPick={(option) => {
                  onBook(slot.id, option, state.kind === 'confirmed' ? 'moved' : 'booked')
                  setPanel(null)
                }}
                onCancel={() => setPanel(null)}
              />
            )}
            {panel === 'replacements' && (
              <ReplacementList
                replacements={slot.replacements}
                onChoose={(r) => {
                  onChoose(slot.id, r)
                  setPanel(null)
                }}
              />
            )}
          </div>
        )}
      </div>
    </li>
  )
}
