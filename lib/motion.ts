import { useSyncExternalStore } from 'react'

export const EASE_SETTLE = 'cubic-bezier(.22,1,.36,1)'

export const TIMING = {
  // Drop landing and the ring pulse that confirms it. Both stay inside 300–450ms.
  // Durations are also set on .anim-face-land and .anim-ring-land.
  land: 400,
  ringFlash: 400,
  settleDelay: 120,
  settle: 200,
  counterDelay: 320,
  count: 400,
  daysDelay: 720,
  travel: 450,
  travelStagger: 20,
}

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
