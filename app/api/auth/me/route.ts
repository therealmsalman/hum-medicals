import { NextResponse } from 'next/server';
import { currentUser, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(
    { user: user ? publicUser(user) : null },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

