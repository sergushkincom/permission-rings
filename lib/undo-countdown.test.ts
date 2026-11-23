import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  UNDO_ENTER_MS,
  UNDO_HOLD_MS,
  UNDO_LIFETIME_MS,
  msUntilNextUndoLabel,
  undoSecondsRemaining,
} from './undo-countdown'

describe('undo countdown', () => {
  it('shows 6s through the fade-in and the first second of the bar', () => {
    assert.equal(undoSecondsRemaining(0), 6)
    assert.equal(undoSecondsRemaining(UNDO_ENTER_MS), 6)
    assert.equal(undoSecondsRemaining(UNDO_ENTER_MS + 999), 6)
    assert.equal(undoSecondsRemaining(UNDO_ENTER_MS + 1000), 5)
  })

  it('steps down once a second and reaches zero when the toast leaves', () => {
    assert.equal(undoSecondsRemaining(UNDO_ENTER_MS + 5000), 1)
    assert.equal(undoSecondsRemaining(UNDO_LIFETIME_MS - 1), 1)
    assert.equal(undoSecondsRemaining(UNDO_LIFETIME_MS), 0)
    assert.equal(undoSecondsRemaining(UNDO_LIFETIME_MS + 50), 0)
  })

  it('schedules the next label on the same boundaries', () => {
    assert.equal(msUntilNextUndoLabel(0), UNDO_ENTER_MS + 1000)
    assert.equal(msUntilNextUndoLabel(UNDO_ENTER_MS + 1000), 1000)
    assert.equal(msUntilNextUndoLabel(UNDO_ENTER_MS + 2500), 500)
    assert.equal(msUntilNextUndoLabel(UNDO_LIFETIME_MS), 0)
  })

  it('keeps the bar and the hold the same length', () => {
    assert.equal(UNDO_HOLD_MS, 6000)
    assert.equal(UNDO_LIFETIME_MS, UNDO_ENTER_MS + UNDO_HOLD_MS)
  })
})
