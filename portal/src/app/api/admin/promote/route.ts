import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, secret } = body;

    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    // Bootstrap path: allow first-time admin promotion via secret key
    const bootstrapSecret = process.env.ADMIN_PROMOTE_SECRET;
    let callerIsAdmin = false;

    if (secret && bootstrapSecret && secret === bootstrapSecret) {
      callerIsAdmin = true;
    } else {
      // Normal path: verify caller is an existing admin via session cookie
      const sessionCookie = req.cookies.get('__session')?.value;
      if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      callerIsAdmin = !!decoded.admin;
    }

    if (!callerIsAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Set admin custom claim
    await adminAuth.setCustomUserClaims(uid, { admin: true });

    // Update Firestore profile
    await adminDb.collection('users').doc(uid).update({ role: 'admin' });

    return NextResponse.json({ status: 'ok', uid });
  } catch (err) {
    console.error('[promote] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
