import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'

import { outside, people, type ContextKey, type RingKey } from './panel-data'
import {
  CENTER,
  ENTITIES,
  LOCKED,
  OUTSIDE_RADIUS,
  OUTSIDE_RINGS,
  PERSON_RINGS,
  RING_ORDER,
  RING_RADIUS,
  avatarSize,
  describeSwitch,
  entityRadius,
  initialPolicies,
  initials,
  loopDays,
  nearestRing,
  polar,
  tally,
  untilFriday,
  type Policies,
} from './rings'

function policiesOn(ring: RingKey): Policies {
  const policies = initialPolicies()
  for (const id of Object.keys(policies)) {
    policies[id] = { normal: ring, release: ring, sprint: ring }
  }
  return policies
}

function place(policies: Policies, id: string, context: ContextKey, ring: RingKey) {
  policies[id] = { ...policies[id], [context]: ring }
}

describe('ring distances', () => {
  it('orders the rings from freer and closer to farther and more restricted', () => {
    assert.deepEqual(RING_ORDER, ['any', 'hours', 'ask', 'none'])
    assert.deepEqual(PERSON_RINGS, ['any', 'hours', 'ask'])
    assert.deepEqual(OUTSIDE_RINGS, ['ask', 'none'])
    assert.ok(RING_RADIUS.any < RING_RADIUS.hours)
    assert.ok(RING_RADIUS.hours < RING_RADIUS.ask)
    assert.ok(OUTSIDE_RADIUS.ask > RING_RADIUS.ask)
    assert.ok(OUTSIDE_RADIUS.none > OUTSIDE_RADIUS.ask)
  })

  it('snaps a person to the nearest ring, and to the inner ring on an exact tie', () => {
    const anyHours = (RING_RADIUS.any + RING_RADIUS.hours) / 2
    const hoursAsk = (RING_RADIUS.hours + RING_RADIUS.ask) / 2

    assert.equal(nearestRing(0, PERSON_RINGS), 'any')
    assert.equal(nearestRing(RING_RADIUS.any, PERSON_RINGS), 'any')
    assert.equal(nearestRing(anyHours, PERSON_RINGS), 'any')
    assert.equal(nearestRing(anyHours + 0.001, PERSON_RINGS), 'hours')
    assert.equal(nearestRing(RING_RADIUS.hours, PERSON_RINGS), 'hours')
    assert.equal(nearestRing(hoursAsk, PERSON_RINGS), 'hours')
    assert.equal(nearestRing(hoursAsk + 0.001, PERSON_RINGS), 'ask')
    assert.equal(nearestRing(10000, PERSON_RINGS), 'ask')
  })

  it('picks the closest ring even when it is listed last', () => {
    assert.equal(nearestRing(0, ['ask', 'hours', 'any']), 'any')
    assert.equal(nearestRing(10000, ['any']), 'any')
  })

  it('keeps the earlier candidate when two rings are equally far', () => {
    const midpoint = (RING_RADIUS.any + RING_RADIUS.hours) / 2
    assert.equal(nearestRing(midpoint, ['hours', 'any']), 'hours')
    assert.equal(nearestRing(midpoint, ['any', 'hours']), 'any')
  })

  it('cannot tell ask from not-bookable by the person radius', () => {
    assert.equal(RING_RADIUS.ask, RING_RADIUS.none)
    assert.equal(nearestRing(OUTSIDE_RADIUS.none, OUTSIDE_RINGS), 'ask')
    const party = ENTITIES.find((entity) => entity.kind === 'outside')
    assert.ok(party)
    assert.equal(entityRadius(party, 'ask'), OUTSIDE_RADIUS.ask)
    assert.equal(entityRadius(party, 'none'), OUTSIDE_RADIUS.none)
    assert.equal(entityRadius(party, 'any'), OUTSIDE_RADIUS.none)
  })

  it('places a person on the person radius for the ring they are in', () => {
    const person = ENTITIES.find((entity) => entity.kind === 'person')
    assert.ok(person)
    for (const ring of RING_ORDER) assert.equal(entityRadius(person, ring), RING_RADIUS[ring])
  })

  it('lays faces out on their sector arc and sizes them by interview hours', () => {
    const expectedAngles: Record<string, number> = {
      p01: 288,
      p02: 308,
      p03: 328,
      p04: 348,
      p05: 224,
      p06: 250,
      p07: 276,
      p08: 90,
      p09: 112,
      p10: 134,
      p11: 15,
      p12: 35,
      p13: 55,
      p14: 75,
      x1: 141,
      x2: 152,
      x3: 163,
    }
    assert.deepEqual(
      ENTITIES.map((entity) => entity.id),
      [...people.map((person) => person.id), ...outside.map((party) => party.id)],
    )
    for (const entity of ENTITIES) {
      assert.equal(entity.angle, expectedAngles[entity.id])
      if (entity.kind === 'person') assert.equal(entity.size, avatarSize(entity.person.interviewHoursPerWeek))
      else assert.equal(entity.size, 26)
    }
  })

  it('maps the quietest week to the smallest face and the busiest to the largest', () => {
    const hours = people.map((person) => person.interviewHoursPerWeek)
    const quietest = Math.min(...hours)
    const busiest = Math.max(...hours)
    assert.equal(avatarSize(quietest), 28)
    assert.equal(avatarSize(busiest), 64)
    assert.equal(avatarSize((quietest + busiest) / 2), 46)
    assert.equal(avatarSize(quietest - 10), 28)
    assert.equal(avatarSize(busiest + 10), 64)

    const ordered = [...hours].sort((a, b) => a - b)
    let previous = avatarSize(ordered[0])
    for (const value of ordered) {
      const size = avatarSize(value)
      assert.ok(size >= previous)
      previous = size
    }
  })

  it('converts a ring angle into a point at that distance from the centre', () => {
    const top = polar(0, 100)
    const right = polar(90, 100)
    const bottom = polar(180, 100)
    const left = polar(270, 100)
    assert.ok(Math.abs(top.x - CENTER) < 1e-9)
    assert.ok(Math.abs(top.y - (CENTER - 100)) < 1e-9)
    assert.ok(Math.abs(right.x - (CENTER + 100)) < 1e-9)
    assert.ok(Math.abs(right.y - CENTER) < 1e-9)
    assert.ok(Math.abs(bottom.x - CENTER) < 1e-9)
    assert.ok(Math.abs(bottom.y - (CENTER + 100)) < 1e-9)
    assert.ok(Math.abs(left.x - (CENTER - 100)) < 1e-9)
    assert.ok(Math.abs(left.y - CENTER) < 1e-9)

    const policies = initialPolicies()
    for (const entity of ENTITIES) {
      const radius = entityRadius(entity, policies[entity.id].normal)
      const point = polar(entity.angle, radius)
      const distance = Math.hypot(point.x - CENTER, point.y - CENTER)
      assert.ok(Math.abs(distance - radius) < 1e-6)
    }
  })
})

