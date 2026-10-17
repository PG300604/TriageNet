import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://triagenet.gov.in').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/portal',
          '/downloads',
          '/ambulance',
          '/simulator',
          '/onboarding',
          '/privacy',
          '/terms',
          '/recovery',
        ],
        disallow: ['/api/', '/dashboard', '/control'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
