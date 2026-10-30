'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Briefcase, ClipboardCheck, UserPlus } from 'lucide-react'
import type { ContextKey, OutsideKind, RingKey } from '@/lib/panel-data'
import {
  CENTER,
  ENTITIES,
  FIELD,
  OUTSIDE_RADIUS,
  PERSON_RINGS,
  RING_LABEL,
  RING_LABEL_ANGLE,
  RING_RADIUS,
  entityRadius,
  initials,
  nearestRing,
  polar,
  type Entity,
  type Expiry,
  type Policies,
} from '@/lib/rings'
import { EASE_SETTLE, TIMING } from '@/lib/motion'
import { cn } from '@/lib/utils'

const TOOLTIP_HEIGHT = 28
const TOOLTIP_INSET = 8
const TOOLTIP_HALF_WIDTH = 130

const OUTSIDE_ICON: Record<OutsideKind, typeof UserPlus> = {
  candidates: UserPlus,
  agency: Briefcase,
  vendor: ClipboardCheck,
}

const CIRCLES: { ring: 'any' | 'hours' | 'ask'; color: string; width: number; opacity: number }[] = [
  { ring: 'ask', color: 'var(--alert)', width: 1.5, opacity: 0.28 },
  { ring: 'hours', color: 'var(--strong)', width: 1, opacity: 0.6 },
  { ring: 'any', color: 'var(--settled)', width: 1.5, opacity: 0.32 },
]

const RING_COLOR: Record<RingKey, string> = {
  any: 'var(--settled)',
  hours: 'var(--strong)',
  ask: 'var(--alert)',
  none: 'var(--strong)',
}

const BORDER: Record<RingKey, string> = {
  any: 'border-settled',
  hours: 'border-strong',
  ask: 'border-alert',
  none: 'border-strong',
}

const LABEL_TONE: Record<'any' | 'hours' | 'ask', string> = {
  any: 'text-settled-deep',
  hours: 'text-muted-foreground',
  ask: 'text-alert-deep',
}

type DragState = { id: string; x: number; y: number; ring: RingKey; valid: boolean }

type RingFieldProps = {
  context: ContextKey
  policies: Policies
  selectedId: string | null
  stagger: boolean
  landed: { ring: RingKey; version: number } | null
  spotlight: string[] | null
  candidateCount: number
  locked: Set<string>
  expiries: Record<string, Expiry>
  onSelect: (id: string | null) => void
  onDrop: (id: string, ring: RingKey) => void
}

const LAND_COLOR: Record<RingKey, string> = {
  any: 'var(--settled)',
  hours: 'var(--muted-foreground)',
  ask: 'var(--alert)',
  none: 'var(--muted-foreground)',
}

