// src/lib/firebase.ts
// Client-side Firebase SDK — safe to import in browser and server components
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!isConfigured && typeof window !== 'undefined') {
  console.warn(
    '[AlgoVerse] Firebase is not configured. ' +
    'Copy .env.example → .env.local and fill in your Firebase project values. ' +
    'Auth and Firestore features will be disabled until configured.'
  );
}

// Safely initialize — never crash at module level
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isConfigured) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db   = getFirestore(app);
  }
} catch (err) {
  console.error('[firebase] Initialization failed:', err);
}

export { app, auth, db };
export default app;

/** Asserts Firebase auth is initialized — throws a friendly error if env vars are missing */
export function getAuthInstance(): import('firebase/auth').Auth {
  if (!auth) throw new Error('[AlgoVerse] Firebase Auth is not initialized. Check your .env.local file.');
  return auth;
}

/** Asserts Firestore is initialized — throws a friendly error if env vars are missing */
export function getDbInstance(): import('firebase/firestore').Firestore {
  if (!db) throw new Error('[AlgoVerse] Firestore is not initialized. Check your .env.local file.');
  return db;
}
