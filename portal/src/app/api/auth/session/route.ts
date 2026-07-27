import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, assertAdminInitialized } from '@/lib/firebase-admin';

// POST /api/auth/session  — exchange Firebase ID token for a session cookie
export async function POST(req: NextRequest) {
  try {
    // Fail fast with a clear error if Admin SDK has no credentials
    assertAdminInitialized();

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
    // - "FIREBASE_SERVICE_ACCOUNT_KEY env var is not set" → secret not linked in App Hosting
    // - "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY" → secret value is malformed JSON
    // - "INVALID_ARGUMENT" → Email/Password auth not enabled in Firebase Console
    // - "Firebase ID token has incorrect 'aud'" → wrong project config
    return NextResponse.json(
      { error: 'Internal server error', detail: msg },
      { status: 500 },
    );
  }
}

// DELETE /api/auth/session  — clear the session cookie (logout)
export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.set('__session', '', { maxAge: 0, path: '/' });
  return res;
}
