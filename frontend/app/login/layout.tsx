import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Login — TriageNet Command Portal',
  description:
    'Secure authentication portal for Jharkhand State Health Department personnel, District CMOs, Medical Superintendents, Triage Nurses, and 108 Ambulance Dispatchers.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Staff Login — TriageNet Command Portal',
    description:
      'Secure authentication portal for Jharkhand State Health Department personnel. Access hospital triage, ICU bed capacity, and 108 ambulance dispatch command.',
    url: '/login',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Staff Login — TriageNet Command Portal',
    description:
      'Secure authentication portal for Jharkhand State Health Department personnel.',
  },
};

const loginJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': '#login',
      name: 'TriageNet Command Portal — Staff Login',
      description:
        'Secure authentication portal for Jharkhand State Health Department personnel. Access hospital triage, ICU bed capacity, and 108 ambulance dispatch command.',
      isPartOf: { '@id': '#app' },
      about: { '@id': '#service' },
      potentialAction: {
        '@type': 'LoginAction',
        target: '/login',
      },
    },
  ],
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loginJsonLd) }}
      />
      {children}
    </>
  );
}

