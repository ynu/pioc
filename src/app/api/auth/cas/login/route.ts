import { NextResponse } from 'next/server';
import { getCasLoginUrl } from '@/lib/auth/cas';

export async function GET() {
  const redirectUrl = getCasLoginUrl();
  return NextResponse.redirect(redirectUrl);
}
