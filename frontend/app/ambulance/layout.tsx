import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '108 Ambulance EMT Field Terminal & Green Wave Telemetry',
  description:
    'Paramedic mobile companion for 108 emergency ambulances. Real-time patient vital sign entry, GCS slider, ITMS green wave traffic preemption, and AI trauma routing across Jharkhand.',
  alternates: {
    canonical: '/ambulance',
  },
  openGraph: {
    title: '108 Ambulance EMT Field Terminal — TriageNet Jharkhand',
    description:
      'Field terminal for 108 emergency ambulances with real-time vitals, trauma bay pre-alert, and ITMS green wave preemption.',
    url: '/ambulance',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: '108 Ambulance EMT Field Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '108 Ambulance EMT Field Terminal — TriageNet',
    description:
      'Paramedic field terminal with live vitals, GCS tracking, and highway traffic preemption.',
    images: ['/opengraph-image.png'],
  },
};

export default function AmbulanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
