// The toast fades in for ENTER, then the bar shrinks across HOLD.
// Both clocks end together so the toast leaves as the bar runs out.
export const UNDO_ENTER_MS = 150
export const UNDO_HOLD_MS = 6000
export const UNDO_FADE_MS = 200
export const UNDO_LIFETIME_MS = UNDO_ENTER_MS + UNDO_HOLD_MS

/** Seconds of the shrinking bar still left. The fade-in does not count down. */
export function undoSecondsRemaining(elapsedMs: number) {
  if (elapsedMs >= UNDO_LIFETIME_MS) return 0
  const moved = Math.max(0, elapsedMs - UNDO_ENTER_MS)
  const left = UNDO_HOLD_MS - moved
  if (left <= 0) return 0
  return Math.ceil(left / 1000)
}

/** How long until the seconds label changes. Zero once the toast should leave. */
export function msUntilNextUndoLabel(elapsedMs: number) {
  const label = undoSecondsRemaining(elapsedMs)
  if (label <= 0) return 0
  const movedAtDrop = UNDO_HOLD_MS - (label - 1) * 1000
  return Math.max(0, UNDO_ENTER_MS + movedAtDrop - elapsedMs)
}
