// src/lib/firebase-admin.ts
// Server-only Firebase Admin SDK — DO NOT import in client components

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let _adminApp: App | null = null;
let _initError: string | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    _initError =
      '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY env var is not set. ' +
      'Session cookies and admin features will not work in production.';
    console.error(_initError);
    // Still initialize a projectId-only app so non-auth code can work.
    _adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-project',
    });
    return _adminApp;
  }

  try {
    // JSON.parse correctly converts \n escape sequences to real newlines
    // inside the private_key field — no pre-processing needed.
    const serviceAccount = JSON.parse(raw);
    _adminApp = initializeApp({ credential: cert(serviceAccount) });
    console.log('[firebase-admin] Admin SDK initialized successfully.');
    return _adminApp;
  } catch (err) {
    _initError = `[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${err instanceof Error ? err.message : String(err)}`;
    console.error(_initError);
    _adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-project',
    });
    return _adminApp;
  }
}

/**
 * Throws if the Admin SDK was not initialized with valid credentials.
 * Call this at the top of any API route that requires admin auth.
 */
export function assertAdminInitialized(): void {
  if (_initError) {
    throw new Error(_initError);
  }
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb   = getFirestore(adminApp);
export default adminApp;
