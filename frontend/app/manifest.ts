import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'triagenet-jharkhand-pwa',
    name: 'TriageNet — Jharkhand State Healthcare Resource & 108 Dispatch Command',
    short_name: 'TriageNet',
    description:
      'State-wide intelligent healthcare resource allocation, dynamic ICU bed tracking, and 108 emergency ambulance spatial dispatch network across 24 districts.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#100904',
    categories: ['health', 'medical', 'government', 'productivity'],
    orientation: 'portrait-primary',
    lang: 'en-IN',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/triagenet-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/triagenet-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Command Dashboard',
        short_name: 'Dashboard',
        description: 'Open Jharkhand Statewide Healthcare Operations Dashboard',
        url: '/dashboard',
        icons: [{ src: '/triagenet-logo.png', sizes: '192x192' }],
      },
      {
        name: 'Staff Authentication',
        short_name: 'Login',
        description: 'Login to TriageNet Command Portal',
        url: '/login',
        icons: [{ src: '/triagenet-logo.png', sizes: '192x192' }],
      },
    ],
  };
}

