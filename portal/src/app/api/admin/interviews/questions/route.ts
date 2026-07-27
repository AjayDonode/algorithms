import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// ── Verify caller is an admin ─────────────────────────────────────────────

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  try {
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) return false;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie);
    if (decoded.admin) return true;
    // Fallback: check Firestore role (works even before custom claim propagates)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    return userDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}

// ── GET /api/admin/interviews/questions?status=pending|all ────────────────

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending' | 'all'

    let query = adminDb.collection('interviewQuestions').orderBy('createdAt', 'desc');

    if (status === 'pending') {
      query = adminDb
        .collection('interviewQuestions')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc') as typeof query;
    }

    const snap = await query.limit(200).get();
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[questions GET]', err);
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}

// ── PATCH /api/admin/interviews/questions — approve or reject ─────────────

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, action } = await req.json(); // action: 'approve' | 'reject'
    if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });

    if (action === 'approve') {
      await adminDb.collection('interviewQuestions').doc(id).update({
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });
    } else if (action === 'reject') {
      await adminDb.collection('interviewQuestions').doc(id).update({ status: 'rejected' });
    } else {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    return NextResponse.json({ updated: id, action });
  } catch (err) {
    console.error('[questions PATCH]', err);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// ── DELETE /api/admin/interviews/questions ────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await adminDb.collection('interviewQuestions').doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    console.error('[questions DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
