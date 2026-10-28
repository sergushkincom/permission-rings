import type { ReactNode } from 'react'

export type PlanRow = { at: string; text: ReactNode }

export function AgentPlan({ rows, editable }: { rows: PlanRow[]; editable: boolean }) {
  return (
    <section
      aria-labelledby="plan-heading"
      className="rounded-xl border border-hairline bg-card px-5 py-4 shadow-xs"
    >
      <h2 id="plan-heading" className="text-sm leading-5 font-semibold text-foreground">
        What the scheduler does next
      </h2>
      <ol className="mt-3 flex flex-col gap-2.5">
        {rows.map((row) => (
          <li key={row.at} className="flex items-baseline gap-6 text-sm leading-5">
            <span className="w-[72px] shrink-0 text-[13px] tabular-nums text-muted-foreground">{row.at}</span>
            <span className="text-foreground">{row.text}</span>
          </li>
        ))}
      </ol>
      {editable && (
        <p className="mt-4 text-[13px] leading-[18px] text-muted-foreground">
          You can change any of these. Click an underlined word to switch it.
        </p>
      )}
    </section>
  )
}

export function PlanChoice({ value, label, onCycle }: { value: string; label: string; onCycle: () => void }) {
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`${label}, currently ${value}. Change`}
      className="rounded-sm font-medium text-settled underline decoration-settled/40 underline-offset-4 hover:decoration-settled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled"
    >
      {value}
    </button>
  )
}