describe('who may be moved', () => {
  it('locks exactly the people who set their own ring', () => {
    for (const person of people) assert.equal(LOCKED.has(person.id), person.setBy === 'them')
    for (const party of outside) assert.equal(LOCKED.has(party.id), false)
    assert.equal(LOCKED.has('p02'), true)
    assert.equal(LOCKED.has('p01'), false)
  })

  it('copies the seeded rings without sharing them with the catalogue', () => {
    const policies = initialPolicies()
    const jonas = people.find((person) => person.id === 'p01')
    assert.ok(jonas)
    assert.equal(policies.p01.normal, 'ask')
    policies.p01.normal = 'any'
    assert.equal(jonas.rings.normal, 'ask')
    assert.equal(initialPolicies().p01.normal, 'ask')
  })
})

describe('scoreboard', () => {
  it('counts people on each ring and adds outside parties only when they must be asked', () => {
    const policies = policiesOn('ask')
    assert.deepEqual(tally(policies, 'normal'), {
      anyCount: 0,
      anyHours: 0,
      hoursCount: 0,
      askCount: people.length + outside.length,
    })

    place(policies, 'p06', 'normal', 'any')
    place(policies, 'p02', 'normal', 'any')
    place(policies, 'p03', 'normal', 'hours')
    place(policies, 'p01', 'normal', 'none')
    place(policies, 'x1', 'normal', 'none')
    place(policies, 'x2', 'normal', 'any')

    const counts = tally(policies, 'normal')
    assert.equal(counts.anyCount, 2)
    assert.equal(counts.anyHours, 10.4)
    assert.equal(counts.hoursCount, 1)
    assert.equal(counts.askCount, people.length + outside.length - 6)
  })

  it('reports the seeded week the screen opens on', () => {
    const policies = initialPolicies()
    assert.deepEqual(tally(policies, 'normal'), { anyCount: 3, anyHours: 13.6, hoursCount: 8, askCount: 5 })
    assert.deepEqual(tally(policies, 'release'), { anyCount: 1, anyHours: 7.3, hoursCount: 5, askCount: 9 })
    assert.deepEqual(tally(policies, 'sprint'), { anyCount: 8, anyHours: 31.1, hoursCount: 6, askCount: 3 })
  })

  it('shortens the loop as people move inward and ignores outside parties', () => {
    assert.equal(loopDays(policiesOn('ask'), 'normal'), 10.5)
    assert.equal(loopDays(policiesOn('none'), 'normal'), 10.5)
    assert.equal(loopDays(policiesOn('hours'), 'normal'), 6.5)
    assert.equal(loopDays(policiesOn('any'), 'normal'), 1.5)

    const policies = policiesOn('ask')
    let days = loopDays(policies, 'normal')
    for (const person of people) {
      place(policies, person.id, 'normal', 'hours')
      const next = loopDays(policies, 'normal')
      assert.ok(next < days, `${person.name} moving to open hours should shorten the loop`)
      days = next
    }
    for (const person of people) {
      place(policies, person.id, 'normal', 'any')
      const next = loopDays(policies, 'normal')
      assert.ok(next < days, `${person.name} moving to any time should shorten the loop`)
      days = next
    }
    assert.equal(days, 1.5)

    place(policies, 'p01', 'normal', 'ask')
    assert.ok(loopDays(policies, 'normal') > 1.5)
    const withOutside = loopDays(policies, 'normal')
    place(policies, 'x1', 'normal', 'none')
    place(policies, 'x2', 'normal', 'any')
    assert.equal(loopDays(policies, 'normal'), withOutside)
  })

  it('matches the seeded loop estimates', () => {
    const policies = initialPolicies()
    assert.equal(loopDays(policies, 'normal'), 6.3)
    assert.equal(loopDays(policies, 'release'), 8.4)
    assert.equal(loopDays(policies, 'sprint'), 3.6)
  })
})

