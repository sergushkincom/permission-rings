'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export function FitToWidth({ size, children }: { size: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / size))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [size])

  return (
    <div ref={ref} className="w-full" style={{ maxWidth: size, height: size * scale }}>
      <div style={{ width: size, height: size, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}
