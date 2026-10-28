import {
  outside,
  people,
  type ContextKey,
  type OutsideParty,
  type Person,
  type RingKey,
  type RingPolicy,
  type Sector,
} from './panel-data'

export const FIELD = 680
export const CENTER = FIELD / 2

export const RING_RADIUS: Record<RingKey, number> = {
  any: 120,
  hours: 184,
  ask: 244,
  none: 244,
}

export const OUTSIDE_SIZE = 26
export const OUTSIDE_RADIUS = { ask: 298, none: 322 }
export const SECTOR_LABEL_RADIUS = 304
export const RING_LABEL_ANGLE = 205

export const LOCKED = new Set(people.filter((p) => p.setBy === 'them').map((p) => p.id))

export const PERSON_RINGS: RingKey[] = ['any', 'hours', 'ask']
export const OUTSIDE_RINGS: RingKey[] = ['ask', 'none']
export const RING_ORDER: RingKey[] = ['any', 'hours', 'ask', 'none']

export const CONTEXTS: { key: ContextKey; label: string }[] = [
  { key: 'normal', label: 'Normal week' },
  { key: 'release', label: 'Release week' },
  { key: 'sprint', label: 'Hiring sprint' },
]

export const RING_LABEL: Record<RingKey, string> = {
  any: 'Any time',
  hours: 'In open hours',
  ask: 'Ask first',
  none: 'Not bookable',
}

export const RING_HINT: Record<RingKey, string> = {
  any: 'Can book over their focus time',
  hours: 'Waits for open time in working hours',
  ask: 'The scheduler sends you the request',
  none: 'The scheduler never books them',
}

const SECTORS: Record<Sector, { label: string; center: number; spread: number }> = {
  engineering: { label: 'Engineering', center: 318, spread: 30 },
  leadership: { label: 'Leadership', center: 45, spread: 30 },
  product: { label: 'Product', center: 112, spread: 22 },
  design: { label: 'Design', center: 250, spread: 26 },
}

export const SECTOR_LABELS = (Object.keys(SECTORS) as Sector[]).map((key) => ({
  key,
  ...SECTORS[key],
}))

const OUTSIDE_ANGLES = [141, 152, 163]

export type Entity =
  | { kind: 'person'; id: string; angle: number; size: number; person: Person }
  | { kind: 'outside'; id: string; angle: number; size: number; party: OutsideParty }

const HOURS = people.map((p) => p.interviewHoursPerWeek)
const MIN_HOURS = Math.min(...HOURS)
const MAX_HOURS = Math.max(...HOURS)

export function avatarSize(hours: number) {
  const t = Math.min(Math.max((hours - MIN_HOURS) / (MAX_HOURS - MIN_HOURS), 0), 1)
  return Math.round(28 + t * 36)
}

export function entityRadius(entity: Entity, ring: RingKey) {
  if (entity.kind === 'outside') return ring === 'ask' ? OUTSIDE_RADIUS.ask : OUTSIDE_RADIUS.none
  return RING_RADIUS[ring]
}

/** Median days to book a four-person loop. Monotonic: every move inward lowers it. */
export function loopDays(policies: Policies, context: ContextKey) {
  let score = 0
  for (const p of people) {
    const ring = policies[p.id][context]
    if (ring === 'any') score += 1
    else if (ring === 'hours') score += 0.45
  }
  return Math.round((1.5 + 9 * (1 - score / people.length)) * 10) / 10
}

export type ExpiryKind = 'week' | 'two'
export type Expiry = { kind: ExpiryKind; label: string }

export function untilFriday(kind: ExpiryKind) {
  const d = new Date()
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7) + (kind === 'two' ? 7 : 0))
  return `until ${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`
}

function buildEntities(): Entity[] {
  const bySector = new Map<Sector, Person[]>()
  for (const p of people) {
    bySector.set(p.sector, [...(bySector.get(p.sector) ?? []), p])
  }
  const result: Entity[] = []
  for (const p of people) {
    const group = bySector.get(p.sector) ?? [p]
    const { center, spread } = SECTORS[p.sector]
    const i = group.indexOf(p)
    const angle = group.length === 1 ? center : center - spread + (i * 2 * spread) / (group.length - 1)
    result.push({ kind: 'person', id: p.id, angle, size: avatarSize(p.interviewHoursPerWeek), person: p })
  }
  outside.forEach((party, i) => {
    result.push({ kind: 'outside', id: party.id, angle: OUTSIDE_ANGLES[i] ?? 155, size: OUTSIDE_SIZE, party })
  })
  return result
}

export const ENTITIES = buildEntities()

export function polar(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.sin(a), y: CENTER - radius * Math.cos(a) }
}

export function nearestRing(distance: number, candidates: RingKey[]) {
  let best = candidates[0]
  let bestGap = Number.POSITIVE_INFINITY
  for (const ring of candidates) {
    const gap = Math.abs(RING_RADIUS[ring] - distance)
    if (gap < bestGap) {
      best = ring
      bestGap = gap
    }
  }
  return best
}

export type Policies = Record<string, RingPolicy>

export function initialPolicies(): Policies {
  const policies: Policies = {}
  for (const p of people) policies[p.id] = { ...p.rings }
  for (const x of outside) policies[x.id] = { ...x.rings }
  return policies
}

export function tally(policies: Policies, context: ContextKey) {
  let anyCount = 0
  let anyHours = 0
  let hoursCount = 0
  let askCount = 0
  for (const p of people) {
    const ring = policies[p.id][context]
    if (ring === 'any') {
      anyCount++
      anyHours += p.interviewHoursPerWeek
    } else if (ring === 'hours') hoursCount++
    else if (ring === 'ask') askCount++
  }
  for (const x of outside) {
    if (policies[x.id][context] === 'ask') askCount++
  }
  return { anyCount, anyHours: Math.round(anyHours * 10) / 10, hoursCount, askCount }
}

export function describeSwitch(policies: Policies, from: ContextKey, to: ContextKey) {
  let movedOut = 0
  let movedIn = 0
  const moved: string[] = []
  for (const e of ENTITIES) {
    const a = RING_ORDER.indexOf(policies[e.id][from])
    const b = RING_ORDER.indexOf(policies[e.id][to])
    if (a === b) continue
    moved.push(e.id)
    if (e.kind === 'outside') continue
    if (b > a) movedOut++
    else movedIn++
  }
  const delta = Math.round((tally(policies, to).anyHours - tally(policies, from).anyHours) * 10) / 10
  const plural = (n: number) => `${n} ${n === 1 ? 'person' : 'people'}`
  const parts: string[] = []
  if (movedOut) parts.push(`${plural(movedOut)} moved out`)
  if (movedIn) parts.push(`${plural(movedIn)} moved in`)
  if (delta < 0) parts.push(`${Math.abs(delta).toFixed(1)} h of panel time protected`)
  if (delta > 0) parts.push(`${delta.toFixed(1)} h of panel time opened up`)
  const text = parts.length ? parts.join(', ') : 'Nobody moved'
  return { text: text.charAt(0).toUpperCase() + text.slice(1), moved }
}

export function initials(name: string) {
  const parts = name.split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
