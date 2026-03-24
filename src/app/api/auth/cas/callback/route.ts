import { NextRequest, NextResponse } from 'next/server';
import { validateCasTicket, casLogin, setSessionCookie } from '@/lib/auth/cas';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticket = searchParams.get('ticket');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!ticket) {
    return NextResponse.redirect(new URL('/login?error=no_ticket', request.url));
  }

  const validation = await validateCasTicket(ticket);

  if (!validation.valid || !validation.username) {
    return NextResponse.redirect(new URL('/login?error=invalid_ticket', request.url));
  }

  const token = await casLogin(
    validation.username,
    validation.attributes?.email,
    validation.attributes?.name
  );

  await setSessionCookie(token);

  return NextResponse.redirect(new URL('/my-apps', request.url));
}
