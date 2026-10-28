export const DAYS = ['Tue 11 Nov', 'Wed 12 Nov', 'Thu 13 Nov', 'Fri 14 Nov', 'Mon 17 Nov', 'Tue 18 Nov'] as const
export const TARGET_DAY = 3
export const NOW_LABEL = 'Wed 18:04'

export const candidate = {
  name: 'Daniel Okafor',
  detail: 'Senior Backend Engineer · Munich · Onsite loop',
  target: 'Target: offer decision by Fri 14 Nov',
}

export type Person = { id: string; name: string; role: string }

export const people: Record<string, Person> = {
  jonas: { id: 'p01', name: 'Jonas Becker', role: 'Engineering lead' },
  priya: { id: 'p02', name: 'Priya Nair', role: 'Staff engineer' },
  tomas: { id: 'p03', name: 'Tomas Nowak', role: 'Backend engineer' },
  nadia: { id: 'p04', name: 'Nadia Haddad', role: 'Platform engineer' },
  dana: { id: 'p05', name: 'Dana Whitfield', role: 'Design lead' },
  lukas: { id: 'p08', name: 'Lukas Meyer', role: 'Group PM' },
  ines: { id: 'p09', name: 'Ines Costa', role: 'Product manager' },
  arjun: { id: 'p12', name: 'Arjun Rao', role: 'VP engineering' },
}

export type TimeOption = { day: number; time: string }

export type Replacement = TimeOption & { person: string; facts: [string, string] }

export type SlotState =
  | { kind: 'confirmed'; day: number; time: string; note: string; overFocus?: boolean }
  | { kind: 'waiting'; askedAgo: string; detail: string }
  | { kind: 'declined'; by: string; when: string; reason: string }

export type Slot = {
  id: string
  name: string
  meta: string
  person: string | null
  state: SlotState
  earliestIfActed: number
  ifNothingChanges: number
  approveAt?: TimeOption
  times: TimeOption[]
  replacements: Replacement[]
}

export const initialSlots: Slot[] = [
  {
    id: 'system-design',
    name: 'System design',
    meta: '60 min · Engineering',
    person: 'arjun',
    state: { kind: 'confirmed', day: 2, time: '10:00', note: 'Booked Tue 11:04, inside open hours' },
    earliestIfActed: 2,
    ifNothingChanges: 2,
    times: [
      { day: 2, time: '15:30' },
      { day: 3, time: '09:00' },
      { day: 3, time: '13:00' },
    ],
    replacements: [],
  },
  {
    id: 'product-sense',
    name: 'Product sense',
    meta: '45 min · Product',
    person: 'ines',
    state: { kind: 'confirmed', day: 2, time: '14:00', note: 'Booked Tue 11:04, over focus time', overFocus: true },
    earliestIfActed: 2,
    ifNothingChanges: 2,
    times: [
      { day: 2, time: '11:30' },
      { day: 3, time: '10:30' },
      { day: 4, time: '14:00' },
    ],
    replacements: [],
  },
  {
    id: 'hiring-manager',
    name: 'Hiring manager',
    meta: '45 min · Engineering',
    person: 'jonas',
    state: { kind: 'waiting', askedAgo: '31 hours ago', detail: 'Out of office until Thu 9:00. No reply yet.' },
    earliestIfActed: 2,
    ifNothingChanges: 5,
    approveAt: { day: 2, time: '16:00' },
    times: [
      { day: 2, time: '16:00' },
      { day: 3, time: '09:30' },
      { day: 3, time: '15:00' },
      { day: 4, time: '11:00' },
    ],
    replacements: [
      { person: 'lukas', facts: ['9 hiring-manager rounds this quarter', 'In your open-hours ring'], day: 3, time: '10:00' },
      { person: 'dana', facts: ['5 hiring-manager rounds this quarter', 'Can book over your focus'], day: 2, time: '16:30' },
    ],
  },
  {
    id: 'coding',
    name: 'Coding',
    meta: '60 min · Engineering',
    person: null,
    state: { kind: 'declined', by: 'priya', when: 'Tue 16:20', reason: 'Reason given: no capacity this week.' },
    earliestIfActed: 2,
    ifNothingChanges: 4,
    times: [],
    replacements: [
      { person: 'nadia', facts: ['4 coding interviews this month', 'In your open-hours ring'], day: 2, time: '11:30' },
      { person: 'tomas', facts: ['6 coding interviews this month', 'Can book over your focus'], day: 3, time: '09:00' },
    ],
  },
]

export function loopOutlook(slots: Slot[]) {
  let confirmed = 0
  let earliest = 0
  let ifNothing = 0
  for (const slot of slots) {
    if (slot.state.kind === 'confirmed') {
      confirmed += 1
      earliest = Math.max(earliest, slot.state.day)
      ifNothing = Math.max(ifNothing, slot.state.day)
    } else {
      earliest = Math.max(earliest, slot.earliestIfActed)
      ifNothing = Math.max(ifNothing, slot.ifNothingChanges)
    }
  }
  return { confirmed, total: slots.length, earliest, ifNothing }
}
