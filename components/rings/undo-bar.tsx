'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const HOLD = 150 + 6000
const FADE_OUT = 200

type UndoBarProps = {
  toast: { id: number; text: string } | null
  onUndo: () => void
  onExpire: () => void
}

export function UndoBar({ toast, onUndo, onExpire }: UndoBarProps) {
  const [leavingId, setLeavingId] = useState<number | null>(null)
  const expireRef = useRef(onExpire)
  expireRef.current = onExpire
  const id = toast?.id

  useEffect(() => {
    if (id === undefined) return
    const fade = setTimeout(() => setLeavingId(id), HOLD)
    const done = setTimeout(() => expireRef.current(), HOLD + FADE_OUT)
    return () => {
      clearTimeout(fade)
      clearTimeout(done)
    }
  }, [id])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {toast && (
        <div
          className={cn(
            'anim-undo-in pointer-events-auto flex h-11 items-center gap-6 rounded-lg bg-tooltip px-4 text-[13px] leading-[18px] text-white shadow-float',
            leavingId === toast.id && 'anim-undo-out',
          )}
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={onUndo}
            className="font-semibold text-[#a4bcfd] dark:text-settled-deep underline-offset-4 outline-none hover:underline focus-visible:underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
