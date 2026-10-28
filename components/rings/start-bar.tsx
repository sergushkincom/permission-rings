import { cn } from '@/lib/utils'

export function StartBar({ starting, onStart }: { starting: boolean; onStart: () => void }) {
  return (
    <section
      aria-label="Loops waiting"
      className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-5 py-2.5"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-settled" />
        <span className="text-sm leading-5 font-semibold text-foreground">3 loops waiting to be scheduled</span>
        <span className="text-[13px] leading-[18px] text-muted-foreground">Backend, Design systems, Product manager</span>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={starting}
        aria-busy={starting}
        className="grid h-9 shrink-0 items-center rounded-lg bg-settled px-4 text-sm leading-5 font-semibold text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled disabled:cursor-default"
      >
        <span
          aria-hidden={starting}
          className={cn('[grid-area:1/1] transition-opacity duration-200', starting && 'opacity-0')}
        >
          Let the scheduler start
        </span>
        <span
          aria-hidden={!starting}
          className={cn('[grid-area:1/1] text-center transition-opacity duration-200', !starting && 'opacity-0')}
        >
          {'Starting…'}
        </span>
      </button>
    </section>
  )
}
