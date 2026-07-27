import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// ── Verify caller is an admin ─────────────────────────────────────────────

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  try {
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) return false;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie);
    // Check custom claim OR fall back to Firestore role
    if (decoded.admin) return true;
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    return userDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}

// ── Seed data ─────────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { name: 'Java',            icon: '☕', color: '#FF9500', description: 'Core Java, OOP, concurrency, JVM internals and Spring.',       order: 1 },
  { name: 'Python',          icon: '🐍', color: '#5E9EFF', description: 'Python syntax, data science, async, decorators, and frameworks.', order: 2 },
  { name: 'JavaScript',      icon: '⚡', color: '#FFD60A', description: 'ES6+, closures, event loop, promises, and browser APIs.',         order: 3 },
  { name: 'React',           icon: '⚛️', color: '#64D2FF', description: 'Hooks, state management, performance, and component patterns.',    order: 4 },
  { name: 'System Design',   icon: '🏗️', color: '#BF5AF2', description: 'Scalability, databases, caching, messaging, and distributed systems.', order: 5 },
  { name: 'Data Structures', icon: '📊', color: '#30D158', description: 'Arrays, trees, graphs, hash maps, and algorithm complexity.',     order: 6 },
];

// ── GET /api/admin/interviews/categories — list all ───────────────────────

export async function GET() {
  try {
    const snap = await adminDb
      .collection('interviewCategories')
      .orderBy('order', 'asc')
      .get();
    const categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('[categories GET]', err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

// ── POST /api/admin/interviews/categories — create or seed ────────────────

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Special action: seed default categories
    if (body.action === 'seed') {
      const existing = await adminDb.collection('interviewCategories').limit(1).get();
      if (!existing.empty) {
        return NextResponse.json({ message: 'Already seeded', seeded: 0 });
      }
      const batch = adminDb.batch();
      const now = new Date().toISOString();
      for (const cat of SEED_CATEGORIES) {
        const ref = adminDb.collection('interviewCategories').doc();
        batch.set(ref, { ...cat, createdAt: now });
      }
      await batch.commit();
      return NextResponse.json({ message: 'Seeded', seeded: SEED_CATEGORIES.length });
    }

    // Normal create
    const { name, icon, color, description, order } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const now = new Date().toISOString();
    const ref = await adminDb.collection('interviewCategories').add({
      name, icon: icon || '📌', color: color || '#FF9500',
      description: description || '', order: order ?? 99, createdAt: now,
    });
    return NextResponse.json({ id: ref.id, name });
  } catch (err) {
    console.error('[categories POST]', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// ── DELETE /api/admin/interviews/categories — delete one ──────────────────

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await adminDb.collection('interviewCategories').doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    console.error('[categories DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// ── PATCH /api/admin/interviews/categories — update one ───────────────────

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    delete patch.createdAt; // never overwrite
    await adminDb.collection('interviewCategories').doc(id).update(patch);
    return NextResponse.json({ updated: id });
  } catch (err) {
    console.error('[categories PATCH]', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
