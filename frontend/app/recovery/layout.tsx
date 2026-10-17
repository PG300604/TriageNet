import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Account Credential & Access Recovery',
  description:
    'Official credential recovery, OTP verification, and emergency access restoration for Jharkhand state healthcare personnel.',
  alternates: {
    canonical: '/recovery',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Staff Credential Recovery — TriageNet',
    description:
      'Official access recovery portal for Jharkhand state healthcare personnel.',
    url: '/recovery',
    type: 'website',
  },
};

export default function RecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
