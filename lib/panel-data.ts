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
}

export type OutsideParty = {
  id: string
  name: string
  kind: OutsideKind
  note: string
  rings: RingPolicy
}

export const manager = { name: 'You', role: 'Hiring manager', location: 'Munich' }

export const people: Person[] = [
  {
    id: 'p01',
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
    rings: { normal: 'any', release: 'ask', sprint: 'any' },
  },
  {
    id: 'p02',
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
