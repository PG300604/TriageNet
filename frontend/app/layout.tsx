import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://triagenet.gov.in'),
  title: {
    default: 'TriageNet — Jharkhand State Healthcare Resource & 108 Emergency Dispatch System',
    template: '%s | TriageNet Jharkhand',
  },
  description:
    'State-wide intelligent emergency triage, real-time ICU bed capacity tracking, Hungarian algorithm bed matching, and 108 ambulance Dijkstra spatial routing across 111 hospitals in 24 districts of Jharkhand.',
  keywords: [
    'TriageNet',
    'Jharkhand Healthcare System',
    '108 Ambulance Dispatch',
    'Emergency Hospital Triage',
    'ICU Bed Availability Jharkhand',
    'RIMS Ranchi Bed Capacity',
    'Dijkstra Road Routing Ambulances',
    'Hungarian Algorithm Patient Matching',
    'National Health Mission Jharkhand',
    'Ayushman Bharat Hospital Network',
    'Emergency Medicine AI CDS',
    'Medical Superintendent Command Dashboard',
  ],
  authors: [
    { name: 'Department of Health, Medical Education & Family Welfare, Government of Jharkhand' },
    { name: 'TriageNet AI Systems' },
  ],
  creator: 'Department of Health & Family Welfare, Government of Jharkhand',
  publisher: 'National Health Mission (NHM) Jharkhand',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://triagenet.gov.in',
    siteName: 'TriageNet — Government of Jharkhand Emergency Healthcare Network',
    title: 'TriageNet — Intelligent Healthcare Resource & 108 Ambulance Dispatch',
    description:
      'Real-time emergency triage, hospital ICU surge capacity, and 108 ambulance dispatch command across all 24 districts of Jharkhand.',
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
    title: 'TriageNet — Jharkhand State Emergency Triage & 108 Dispatch',
    description:
      'Algorithmic healthcare resource allocation, dynamic ICU bed reservation, and 108 ambulance spatial routing network.',
    images: ['/ember-waves.png'],
    creator: '@TriageNetJH',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/triagenet-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/triagenet-logo.png',
    apple: '/triagenet-logo.png',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#100904' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://triagenet.gov.in/#app',
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
    },
    {
      '@type': 'GovernmentService',
      '@id': 'https://triagenet.gov.in/#service',
      name: 'Jharkhand Emergency Triage & 108 Dispatch Network',
      serviceType: 'Emergency Healthcare Resource Coordination',
      provider: {
        '@type': 'GovernmentOrganization',
        name: 'Department of Health & Family Welfare, Government of Jharkhand',
        url: 'https://triagenet.gov.in',
      },
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Jharkhand, India',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        {/* Favicon and Apple Touch Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/triagenet-logo.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/triagenet-logo.png" />

        {/* Resource Hints: Preconnect & DNS-Prefetch for Fast CDN and Map Tile Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />


        {/* PWA & Mobile Web Capabilities */}
        <meta name="application-name" content="TriageNet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TriageNet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-[#dc5000] selection:text-[#ffedd7]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}



