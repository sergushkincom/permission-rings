import { DAYS, TARGET_DAY } from '@/lib/loop-data'
import { ShiftingText } from './shifting-text'

type StateLineProps = {
  confirmed: number
  total: number
  earliest: number
  ifNothing: number
}

export function StateLine({ confirmed, total, earliest, ifNothing }: StateLineProps) {
  const complete = confirmed === total
  const daysPast = earliest - TARGET_DAY

  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-y border-hairline py-4 text-base leading-6"
    >
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <ShiftingText
          value={String(confirmed)}
          after={` of ${total} confirmed.`}
          className="font-semibold text-foreground"
        />
        <ShiftingText
          value={DAYS[earliest]}
          rank={earliest}
          before={complete ? 'Loop complete ' : 'Earliest complete loop '}
          after="."
          className="text-muted-foreground"
        />
      </p>
      {complete ? (
        <p className={daysPast > 0 ? 'font-medium text-alert' : 'text-muted-foreground'}>
          {daysPast > 0 ? `Lands after the Fri 14 Nov target.` : 'Inside the Fri 14 Nov target.'}
        </p>
      ) : (
        <ShiftingText
          value={DAYS[ifNothing]}
          rank={ifNothing}
          before="If nothing changes, "
          after="."
          className="font-medium text-alert"
        />
      )}
    </div>
  )
}
