import { LenisProvider } from '@/components/landing/lenis-provider';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { ProblemSection } from '@/components/landing/problem-section';
import { InteractiveGraphShowcase } from '@/components/landing/interactive-graph-showcase';
import { HospitalCapacityRadar } from '@/components/landing/motion-primitives/hospital-capacity-radar';
import { HowItWorksPinned } from '@/components/landing/how-it-works-pinned';
import { AlgorithmShowcase } from '@/components/landing/algorithm-showcase';
import { StatsBand } from '@/components/landing/stats-band';
import { CtaFooter } from '@/components/landing/cta-footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
  description:
    'Algorithmic healthcare resource allocation platform for hospital surge capacity, dynamic priority queuing, Hungarian bipartite matching, and Dijkstra 108 ambulance regional routing across Jharkhand.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'TriageNet — Government of Jharkhand Emergency Healthcare Network',
    title: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
    description:
      'Algorithmic healthcare resource allocation platform for hospital surge capacity, dynamic priority queuing, Hungarian bipartite matching, and Dijkstra 108 ambulance regional routing across Jharkhand.',
    url: '/',
    images: [
      {
        url: '/ember-waves.png',
        width: 1200,
        height: 630,
        alt: 'TriageNet Jharkhand Emergency Healthcare Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
    description:
      'Algorithmic healthcare resource allocation platform for hospital surge capacity and Dijkstra 108 ambulance regional routing across Jharkhand.',
    images: ['/ember-waves.png'],
    site: '@TriageNetJH',
    creator: '@TriageNetJH',
  },
};

const landingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': '#landing',
      name: 'TriageNet — Intelligent Healthcare Resource & Emergency Dispatch Platform',
      description:
        'Algorithmic healthcare resource allocation platform for hospital surge capacity, dynamic priority queuing, Hungarian bipartite matching, and Dijkstra 108 ambulance regional routing across Jharkhand.',
      isPartOf: { '@id': '#app' },
      about: { '@id': '#service' },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: '/ember-waves.png',
        width: 1200,
        height: 630,
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': '#software',
      name: 'TriageNet',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'State-wide intelligent healthcare resource allocation and 108 emergency ambulance dispatch network for Jharkhand.',
      provider: { '@id': '#organization' },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
      />
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
    </>
  );
}
