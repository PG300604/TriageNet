import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mobile Smartphone Companion Simulator',
  description:
    'In-browser interactive smartphone simulator for testing all 4 companion roles (108 Ambulance EMT, Triage Nurse, Hospital Superintendent, District CMO).',
  alternates: {
    canonical: '/simulator',
  },
  openGraph: {
    title: 'Mobile Smartphone Simulator — TriageNet Jharkhand',
    description:
      'Zero-install smartphone simulator for testing ambulance EMT, nurse bedside, and administrator mobile views.',
    url: '/simulator',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'TriageNet Mobile Smartphone Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile Smartphone Simulator — TriageNet',
    description:
      'Test all 4 clinical mobile companion interfaces directly in your browser.',
    images: ['/opengraph-image.png'],
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
