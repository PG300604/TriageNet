import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  preload: false,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
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
    { name: 'TriageNet Research & AI Systems (Modeled for Jharkhand Healthcare)' },
  ],
  creator: 'TriageNet Systems Project',
  publisher: 'TriageNet Emergency Healthcare Project',
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
    siteName: 'TriageNet — Emergency Healthcare Allocation Network (Modeled for Jharkhand)',
    title: 'TriageNet — Intelligent Healthcare Resource & Ambulance Dispatch Model',
    description:
      'Real-time emergency triage, hospital ICU surge capacity, and ambulance dispatch simulation modeled for emergency healthcare in Jharkhand.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'TriageNet Jharkhand Emergency Healthcare Network — State Operations & 108 Dispatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TriageNet — Healthcare Resource Allocation Model (Jharkhand)',
    description:
      'Algorithmic healthcare resource allocation, dynamic ICU bed reservation, and spatial routing simulation.',
    images: ['/opengraph-image.png'],
    creator: '@TriageNet',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
      '@type': 'MedicalOrganization',
      '@id': '#organization',
      name: 'TriageNet Emergency Healthcare Project (Modeled for Jharkhand)',
      alternateName: ['TriageNet Emergency Systems', 'TriageNet Model'],
      url: '/',
      logo: '/triagenet-logo.png',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '108',
          contactType: 'Emergency Ambulance & Triage Dispatch (Modeled Helpline)',
          areaServed: 'IN-JH',
          availableLanguage: ['Hindi', 'English', 'Santhali', 'Ho', 'Mundari'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '104',
          contactType: 'State Health Helpline',
          areaServed: 'IN-JH',
        },
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': '#app',
      name: 'TriageNet',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'State-wide intelligent healthcare resource allocation and emergency ambulance dispatch simulation modeled for Jharkhand.',
      provider: {
        '@id': '#organization',
      },
    },
    {
      '@type': 'Service',
      '@id': '#service',
      name: 'TriageNet Emergency Triage & Dispatch Simulation',
      serviceType: 'Emergency Healthcare Resource Coordination Simulation',
      provider: {
        '@id': '#organization',
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
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        {/* Resource Hints: Preconnect & DNS-Prefetch for Map Tiles & External CDNs */}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />

        {/* PWA & Mobile Web Capabilities */}
        <meta name="application-name" content="TriageNet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TriageNet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />

        {/* Theme Color for Mobile Browsers */}
        <meta name="theme-color" content="#FAF6F0" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#100904" media="(prefers-color-scheme: dark)" />

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