export function RingField({
  context,
  policies,
  selectedId,
  stagger,
  landed,
  spotlight,
  candidateCount,
  locked,
  expiries,
  onSelect,
  onDrop,
}: RingFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const pressRef = useRef<{ id: string; x: number; y: number; offsetX: number; offsetY: number } | null>(null)
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
    if (e.button !== 0 || locked.has(entity.id)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pointer = toField(e)
    const origin = polar(entity.angle, entityRadius(entity, policies[entity.id][context]))
    pressRef.current = {
      id: entity.id,
      x: e.clientX,
      y: e.clientY,
      offsetX: pointer.x - origin.x,
      offsetY: pointer.y - origin.y,
    }
    draggedRef.current = false
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>, entity: Entity) {
    const press = pressRef.current
    if (!press || press.id !== entity.id) return
    if (!draggedRef.current && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 8) return
    draggedRef.current = true
    const pointer = toField(e)
    const p = { x: pointer.x - press.offsetX, y: pointer.y - press.offsetY }
    const distance = Math.hypot(p.x - CENTER, p.y - CENTER)
    if (entity.kind === 'person') {
      setDrag({ id: entity.id, ...p, ring: nearestRing(distance, PERSON_RINGS), valid: true })
    } else if (distance < RING_RADIUS.ask + 14) {
      setDrag({ id: entity.id, ...p, ring: nearestRing(distance, PERSON_RINGS), valid: false })
    } else {
      const ring: RingKey = distance < (OUTSIDE_RADIUS.ask + OUTSIDE_RADIUS.none) / 2 ? 'ask' : 'none'
      setDrag({ id: entity.id, ...p, ring, valid: true })
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

  const draggedEntity = drag ? ENTITIES.find((e) => e.id === drag.id) : undefined
  const highlightRing = drag && (draggedEntity?.kind === 'person' || !drag.valid) ? drag.ring : null

  const hovered = hoverId && !drag ? ENTITIES.find((e) => e.id === hoverId) : undefined
  const hoveredPos = hovered ? polar(hovered.angle, entityRadius(hovered, policies[hovered.id][context])) : null
  const tooltipBelow = !!hovered && !!hoveredPos && hoveredPos.y - hovered.size / 2 - 10 - TOOLTIP_HEIGHT < TOOLTIP_INSET
  const tooltipAlign: 'start' | 'center' | 'end' = !hoveredPos
    ? 'center'
    : hoveredPos.x < TOOLTIP_HALF_WIDTH
      ? 'start'
      : hoveredPos.x > FIELD - TOOLTIP_HALF_WIDTH
        ? 'end'
        : 'center'

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
        {CIRCLES.map(({ ring, color, width, opacity }) => {
          const highlighted = highlightRing === ring
          return (
            <circle
              key={ring === 'ask' ? `ask-${rejectCount}` : ring}
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS[ring]}
              fill="none"
              stroke={highlighted && !drag?.valid ? 'var(--alert)' : color}
              strokeWidth={highlighted ? 3 : width}
              strokeOpacity={highlighted ? 1 : opacity}
              className={cn(
                'transition-[stroke-width,stroke-opacity] duration-150',
                ring === 'ask' && rejectCount > 0 && 'anim-ring-alert',
              )}
            />
          )
        })}
        {landed && landed.ring !== 'none' && (
          <circle
            key={landed.version}
            cx={CENTER}
            cy={CENTER}
            r={RING_RADIUS[landed.ring]}
            fill="none"
            stroke={LAND_COLOR[landed.ring]}
            strokeWidth={2.5}
            opacity={0}
            className="anim-ring-land"
          />
        )}
      </svg>

      {CIRCLES.map(({ ring }) => {
        const p = polar(RING_LABEL_ANGLE, RING_RADIUS[ring] + 10)
        return (
          <span
            key={ring}
            className={cn(
              'pointer-events-none absolute -translate-x-full whitespace-nowrap bg-card px-1 text-[11px] leading-4 font-semibold tracking-[0.06em] uppercase',
              LABEL_TONE[ring],
            )}
            style={{ left: p.x, top: p.y }}
          >
            {RING_LABEL[ring]}
          </span>
        )
      })}

      <span
        className="pointer-events-none absolute -translate-x-full -translate-y-1/2 whitespace-nowrap text-[13px] leading-[18px] text-muted-foreground"
        style={{ left: CENTER + 56, top: CENTER + 272 }}
      >
        Outside the company
      </span>

      <img
        src="/faces/denys.png"
        alt="You, hiring manager"
        draggable={false}
        className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover ring-2 ring-card"
        style={{ left: CENTER, top: CENTER }}
      />

      {ENTITIES.map((entity, index) => {
        const ring = policies[entity.id][context]
        const target = polar(entity.angle, entityRadius(entity, ring))
        const isDragging = drag?.id === entity.id
        const pos = isDragging ? { x: drag.x, y: drag.y } : target
        const selected = selectedId === entity.id
        const isCandidates = entity.kind === 'outside' && entity.party.kind === 'candidates'
        const lit = spotlight?.includes(entity.id) ?? false
        const dimmed = spotlight !== null && !lit
        const scaled = isDragging || (hoverId === entity.id && !drag)
        const selfSet = locked.has(entity.id)
        const expiry = expiries[entity.id]
        const label =
          entity.kind === 'person'
            ? [
                entity.person.name,
                `${entity.person.interviewHoursPerWeek} h a week`,
                RING_LABEL[ring],
                selfSet ? 'set by them' : null,
                expiry?.label ?? null,
              ]
                .filter(Boolean)
                .join(', ')
            : `${entity.party.name}, ${RING_LABEL[ring]}${isCandidates ? `, ${candidateCount} waiting` : ''}`

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
              'absolute left-0 top-0 flex items-center justify-center rounded-full font-semibold outline-none',
              'focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-settled',
              selfSet ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
              entity.kind === 'person'
                ? 'bg-card text-chip-foreground'
                : cn('border-2', BORDER[ring], ring === 'ask' ? 'bg-alert-soft text-alert' : 'bg-chip text-muted-foreground'),
              selected && !isCandidates && 'outline-2 outline-offset-[6px] outline-settled',
              selected && isCandidates && 'outline-2 outline-offset-2 outline-alert',
              lit && 'outline-2 outline-offset-2 outline-settled',
              isDragging ? 'z-30 shadow-float' : hoverId === entity.id || lit ? 'z-20' : 'z-10',
            )}
            style={{
              width: entity.size,
              height: entity.size,
              fontSize: Math.max(10, Math.round(entity.size * 0.3)),
              translate: `${pos.x - entity.size / 2}px ${pos.y - entity.size / 2}px`,
              scale: scaled ? '1.08' : '1',
              opacity: dimmed ? 0.4 : 1,
              transition: isDragging
                ? 'scale 120ms ease-out'
                : [
                    stagger
                      ? `translate ${TIMING.travel}ms ${EASE_SETTLE} ${index * TIMING.travelStagger}ms`
                      : `translate ${TIMING.settle}ms ${EASE_SETTLE} ${TIMING.settleDelay}ms`,
                    'scale 120ms ease-out',
                    'opacity 150ms ease-out',
                  ].join(', '),
            }}
          >
            {entity.kind === 'person' ? (
              <>
                <span
                  className={cn(
                    'pointer-events-none absolute flex items-center justify-center overflow-hidden rounded-full bg-avatar-1',
                    selfSet ? 'inset-[4px]' : 'inset-0',
                  )}
                >
                  <span aria-hidden="true">{initials(entity.person.name)}</span>
                  <img
                    src={`/faces/${entity.id}.png`}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 size-full object-cover"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-full border-2 transition-colors duration-300',
                    BORDER[ring],
                  )}
                />
                {expiry && <TemporaryArc size={entity.size} color={RING_COLOR[ring]} />}
              </>
            ) : (
              <OutsideIcon kind={entity.party.kind} />
            )}
            {isCandidates && candidateCount > 0 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#EA580C] text-[10px] leading-none font-semibold tabular-nums text-white"
              >
                {candidateCount}
              </span>
            )}
          </button>
        )
      })}

      {hovered && hoveredPos && (
        <div
          key={hovered.id}
          role="tooltip"
          className={cn(
            'anim-tooltip pointer-events-none absolute z-40 whitespace-nowrap rounded-[6px] bg-tooltip px-2 py-1.5 text-xs text-white tabular-nums shadow-float',
            tooltipBelow ? 'translate-y-0' : '-translate-y-full',
            tooltipAlign === 'center' && '-translate-x-1/2',
            tooltipAlign === 'end' && '-translate-x-full',
          )}
          style={{
            left:
              tooltipAlign === 'start'
                ? Math.max(TOOLTIP_INSET, hoveredPos.x - hovered.size / 2)
                : tooltipAlign === 'end'
                  ? Math.min(FIELD - TOOLTIP_INSET, hoveredPos.x + hovered.size / 2)
                  : hoveredPos.x,
            top: tooltipBelow ? hoveredPos.y + hovered.size / 2 + 10 : hoveredPos.y - hovered.size / 2 - 10,
          }}
        >
          {hovered.kind === 'person'
            ? `${hovered.person.name}, ${hovered.person.interviewHoursPerWeek} h a week${
                expiries[hovered.id] ? `, ${expiries[hovered.id].label}` : ''
              }`
            : hovered.party.name}
        </div>
      )}
    </div>
  )
}

function TemporaryArc({ size, color }: { size: number; color: string }) {
  const pad = 7
  const box = size + pad * 2
  const c = box / 2
  const r = size / 2 + 4
  const d = r * Math.SQRT1_2
  return (
    <svg
      aria-hidden="true"
      width={box}
      height={box}
      viewBox={`0 0 ${box} ${box}`}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: -pad, top: -pad }}
    >
      <path
        d={`M ${c - d} ${c - d} A ${r} ${r} 0 0 1 ${c + d} ${c - d}`}
        fill="none"
        stroke={color === 'var(--strong)' ? 'var(--muted-foreground)' : color}
        strokeWidth={1.5}
        strokeDasharray="3 2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function OutsideIcon({ kind }: { kind: OutsideKind }) {
  const Icon = OUTSIDE_ICON[kind]
  return <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
}
