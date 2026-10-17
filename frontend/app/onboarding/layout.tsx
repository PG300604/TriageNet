import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Facility Onboarding & Capacity Registration',
  description:
    'Self-service institutional onboarding wizard for hospitals, community health centers, and trauma bays across all 24 districts of Jharkhand.',
  alternates: {
    canonical: '/onboarding',
  },
  openGraph: {
    title: 'Healthcare Facility Onboarding & Capacity Allocation — TriageNet',
    description:
      'Register hospital facilities, configure ICU wards, oxygen plants, and surgical duty rosters into the statewide emergency network.',
    url: '/onboarding',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Institutional Healthcare Facility Onboarding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hospital Facility Onboarding — TriageNet Jharkhand',
    description:
      'Five-step institutional facility setup wizard for hospital administrators and clinical leads.',
    images: ['/opengraph-image.png'],
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
