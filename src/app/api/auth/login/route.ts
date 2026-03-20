import { NextRequest, NextResponse } from 'next/server';
import { login, setSessionCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const token = await login(username, password);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    await setSessionCookie(token);

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Login failed', error: String(error) },
      { status: 500 }
    );
  }
}
