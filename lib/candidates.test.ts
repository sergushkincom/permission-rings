import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { type RingKey } from './panel-data'
import { RING_ORDER, initialPolicies, type Policies } from './rings'
import {
  candidates,
  bestUnblock,
  candidateStates,
  formatWait,
  stepInward,
  waitingCount,
  type CandidateState,
} from './candidates'

function place(policies: Policies, id: string, ring: RingKey) {
  policies[id] = { ...policies[id], normal: ring }
}

describe('candidateStates', () => {
  it('books a waiting candidate when their blocker is on any time or in open hours', () => {
    const waiting = initialPolicies()
    assert.equal(candidateStates(waiting, 'normal').find((row) => row.id === 'c1')?.state, 'waiting')

    const openHours = initialPolicies()
    place(openHours, 'p01', 'hours')
    const inHours = candidateStates(openHours, 'normal').find((row) => row.id === 'c1')
    assert.equal(inHours?.state, 'unblocked')
    assert.equal(inHours?.label, 'Unblocked, booking now')

    const anyTime = initialPolicies()
    place(anyTime, 'p01', 'any')
    assert.equal(candidateStates(anyTime, 'normal').find((row) => row.id === 'c1')?.state, 'unblocked')
  })

  it('keeps waiting when the blocker must be asked or cannot be booked', () => {
    for (const ring of ['ask', 'none'] as const) {
      const policies = initialPolicies()
      place(policies, 'p01', ring)
      const row = candidateStates(policies, 'normal').find((candidate) => candidate.id === 'c1')
      assert.equal(row?.state, 'waiting', ring)
      assert.equal(row?.label, 'Waiting 31 h on Jonas Becker')
    }
  })

  it('follows unblockedBy rather than the list of people a candidate is waiting on', () => {
    const policies = initialPolicies()
    place(policies, 'p03', 'any')
    place(policies, 'p01', 'ask')
    assert.equal(candidateStates(policies, 'normal').find((row) => row.id === 'c2')?.state, 'waiting')

    place(policies, 'p01', 'hours')
    place(policies, 'p03', 'ask')
    assert.equal(candidateStates(policies, 'normal').find((row) => row.id === 'c2')?.state, 'unblocked')
  })

  it('leaves a candidate waiting when no single person would unblock them', () => {
    const policies = initialPolicies()
    place(policies, 'p06', 'any')
    place(policies, 'p07', 'any')
    const sara = candidateStates(policies, 'normal').find((row) => row.id === 'c3')
    assert.equal(sara?.state, 'waiting')
    assert.equal(sara?.label, 'Waiting 9 days on two open slots')
    assert.equal(bestUnblock(candidateStates(policies, 'normal'), policies, 'normal')?.id, 'p01')
  })

  it('leaves an already scheduled candidate scheduled', () => {
    const policies = initialPolicies()
    for (const ring of RING_ORDER) place(policies, 'p01', ring)
    const row = candidateStates(policies, 'normal').find((candidate) => candidate.id === 'c5')
    assert.equal(row?.state, 'scheduled')
    assert.equal(row?.label, 'Scheduled Thu 13 Nov')
  })

  it('does not rewrite the candidate catalogue', () => {
    const before = candidates.map((candidate) => candidate.status)
    candidateStates(initialPolicies(), 'sprint')
    assert.deepEqual(
      candidates.map((candidate) => candidate.status),
      before,
    )
  })
})

describe('waitingCount', () => {
  it('counts candidates who are still waiting and ignores the others', () => {
    const policies = initialPolicies()
    assert.equal(waitingCount(policies, 'normal'), 4)
    assert.equal(waitingCount(policies, 'sprint'), 1)

    place(policies, 'p01', 'any')
    assert.equal(waitingCount(policies, 'normal'), 2)
    place(policies, 'p14', 'hours')
    assert.equal(waitingCount(policies, 'normal'), 1)
  })
})

describe('formatWait', () => {
  it('uses hours under two days and rounded days from two days up', () => {
    assert.equal(formatWait(0), '0 h')
    assert.equal(formatWait(31 / 24), '31 h')
    assert.equal(formatWait(1.5), '36 h')
    assert.equal(formatWait(1.999), '48 h')
    assert.equal(formatWait(2), '2 days')
    assert.equal(formatWait(2.4), '2 days')
    assert.equal(formatWait(2.5), '3 days')
    assert.equal(formatWait(9), '9 days')
  })

  it('formats the longest seeded wait as nine days', () => {
    const waiting = candidateStates(initialPolicies(), 'normal').filter((row) => row.state === 'waiting')
    const longest = Math.max(...waiting.map((row) => row.waitDays))
    assert.equal(formatWait(longest), '9 days')
  })
})

describe('stepInward', () => {
  it('moves one ring closer and stays on any time', () => {
    const inward: Record<RingKey, RingKey> = { none: 'ask', ask: 'hours', hours: 'any', any: 'any' }
    for (const ring of RING_ORDER) assert.equal(stepInward(ring), inward[ring])
  })
})

describe('bestUnblock', () => {
  it('suggests the person whose inward move unblocks the most waiting candidates', () => {
    const policies = initialPolicies()
    const suggestion = bestUnblock(candidateStates(policies, 'normal'), policies, 'normal')
    assert.equal(suggestion?.id, 'p01')
    assert.equal(suggestion?.person.name, 'Jonas Becker')
    assert.equal(suggestion?.count, 2)
    assert.equal(suggestion?.nextRing, 'hours')

    place(policies, 'p01', 'none')
    assert.equal(bestUnblock(candidateStates(policies, 'normal'), policies, 'normal')?.nextRing, 'ask')

    place(policies, 'p01', 'any')
    const hannah = bestUnblock(candidateStates(policies, 'normal'), policies, 'normal')
    assert.equal(hannah?.id, 'p14')
    assert.equal(hannah?.count, 1)
    assert.equal(hannah?.nextRing, 'hours')

    place(policies, 'p14', 'hours')
    assert.equal(bestUnblock(candidateStates(policies, 'normal'), policies, 'normal'), null)
    assert.equal(bestUnblock(candidateStates(initialPolicies(), 'sprint'), initialPolicies(), 'sprint'), null)
  })

  it('keeps the earlier person when two moves would unblock the same number', () => {
    const policies = initialPolicies()
    const rows = candidateStates(policies, 'normal').map((row) => {
      if (row.id === 'c1') return { ...row, unblockedBy: 'p14' }
      return row
    })
    assert.equal(bestUnblock(rows, policies, 'normal')?.id, 'p14')
  })

  it('returns nothing when the blocker is not a person on the panel', () => {
    const row: CandidateState = {
      ...candidates[0],
      state: 'waiting',
      label: candidates[0].status,
      unblockedBy: 'missing',
    }
    assert.equal(bestUnblock([row], initialPolicies(), 'normal'), null)
    assert.equal(bestUnblock([], initialPolicies(), 'normal'), null)
  })
})
