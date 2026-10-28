import { people, type ContextKey, type RingKey } from './panel-data'
import type { Policies } from './rings'

export type Candidate = {
  id: string
  name: string
  role: string
  stage: string
  waitingOn: string[]
  unblockedBy?: string
  waitDays: number
  status: string
  scheduled?: boolean
}

export const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Lea Hoffmann',
    role: 'Senior Backend Engineer',
    stage: 'Onsite loop',
    waitingOn: ['p01'],
    unblockedBy: 'p01',
    waitDays: 31 / 24,
    status: 'Waiting 31 h on Jonas Becker',
  },
  {
    id: 'c2',
    name: 'Marcus Chen',
    role: 'Backend Engineer',
    stage: 'Coding interview',
    waitingOn: ['p01', 'p03'],
    unblockedBy: 'p01',
    waitDays: 4,
    status: 'Waiting 4 days for a coding slot',
  },
  {
    id: 'c3',
    name: 'Sara Lindholm',
    role: 'Design Systems Lead',
    stage: 'Onsite loop',
    waitingOn: ['p06', 'p07'],
    waitDays: 9,
    status: 'Waiting 9 days on two open slots',
  },
  {
    id: 'c4',
    name: 'Rafael Souza',
    role: 'Product Manager',
    stage: 'Hiring manager screen',
    waitingOn: ['p14'],
    unblockedBy: 'p14',
    waitDays: 2,
    status: 'Waiting 2 days on Hannah Vogel',
  },
  {
    id: 'c5',
    name: 'Elif Demir',
    role: 'Product Manager',
    stage: 'Final round',
    waitingOn: [],
    waitDays: 0,
    status: 'Scheduled Thu 13 Nov',
    scheduled: true,
  },
]

export const WITHDRAWN_NOTE = '2 candidates withdrew in the last 30 days after waiting more than 7 days.'

export type CandidateState = Candidate & { state: 'waiting' | 'unblocked' | 'scheduled'; label: string }

const gated = (ring: RingKey) => ring === 'ask' || ring === 'none'

export function candidateStates(policies: Policies, context: ContextKey): CandidateState[] {
  return candidates.map((c) => {
    if (c.scheduled) return { ...c, state: 'scheduled', label: c.status }
    if (c.unblockedBy && !gated(policies[c.unblockedBy][context])) {
      return { ...c, state: 'unblocked', label: 'Unblocked, booking now' }
    }
    return { ...c, state: 'waiting', label: c.status }
  })
}

export function waitingCount(policies: Policies, context: ContextKey) {
  return candidateStates(policies, context).filter((c) => c.state === 'waiting').length
}

export function formatWait(days: number) {
  return days < 2 ? `${Math.round(days * 24)} h` : `${Math.round(days)} days`
}

/** The one person whose move inward would unblock the most waiting candidates. */
export function bestUnblock(rows: CandidateState[], policies: Policies, context: ContextKey) {
  const counts = new Map<string, number>()
  for (const r of rows) {
    if (r.state === 'waiting' && r.unblockedBy) counts.set(r.unblockedBy, (counts.get(r.unblockedBy) ?? 0) + 1)
  }
  let best: { id: string; count: number } | null = null
  for (const [id, count] of counts) if (!best || count > best.count) best = { id, count }
  if (!best) return null
  const person = people.find((p) => p.id === best.id)
  if (!person) return null
  return { ...best, person, nextRing: stepInward(policies[best.id][context]) }
}

export function stepInward(ring: RingKey): RingKey {
  if (ring === 'none') return 'ask'
  if (ring === 'ask') return 'hours'
  return 'any'
}
