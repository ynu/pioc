import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logout, clearSessionCookie } from '@/lib/auth/jwt';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pioc_auth_token')?.value;

    if (token) {
      await logout(token);
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Logout failed', error: String(error) },
      { status: 500 }
    );
  }
}
