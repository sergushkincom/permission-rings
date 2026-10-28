import { DAYS, type TimeOption } from '@/lib/loop-data'

type TimePickerProps = {
  slotName: string
  options: TimeOption[]
  onPick: (option: TimeOption) => void
  onCancel: () => void
}

export function TimePicker({ slotName, options, onPick, onCancel }: TimePickerProps) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mb-3 text-[13px] leading-[18px] text-muted-foreground">
        {`Times that work for everyone on ${slotName}. Picking one books it.`}
      </legend>
      {options.map((option) => (
        <button
          key={`${option.day}-${option.time}`}
          type="button"
          onClick={() => onPick(option)}
          className="h-8 rounded-md border border-strong bg-card px-3 text-[13px] font-medium tabular-nums text-foreground transition-colors hover:border-settled hover:text-settled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled"
        >
          {DAYS[option.day]}, {option.time}
        </button>
      ))}
      <button
        type="button"
        onClick={onCancel}
        className="ml-2 h-8 rounded-md px-2 text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled"
      >
        Cancel
      </button>
    </fieldset>
  )
}