describe('describeSwitch', () => {
  it('says nobody moved when the two contexts match', () => {
    assert.deepEqual(describeSwitch(initialPolicies(), 'normal', 'normal'), {
      text: 'Nobody moved',
      moved: [],
    })
  })

  it('describes the seeded change from a normal week to release week', () => {
    assert.deepEqual(describeSwitch(initialPolicies(), 'normal', 'release'), {
      text: '6 people moved out, 6.3 h of panel time protected',
      moved: ['p02', 'p03', 'p04', 'p05', 'p10', 'p12', 'x2'],
    })
    assert.deepEqual(describeSwitch(initialPolicies(), 'release', 'normal'), {
      text: '6 people moved in, 6.3 h of panel time opened up',
      moved: ['p02', 'p03', 'p04', 'p05', 'p10', 'p12', 'x2'],
    })
  })

  it('pluralises one person and omits the hours clause when panel time does not change', () => {
    const policies = policiesOn('ask')
    place(policies, 'p14', 'release', 'hours')
    assert.deepEqual(describeSwitch(policies, 'normal', 'release'), {
      text: '1 person moved in',
      moved: ['p14'],
    })

    place(policies, 'p01', 'release', 'hours')
    assert.deepEqual(describeSwitch(policies, 'normal', 'release'), {
      text: '2 people moved in',
      moved: ['p01', 'p14'],
    })
  })

  it('counts an inward move against an outward one and rounds the hours delta', () => {
    const policies = policiesOn('ask')
    place(policies, 'p01', 'normal', 'any')
    place(policies, 'p14', 'release', 'any')
    assert.deepEqual(describeSwitch(policies, 'normal', 'release'), {
      text: '1 person moved out, 1 person moved in, 4.5 h of panel time protected',
      moved: ['p01', 'p14'],
    })

    const opened = policiesOn('ask')
    place(opened, 'p01', 'release', 'any')
    assert.equal(
      describeSwitch(opened, 'normal', 'release').text,
      '1 person moved in, 5.4 h of panel time opened up',
    )
  })

  it('treats not-bookable as farther out than ask first', () => {
    const policies = policiesOn('ask')
    place(policies, 'p01', 'normal', 'none')
    assert.deepEqual(describeSwitch(policies, 'normal', 'release'), {
      text: '1 person moved in',
      moved: ['p01'],
    })
  })

  it('lists an outside party who moved without calling them a person', () => {
    const policies = policiesOn('ask')
    place(policies, 'x2', 'release', 'none')
    assert.deepEqual(describeSwitch(policies, 'normal', 'release'), {
      text: 'Nobody moved',
      moved: ['x2'],
    })
  })
})

describe('untilFriday', { concurrency: false }, () => {
  it('names this Friday, and the Friday after, in en-GB', () => {
    const cases = [
      ['2026-11-11T12:00:00Z', 'until Fri 13 Nov', 'until Fri 20 Nov'],
      ['2026-11-13T12:00:00Z', 'until Fri 13 Nov', 'until Fri 20 Nov'],
      ['2026-11-14T12:00:00Z', 'until Fri 20 Nov', 'until Fri 27 Nov'],
    ] as const

    for (const [now, week, two] of cases) {
      mock.timers.enable({ apis: ['Date'], now: Date.parse(now) })
      try {
        assert.equal(untilFriday('week'), week, now)
        assert.equal(untilFriday('two'), two, now)
      } finally {
        mock.timers.reset()
      }
    }
  })
})

describe('initials', () => {
  it('uses the first letter of the first two words', () => {
    assert.equal(initials('Jonas Becker'), 'JB')
    assert.equal(initials('halden partners'), 'HP')
    assert.equal(initials('You'), 'Y')
    assert.equal(initials('Ana Maria Ferreira'), 'AM')
    assert.equal(initials(''), '')
  })
})
