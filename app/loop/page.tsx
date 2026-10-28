import type { Metadata } from 'next'
import { LoopScreen } from '@/components/loop/loop-screen'

export const metadata: Metadata = {
  title: 'Daniel Okafor · Onsite loop',
  description: 'Two of four interviews booked. See what the scheduler is waiting on and what it does next.',
}

export default function LoopPage() {
  return <LoopScreen />
}
