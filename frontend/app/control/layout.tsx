import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Director Operations & Clinical Autopilot Control Center',
  description:
    'State director control console with BroadcastChannel scenario triggers, 6-role persona switching, and automated incident injection.',
  alternates: {
    canonical: '/control',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Director Operations & Autopilot — TriageNet',
    description:
      'Remote operations and scenario injector console for emergency triage simulation.',
    url: '/control',
    type: 'website',
  },
};

export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
