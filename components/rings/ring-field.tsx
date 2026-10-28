'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Briefcase, ClipboardCheck, UserPlus } from 'lucide-react'
import type { ContextKey, OutsideKind, RingKey } from '@/lib/panel-data'
import {
  CENTER,
  ENTITIES,
  FIELD,
  OUTSIDE_RINGS,
  PERSON_RINGS,
  RING_LABEL,
  RING_RADIUS,
  SECTOR_LABELS,
  initials,
  nearestRing,
  polar,
  type Entity,
  type Policies,
} from '@/lib/rings'
import { cn } from '@/lib/utils'

const AVATAR_TINTS = ['bg-avatar-1', 'bg-avatar-2', 'bg-avatar-3', 'bg-avatar-4']

const OUTSIDE_ICON: Record<OutsideKind, typeof UserPlus> = {
  candidates: UserPlus,
  agency: Briefcase,
  vendor: ClipboardCheck,
}

type DragState = { id: string; x: number; y: number; ring: RingKey; valid: boolean }

type RingFieldProps = {
  context: ContextKey
  policies: Policies
  selectedId: string | null
  stagger: boolean
  recent: { ids: string[]; version: number }
  onSelect: (id: string | null) => void
  onDrop: (id: string, ring: RingKey) => void
}

export function RingField({ context, policies, selectedId, stagger, recent, onSelect, onDrop }: RingFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const pressRef = useRef<{ id: string; x: number; y: number } | null>(null)
  const draggedRef = useRef(false)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [rejectCount, setRejectCount] = useState(0)

  function toField(e: ReactPointerEvent) {
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return { x: CENTER, y: CENTER }
    const scale = rect.width / FIELD
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale }
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLButtonElement>, entity: Entity) {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pressRef.current = { id: entity.id, x: e.clientX, y: e.clientY }
    draggedRef.current = false
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>, entity: Entity) {
    const press = pressRef.current
    if (!press || press.id !== entity.id) return
    if (!draggedRef.current && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 4) return
    draggedRef.current = true
    const p = toField(e)
    const distance = Math.hypot(p.x - CENTER, p.y - CENTER)
    if (entity.kind === 'person') {
      setDrag({ id: entity.id, ...p, ring: nearestRing(distance, PERSON_RINGS), valid: true })
    } else {
      const ring = nearestRing(distance, ['any', 'hours', ...OUTSIDE_RINGS])
      setDrag({ id: entity.id, ...p, ring, valid: OUTSIDE_RINGS.includes(ring) })
    }
  }

  function handlePointerUp(entity: Entity) {
    const current = drag
    pressRef.current = null
    setDrag(null)
    if (!current || current.id !== entity.id) return
    if (current.valid) onDrop(entity.id, current.ring)
    else setRejectCount((n) => n + 1)
  }

  function handleCancel() {
    pressRef.current = null
    draggedRef.current = false
    setDrag(null)
  }

  function handleClick(id: string) {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    onSelect(selectedId === id ? null : id)
  }

  const hovered = hoverId && !drag ? ENTITIES.find((e) => e.id === hoverId) : undefined
  const hoveredPos = hovered ? polar(hovered.angle, RING_RADIUS[policies[hovered.id][context]]) : null

  return (
    <div
      ref={fieldRef}
      className="relative shrink-0 select-none touch-none"
      style={{ width: FIELD, height: FIELD }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null)
      }}
    >
      <svg
        width={FIELD}
        height={FIELD}
        viewBox={`0 0 ${FIELD} ${FIELD}`}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {(['ask', 'hours', 'any'] as RingKey[]).map((ring) => {
          const highlighted = drag?.ring === ring
          const isOuter = ring === 'ask'
          return (
            <circle
              key={isOuter ? `ask-${rejectCount}` : ring}
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS[ring]}
              fill={ring === 'any' ? 'var(--settled-soft)' : 'none'}
              stroke={highlighted ? (drag?.valid ? 'var(--settled)' : 'var(--alert)') : 'var(--hairline)'}
              strokeWidth={highlighted ? 1.5 : 1}
              className={cn(
                'transition-[stroke] duration-150',
                isOuter && rejectCount > 0 && 'anim-ring-alert',
                ring === 'any' && !highlighted && '[stroke:color-mix(in_oklab,var(--settled)_35%,transparent)]',
              )}
            />
          )
        })}
      </svg>

      {(['any', 'hours', 'ask'] as RingKey[]).map((ring) => (
        <span
          key={ring}
          className={cn(
            'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-card px-1.5 text-xs',
            ring === 'any' ? 'text-settled' : 'text-muted-foreground',
          )}
          style={{ left: CENTER, top: CENTER + RING_RADIUS[ring] }}
        >
          {RING_LABEL[ring]}
        </span>
      ))}

      {SECTOR_LABELS.map((s) => {
        const p = polar(s.center, 322)
        return (
          <span
            key={s.key}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] text-muted-foreground"
            style={{ left: p.x, top: p.y }}
          >
            {s.label}
          </span>
        )
      })}

      <span
        className="pointer-events-none absolute whitespace-nowrap text-xs text-muted-foreground"
        style={{ left: 524, top: 612 }}
      >
        Outside the company
      </span>

      <img
        src="/faces/you.png"
        alt="You, hiring manager"
        draggable={false}
        className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-sm ring-2 ring-card"
        style={{ left: CENTER, top: CENTER }}
      />

      {ENTITIES.map((entity, index) => {
        const ring = policies[entity.id][context]
        const target = polar(entity.angle, RING_RADIUS[ring])
        const isDragging = drag?.id === entity.id
        const pos = isDragging ? { x: drag.x, y: drag.y } : target
        const selected = selectedId === entity.id
        const flashed = recent.version > 0 && recent.ids.includes(entity.id)
        const label =
          entity.kind === 'person'
            ? `${entity.person.name}, ${entity.person.interviewHoursPerWeek} h a week, ${RING_LABEL[ring]}`
            : `${entity.party.name}, ${RING_LABEL[ring]}`

        return (
          <button
            key={entity.id}
            type="button"
            data-avatar
            aria-label={label}
            aria-pressed={selected}
            onPointerDown={(e) => handlePointerDown(e, entity)}
            onPointerMove={(e) => handlePointerMove(e, entity)}
            onPointerUp={() => handlePointerUp(entity)}
            onPointerCancel={handleCancel}
            onPointerEnter={() => setHoverId(entity.id)}
            onPointerLeave={() => setHoverId((h) => (h === entity.id ? null : h))}
            onFocus={() => setHoverId(entity.id)}
            onBlur={() => setHoverId((h) => (h === entity.id ? null : h))}
            onClick={() => handleClick(entity.id)}
            className={cn(
              'absolute left-0 top-0 flex items-center justify-center rounded-full font-medium outline-none',
              'cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-settled focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              entity.kind === 'person'
                ? cn(AVATAR_TINTS[index % AVATAR_TINTS.length], 'text-foreground/80')
                : 'bg-[color-mix(in_oklab,var(--alert)_12%,var(--card))] text-alert',
              selected && 'ring-2 ring-settled ring-offset-2 ring-offset-card',
              isDragging ? 'z-30 shadow-md' : hoverId === entity.id ? 'z-20' : 'z-10',
            )}
            style={{
              width: entity.size,
              height: entity.size,
              fontSize: Math.max(10, Math.round(entity.size * 0.3)),
              transform: `translate(${pos.x - entity.size / 2}px, ${pos.y - entity.size / 2}px)`,
              transition: isDragging
                ? 'none'
                : `transform 520ms cubic-bezier(0.34, 1.2, 0.64, 1) ${stagger ? index * 28 : 0}ms`,
            }}
          >
            {entity.kind === 'person' ? (
              <>
                <span aria-hidden="true">{initials(entity.person.name)}</span>
                <img
                  src={`/faces/${entity.id}.png`}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full rounded-full object-cover"
                />
              </>
            ) : (
              <OutsideIcon kind={entity.party.kind} />
            )}
            {flashed && (
              <span
                key={recent.version}
                aria-hidden="true"
                className="anim-moved-flash pointer-events-none absolute -inset-[3px] rounded-full border-2 border-alert"
              />
            )}
          </button>
        )
      })}

      {hovered && hoveredPos && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white tabular-nums shadow-sm ring-1 ring-white/10"
          style={{ left: hoveredPos.x, top: hoveredPos.y - hovered.size / 2 - 8 }}
        >
          {hovered.kind === 'person'
            ? `${hovered.person.name}, ${hovered.person.interviewHoursPerWeek} h a week`
            : hovered.party.name}
        </div>
      )}
    </div>
  )
}

function OutsideIcon({ kind }: { kind: OutsideKind }) {
  const Icon = OUTSIDE_ICON[kind]
  return <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
}
