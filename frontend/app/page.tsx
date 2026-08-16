import { LenisProvider } from '@/components/landing/lenis-provider'
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { ProblemSection } from '@/components/landing/problem-section'
import { InteractiveGraphShowcase } from '@/components/landing/interactive-graph-showcase'
import { HospitalCapacityRadar } from '@/components/landing/motion-primitives/hospital-capacity-radar'
import { HowItWorksPinned } from '@/components/landing/how-it-works-pinned'
import { AlgorithmShowcase } from '@/components/landing/algorithm-showcase'
import { StatsBand } from '@/components/landing/stats-band'
import { CtaFooter } from '@/components/landing/cta-footer'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
  description:
    'Algorithmic healthcare resource allocation platform for hospital surge capacity, dynamic priority queuing, Hungarian bipartite matching, and Dijkstra 108 ambulance regional routing across Jharkhand.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
    description:
      'Algorithmic healthcare resource allocation platform for hospital surge capacity, dynamic priority queuing, Hungarian bipartite matching, and Dijkstra 108 ambulance regional routing across Jharkhand.',
    url: '/',
  },
}


export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#100904] text-[#ffedd7] selection:bg-[#dc5000] selection:text-[#ffedd7] antialiased font-sans">
        <Navbar />
        <main>
          <Hero />
          <ProblemSection />
          <InteractiveGraphShowcase />
          <HospitalCapacityRadar />
          <HowItWorksPinned />
          <AlgorithmShowcase />
          <StatsBand />
        </main>
        <CtaFooter />
      </div>
    </LenisProvider>
  )
}
