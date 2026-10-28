import { DAYS, people, type Replacement } from '@/lib/loop-data'
import { PersonCell } from './person-cell'

type ReplacementListProps = {
  replacements: Replacement[]
  onChoose: (replacement: Replacement) => void
}

export function ReplacementList({ replacements, onChoose }: ReplacementListProps) {
  return (
    <div>
      <p className="mb-3 text-[13px] leading-[18px] text-muted-foreground">
        Two people who can take this slot. Choosing one books them.
      </p>
      <ul className="flex flex-col divide-y divide-hairline">
        {replacements.map((r) => {
          const person = people[r.person]
          const when = `${DAYS[r.day]}, ${r.time}`
          return (
            <li
              key={r.person}
              className="grid grid-cols-[230px_minmax(0,1fr)_auto_auto] items-center gap-6 py-3 first:pt-0 last:pb-0"
            >
              <PersonCell person={person} />
              <p className="flex flex-wrap items-center gap-x-2 text-[13px] leading-[18px] text-muted-foreground">
                <span>{r.facts[0]}</span>
                <span aria-hidden="true">·</span>
                <span>{r.facts[1]}</span>
              </p>
              <span className="text-[13px] leading-[18px] tabular-nums text-muted-foreground">Free {when}</span>
              <button
                type="button"
                onClick={() => onChoose(r)}
                aria-label={`Choose ${person.name} for ${when}`}
                className="h-8 rounded-md border border-strong bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:border-settled hover:text-settled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled"
              >
                Choose
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
