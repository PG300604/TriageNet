import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download TriageNet Mobile Apps — Android APK, iOS & PWA Hub',
  description:
    'Official distribution portal for TriageNet mobile companion apps. Download Android APK, scan direct Wi-Fi QR code, and verify SHA-256 cryptographic checksums.',
  alternates: {
    canonical: '/downloads',
  },
  openGraph: {
    title: 'Download TriageNet Mobile Apps — Android & iOS Companions',
    description:
      'Official mobile application downloads for 108 ambulance paramedics, triage nurses, and hospital administrators.',
    url: '/downloads',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'TriageNet Mobile App Downloads Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download TriageNet Mobile Companion Apps',
    description:
      'Download Android APK and install the PWA mobile companion for field triage and emergency dispatch.',
    images: ['/opengraph-image.png'],
  },
};

export default function DownloadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
