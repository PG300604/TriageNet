import type { Metadata } from 'next';
import { Dashboard } from '@/components/triagenet/dashboard';

export const metadata: Metadata = {
  title: 'Command Operations & Regional Capacity Dashboard',
  description:
    'Real-time clinical operations dashboard for hospital emergency triage, ICU bed surge management, 108 ambulance tactical dispatch, AI clinical decision support, and statewide resource coordination.',
  alternates: {
    canonical: '/dashboard',
  },
  openGraph: {
    title: 'TriageNet Command Dashboard',
    description:
      'Real-time hospital ICU bed capacity, triage queue status, and 108 ambulance dispatch telemetry across Jharkhand.',
    url: '/dashboard',
    type: 'website',
    images: [
      {
        url: '/ember-waves.png',
        width: 1200,
        height: 630,
        alt: 'TriageNet Command Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TriageNet Command Dashboard',
    description:
      'Real-time hospital ICU bed capacity, triage queue status, and 108 ambulance dispatch telemetry across Jharkhand.',
    images: ['/ember-waves.png'],
    creator: '@TriageNetJH',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': 0,
    },
  },
};

const dashboardJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': '#dashboard',
      name: 'TriageNet Command Dashboard',
      description:
        'Real-time clinical operations dashboard for hospital emergency triage, ICU bed surge management, 108 ambulance tactical dispatch, and statewide resource coordination.',
      isPartOf: { '@id': '#app' },
      about: { '@id': '#service' },
      potentialAction: {
        '@type': 'ViewAction',
        target: '/dashboard',
        name: 'View TriageNet Command Dashboard',
      },
    },
  ],
};

export default function DashboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardJsonLd) }}
      />
      <Dashboard />
    </>
  );
}
