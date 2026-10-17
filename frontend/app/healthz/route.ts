import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse('healthy\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
