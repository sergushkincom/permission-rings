'use client'

import { memo, useEffect, useRef, useState, type CSSProperties, type FocusEvent } from 'react'
import {
  UNDO_ENTER_MS,
  UNDO_FADE_MS,
  UNDO_HOLD_MS,
  UNDO_LIFETIME_MS,
  msUntilNextUndoLabel,
  undoSecondsRemaining,
} from '@/lib/undo-countdown'
import { useReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

const METER_STYLE = {
  '--undo-hold': `${UNDO_HOLD_MS}ms`,
  '--undo-enter': `${UNDO_ENTER_MS}ms`,
} as CSSProperties

type UndoBarProps = {
  toast: { id: number; text: string } | null
  onUndo: () => void
  onExpire: () => void
}

type Clock = {
  id: number
  started: number
  pausedFor: number
  pausedAt: number | null
}

// Memoized so a pause or a seconds tick does not rebuild the node and restart the bar.
const UndoMeter = memo(function UndoMeter() {
  return (
    <span aria-hidden="true" className="undo-meter pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg">
      <span className="undo-meter-fill block h-full w-full bg-[#a4bcfd] dark:bg-settled-deep" />
    </span>
  )
})

export function UndoBar({ toast, onUndo, onExpire }: UndoBarProps) {
  const reduced = useReducedMotion()
  const [leavingId, setLeavingId] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(() => undoSecondsRemaining(0))
  const expireRef = useRef(onExpire)
  const rootRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<Clock | null>(null)
  const pausedRef = useRef(false)
  const hoverRef = useRef(false)
  const focusRef = useRef(false)

  // Keep the latest onExpire without writing the ref during render.
  useEffect(() => {
    expireRef.current = onExpire
  })

  const id = toast?.id

  function hold(nextHover: boolean | null, nextFocus: boolean | null) {
    if (nextHover !== null) hoverRef.current = nextHover
    if (nextFocus !== null) focusRef.current = nextFocus
    const next = hoverRef.current || focusRef.current
    if (next === pausedRef.current) return
    pausedRef.current = next
    setPaused(next)
  }

  function onPointerEnter() {
    hold(true, null)
  }

  function onPointerLeave() {
    hold(false, null)
  }

  function onFocus() {
    hold(null, true)
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    hold(null, false)
  }

  useEffect(() => {
    if (id === undefined) {
      clockRef.current = null
      return
    }

    const now = performance.now()
    let clock = clockRef.current
    if (!clock || clock.id !== id) {
      const el = rootRef.current
      const hovered = el?.matches(':hover') ?? false
      const focused = !!el && el.contains(document.activeElement)
      hoverRef.current = hovered
      focusRef.current = focused
      const held = hovered || focused
      pausedRef.current = held
      setPaused(held)
      clock = { id, started: now, pausedFor: 0, pausedAt: held ? now : null }
      clockRef.current = clock
      setSecondsLeft(undoSecondsRemaining(0))
      setLeavingId(null)
    } else if (pausedRef.current) {
      if (clock.pausedAt === null) clock.pausedAt = now
    } else if (clock.pausedAt !== null) {
      clock.pausedFor += now - clock.pausedAt
      clock.pausedAt = null
    }

    let fadeTimer = 0
    let doneTimer = 0
    let tickTimer = 0
    let alive = true

    const elapsed = () => {
      const current = clockRef.current
      if (!current) return 0
      const t = performance.now()
      const open = current.pausedAt === null ? 0 : t - current.pausedAt
      return t - current.started - current.pausedFor - open
    }

    const clear = () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(doneTimer)
      window.clearTimeout(tickTimer)
    }

    const arm = () => {
      clear()
      if (!alive || clockRef.current !== clock) return
      const gone = UNDO_LIFETIME_MS - elapsed()
      if (pausedRef.current) {
        if (reduced) {
          const secs = undoSecondsRemaining(elapsed())
          if (secs > 0) setSecondsLeft(secs)
        }
        setLeavingId((current) => (current === id ? null : current))
        return
      }
      if (gone <= 0) {
        setLeavingId(id)
        doneTimer = window.setTimeout(() => {
          if (alive) expireRef.current()
        }, UNDO_FADE_MS)
        return
      }
      if (reduced) {
        const secs = undoSecondsRemaining(elapsed())
        if (secs > 0) setSecondsLeft(secs)
        const wait = msUntilNextUndoLabel(elapsed())
        tickTimer = window.setTimeout(arm, wait > 0 ? wait : 1000)
      }
      fadeTimer = window.setTimeout(() => {
        if (!alive || pausedRef.current) return
        setLeavingId(id)
        doneTimer = window.setTimeout(() => {
          if (alive && !pausedRef.current) expireRef.current()
        }, UNDO_FADE_MS)
      }, gone)
    }

    arm()
    return () => {
      alive = false
      clear()
    }
  }, [id, paused, reduced])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <span className="sr-only" aria-live="polite">
        {toast?.text ?? ''}
      </span>
      {toast && (
        <div
          key={toast.id}
          ref={rootRef}
          data-undo-toast
          style={METER_STYLE}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(
            'anim-undo-in pointer-events-auto relative flex h-11 items-center gap-6 overflow-clip rounded-lg bg-tooltip px-4 text-[13px] leading-[18px] text-white shadow-float',
            leavingId === toast.id && 'anim-undo-out',
            paused && 'undo-paused',
          )}
        >
          <span aria-hidden="true">{toast.text}</span>
          <span className="flex items-center gap-3">
            <span className="undo-time tabular-nums text-white/70" aria-hidden="true">
              {secondsLeft}s
            </span>
            <button
              type="button"
              onClick={onUndo}
              className="font-semibold text-[#a4bcfd] dark:text-settled-deep underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              Undo
            </button>
          </span>
          <UndoMeter />
        </div>
      )}
    </div>
  )
}
