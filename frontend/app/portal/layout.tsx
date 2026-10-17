import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citizen Emergency Healthcare & Hospital Bed Portal',
  description:
    'Public emergency healthcare portal for Jharkhand citizens. Real-time hospital ICU bed availability, emergency 108 ambulance dispatch, and apex trauma facility discovery across 24 districts.',
  alternates: {
    canonical: '/portal',
  },
  openGraph: {
    title: 'Citizen Emergency Healthcare Portal — TriageNet Jharkhand',
    description:
      'Check real-time hospital bed availability, emergency ambulance helplines, and nearest apex healthcare facilities.',
    url: '/portal',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Jharkhand Citizen Emergency Healthcare Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizen Emergency Healthcare Portal — TriageNet Jharkhand',
    description:
      'Real-time ICU bed availability, 108 ambulance dispatch, and hospital locator.',
    images: ['/opengraph-image.png'],
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
