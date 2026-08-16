import type { Metadata } from 'next'
import { Dashboard } from '@/components/triagenet/dashboard'

export const metadata: Metadata = {
  title: 'Command Operations & Regional Capacity Dashboard',
  description:
    'Real-time clinical operations dashboard for hospital emergency triage, ICU bed surge management, 108 ambulance tactical dispatch, AI clinical decision support, and statewide resource coordination.',
  alternates: {
    canonical: '/dashboard',
  },
}

export default function DashboardPage() {
  return <Dashboard />
}

