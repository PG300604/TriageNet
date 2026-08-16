import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TriageNet — Jharkhand State Healthcare Resource & 108 Dispatch Command',
    short_name: 'TriageNet',
    description:
      'State-wide intelligent healthcare resource allocation, dynamic ICU bed tracking, and 108 emergency ambulance spatial dispatch network across 24 districts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#382416',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
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
      },
    ],
  }
}
