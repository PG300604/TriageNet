import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Official Healthcare Portal Authentication',
  description:
    'Secure portal login for Government of Jharkhand health officials, District CMOs, Medical Superintendents, Triage Nurses, and 108 Ambulance Dispatchers.',
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
