export type ContextKey = 'normal' | 'release' | 'sprint'
export type RingKey = 'any' | 'hours' | 'ask' | 'none'
export type Sector = 'engineering' | 'design' | 'product' | 'leadership'
export type OutsideKind = 'candidates' | 'agency' | 'vendor'

export type RingPolicy = Record<ContextKey, RingKey>

export type Person = {
  id: string
  name: string
  role: string
  location: string
  sector: Sector
  interviewHoursPerWeek: number
  interviewsThisMonth: number
  meetings: { name: string; length: string }[]
  rings: RingPolicy
  setBy: 'them' | 'you'
}

export type OutsideParty = {
  id: string
  name: string
  kind: OutsideKind
  note: string
  rings: RingPolicy
}

export type BookingRequest = {
  id: string
  candidate: string
  role: string
  interviewerId: string
  slot: string
}

export const requests: BookingRequest[] = [
  { id: 'r1', candidate: 'Maya Lindgren', role: 'Senior product designer', interviewerId: 'p11', slot: 'Tue 3 Nov, 10:00' },
  { id: 'r2', candidate: 'Daniel Okafor', role: 'Backend engineer', interviewerId: 'p14', slot: 'Wed 4 Nov, 14:30' },
  { id: 'r3', candidate: 'Sofia Marques', role: 'Product manager', interviewerId: 'p12', slot: 'Thu 5 Nov, 11:00' },
]

export const manager = { name: 'You', role: 'Hiring manager', location: 'Munich' }

