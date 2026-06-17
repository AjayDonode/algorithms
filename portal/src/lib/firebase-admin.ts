// src/lib/firebase-admin.ts
// Server-only Firebase Admin SDK — DO NOT import in client components

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    console.warn(
      '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is not set. ' +
      'Session cookies and admin features will not work.'
    );
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-project',
    });
  }

  try {
    // JSON.parse correctly converts \n escape sequences to real newlines
    // inside the private_key field — no pre-processing needed.
    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-project',
    });
  }
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb   = getFirestore(adminApp);
export default adminApp;
