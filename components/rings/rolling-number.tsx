import { EASE_SETTLE, TIMING } from '@/lib/motion'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function RollingNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const digits = String(value).split('')
  return (
    <span className="inline-flex">
      <span className="sr-only">{value}</span>
      {digits.map((char, i) => {
        const place = digits.length - i
        const d = Number(char)
        return (
          <span key={place} aria-hidden="true" className="relative inline-block h-[1lh] overflow-hidden">
            <span className="invisible">0</span>
            <span
              data-roll
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{
                transform: `translateY(${-d * 10}%)`,
                transition: `transform ${TIMING.count}ms ${EASE_SETTLE} ${delay}ms`,
              }}
            >
              {DIGITS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