export const people: Person[] = [
  {
    id: 'p01',
    setBy: 'you',
    name: 'Jonas Becker',
    role: 'Engineering lead',
    location: 'Munich',
    sector: 'engineering',
    interviewHoursPerWeek: 5.4,
    interviewsThisMonth: 11,
    meetings: [
      { name: 'Architecture review', length: '1 h' },
      { name: 'Roadmap review', length: '1 h' },
    ],
    rings: { normal: 'ask', release: 'ask', sprint: 'any' },
  },
  {
    id: 'p02',
    setBy: 'them',
    name: 'Priya Nair',
    role: 'Staff engineer',
    location: 'Munich',
    sector: 'engineering',
    interviewHoursPerWeek: 3.1,
    interviewsThisMonth: 7,
    meetings: [
      { name: 'Weekly 1:1', length: '30 min' },
      { name: 'Architecture review', length: '1 h' },
      { name: 'Product standup', length: '15 min' },
    ],
    rings: { normal: 'any', release: 'ask', sprint: 'any' },
  },
  {
    id: 'p03',
    setBy: 'you',
    name: 'Tomas Nowak',
    role: 'Backend engineer',
    location: 'Krakow',
    sector: 'engineering',
    interviewHoursPerWeek: 2.2,
    interviewsThisMonth: 5,
    meetings: [
      { name: 'Roadmap review', length: '1 h' },
      { name: 'Weekly 1:1', length: '30 min' },
      { name: 'Hiring sync', length: '30 min' },
    ],
    rings: { normal: 'hours', release: 'ask', sprint: 'any' },
  },
  {
    id: 'p04',
    setBy: 'you',
    name: 'Nadia Haddad',
    role: 'Platform engineer',
    location: 'Berlin',
    sector: 'engineering',
    interviewHoursPerWeek: 1.4,
    interviewsThisMonth: 3,
    meetings: [
      { name: 'Roadmap review', length: '1 h' },
      { name: 'Design critique', length: '45 min' },
    ],
    rings: { normal: 'hours', release: 'ask', sprint: 'hours' },
  },
  {
    id: 'p05',
    setBy: 'them',
    name: 'Dana Whitfield',
    role: 'Design lead',
    location: 'Lisbon',
    sector: 'design',
    interviewHoursPerWeek: 3.2,
    interviewsThisMonth: 9,
    meetings: [
      { name: 'Product standup', length: '15 min' },
      { name: 'Hiring sync', length: '30 min' },
      { name: 'Roadmap review', length: '1 h' },
    ],
    rings: { normal: 'any', release: 'hours', sprint: 'any' },
  },
  {
    id: 'p06',
    setBy: 'them',
    name: 'Oliver Grant',
    role: 'Product designer',
    location: 'Munich',
    sector: 'design',
    interviewHoursPerWeek: 7.3,
    interviewsThisMonth: 14,
    meetings: [
      { name: 'Product standup', length: '15 min' },
      { name: 'Portfolio review', length: '1 h' },
    ],
    rings: { normal: 'any', release: 'any', sprint: 'any' },
  },
  {
    id: 'p07',
    setBy: 'them',
    name: 'Ana Ferreira',
    role: 'Design systems',
    location: 'Lisbon',
    sector: 'design',
    interviewHoursPerWeek: 1.8,
    interviewsThisMonth: 4,
    meetings: [
      { name: 'Weekly 1:1', length: '30 min' },
      { name: 'Panel debrief', length: '30 min' },
    ],
    rings: { normal: 'hours', release: 'hours', sprint: 'hours' },
  },
  {
    id: 'p08',
    setBy: 'them',
    name: 'Lukas Meyer',
    role: 'Group PM',
    location: 'Munich',
    sector: 'product',
    interviewHoursPerWeek: 4.6,
    interviewsThisMonth: 10,
    meetings: [
      { name: 'Roadmap review', length: '1 h' },
      { name: 'Portfolio review', length: '1 h' },
    ],
    rings: { normal: 'hours', release: 'hours', sprint: 'any' },
  },
  {
    id: 'p09',
    setBy: 'you',
    name: 'Ines Costa',
    role: 'Product manager',
    location: 'Porto',
    sector: 'product',
    interviewHoursPerWeek: 2.9,
    interviewsThisMonth: 6,
    meetings: [
      { name: 'Roadmap review', length: '1 h' },
      { name: 'Hiring sync', length: '30 min' },
      { name: 'Panel debrief', length: '30 min' },
    ],
    rings: { normal: 'hours', release: 'hours', sprint: 'any' },
  },
  {
    id: 'p10',
    setBy: 'you',
    name: 'Grace Lindqvist',
    role: 'Product manager',
    location: 'Stockholm',
    sector: 'product',
    interviewHoursPerWeek: 2.1,
    interviewsThisMonth: 5,
    meetings: [
      { name: 'Product standup', length: '15 min' },
      { name: 'Weekly 1:1', length: '30 min' },
      { name: 'Hiring sync', length: '30 min' },
    ],
    rings: { normal: 'hours', release: 'ask', sprint: 'hours' },
  },
  {
    id: 'p11',
    setBy: 'them',
    name: 'Joana Pires',
    role: 'Director of product',
    location: 'Lisbon',
    sector: 'leadership',
    interviewHoursPerWeek: 5.4,
    interviewsThisMonth: 12,
    meetings: [
      { name: 'Roadmap review', length: '1 h' },
      { name: 'Portfolio review', length: '1 h' },
    ],
    rings: { normal: 'ask', release: 'ask', sprint: 'hours' },
  },
  {
    id: 'p12',
    setBy: 'you',
    name: 'Arjun Rao',
    role: 'VP engineering',
    location: 'Munich',
    sector: 'leadership',
    interviewHoursPerWeek: 3.7,
    interviewsThisMonth: 8,
    meetings: [
      { name: 'Product standup', length: '15 min' },
      { name: 'Hiring sync', length: '30 min' },
      { name: 'Weekly 1:1', length: '30 min' },
    ],
    rings: { normal: 'hours', release: 'ask', sprint: 'hours' },
  },
  {
    id: 'p13',
    setBy: 'them',
    name: 'Kofi Mensah',
    role: 'Head of design',
    location: 'Berlin',
    sector: 'leadership',
    interviewHoursPerWeek: 2.4,
    interviewsThisMonth: 6,
    meetings: [
      { name: 'Weekly 1:1', length: '30 min' },
      { name: 'Product standup', length: '15 min' },
      { name: 'Roadmap review', length: '1 h' },
    ],
    rings: { normal: 'hours', release: 'hours', sprint: 'any' },
  },
  {
    id: 'p14',
    setBy: 'you',
    name: 'Hannah Vogel',
    role: 'Chief of staff',
    location: 'Munich',
    sector: 'leadership',
    interviewHoursPerWeek: 0.9,
    interviewsThisMonth: 2,
    meetings: [
      { name: 'Product standup', length: '15 min' },
      { name: 'Hiring sync', length: '30 min' },
    ],
    rings: { normal: 'ask', release: 'ask', sprint: 'hours' },
  },
]

export const outside: OutsideParty[] = [
  {
    id: 'x1',
    name: 'Candidates',
    kind: 'candidates',
    note: 'Interviews for two roles, Lisbon',
    rings: { normal: 'ask', release: 'ask', sprint: 'ask' },
  },
  {
    id: 'x2',
    name: 'Halden Partners',
    kind: 'agency',
    note: 'External recruiting agency',
    rings: { normal: 'ask', release: 'none', sprint: 'ask' },
  },
  {
    id: 'x3',
    name: 'Assessment vendor',
    kind: 'vendor',
    note: 'Technical screening partner',
    rings: { normal: 'none', release: 'none', sprint: 'ask' },
  },
]
