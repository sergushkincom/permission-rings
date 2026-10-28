import type { Person } from '@/lib/loop-data'

export function PersonCell({ person }: { person: Person | null }) {
  if (!person) {
    return (
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="size-8 shrink-0 rounded-full border border-dashed border-strong" />
        <span className="text-sm leading-5 text-muted-foreground">Nobody yet</span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={`/faces/${person.id}.png`}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-sm leading-5 text-foreground">{person.name}</p>
        <p className="truncate text-[13px] leading-[18px] text-muted-foreground">{person.role}</p>
      </div>
    </div>
  )
}
