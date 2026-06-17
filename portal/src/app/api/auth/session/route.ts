import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// POST /api/auth/session  — exchange Firebase ID token for a session cookie
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Verify token is valid (throws if not)
    await adminAuth.verifyIdToken(token);

    // Create a 5-day session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    const res = NextResponse.json({ status: 'ok' });
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    });
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[session] Error creating session cookie:', msg);

    // Common causes:
    // - "INVALID_ARGUMENT" → Email/Password auth not enabled in Firebase Console
    // - "Firebase ID token has incorrect 'aud'" → wrong project config
    // - "Cannot read properties of undefined" → Admin SDK not initialized
    return NextResponse.json(
      { error: 'Unauthorized', detail: msg },
      { status: 401 },
    );
  }
}

// DELETE /api/auth/session  — clear the session cookie (logout)
export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.set('__session', '', { maxAge: 0, path: '/' });
  return res;
}
