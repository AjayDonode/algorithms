import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/interviews/submit
 * Authenticated users submit interview questions.
 * Uses Admin SDK so it bypasses Firestore client-side rules entirely.
 */
export async function POST(req: NextRequest) {
  // Verify the user is logged in
  const sessionCookie = req.cookies.get('__session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'You must be logged in to submit a question.' }, { status: 401 });
  }

  let uid: string;
  let displayName: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie);
    uid = decoded.uid;
    displayName = decoded.name ?? decoded.email ?? 'Anonymous';
  } catch {
    return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { categoryId, question, answer, difficulty, tags, submittedByName } = body;

    if (!categoryId || !question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'categoryId, question, and answer are required.' }, { status: 400 });
    }

    const allowed = ['easy', 'medium', 'hard'];
    if (!allowed.includes(difficulty)) {
      return NextResponse.json({ error: 'difficulty must be easy, medium, or hard.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ref = await adminDb.collection('interviewQuestions').add({
      categoryId,
      question:        question.trim(),
      answer:          answer.trim(),
      difficulty,
      tags:            Array.isArray(tags) ? tags : [],
      status:          'pending',
      submittedBy:     uid,
      submittedByName: submittedByName ?? displayName,
      createdAt:       now,
      approvedAt:      null,
    });

    return NextResponse.json({ id: ref.id, status: 'pending' });
  } catch (err) {
    console.error('[submit question]', err);
    return NextResponse.json({ error: 'Failed to save question. Please try again.' }, { status: 500 });
  }
}
