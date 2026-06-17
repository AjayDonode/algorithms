// src/lib/firestore.ts
// Typed Firestore helpers — called from client components and API routes

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, orderBy, limit, where,
} from 'firebase/firestore';
import { getDbInstance } from './firebase';

// ── Types ─────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ScratchpadLang = 'java' | 'python' | 'javascript';

export interface Scratchpad {
  id: string;
  title: string;
  lang: ScratchpadLang;
  code: string;
  notes: string;
  category: string;
  savedAt: string;
  updatedAt: string;
  // Sharing
  isShared?: boolean;
  ownerName?: string;
  sharedAt?: string;
}

/** Denormalised document in top-level `sharedScratchpads` collection */
export interface SharedScratchpad {
  id: string;          // same as the scratchpad item doc id
  ownerUid: string;
  ownerName: string;
  title: string;
  lang: ScratchpadLang;
  code: string;
  notes: string;
  category: string;
  sharedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  publishedAt: string | null;
  isDraft: boolean;
  createdAt: string;
}

// ── User Profiles ─────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDbInstance();
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, data: Omit<UserProfile, 'uid'>): Promise<void> {
  const db = getDbInstance();
  await setDoc(doc(db, 'users', uid), { uid, ...data }, { merge: true });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const db = getDbInstance();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => d.data() as UserProfile);
}

// ── Scratchpads ───────────────────────────────────────────────────────────

export async function getScratchpads(uid: string): Promise<Scratchpad[]> {
  const db = getDbInstance();
  const q = query(
    collection(db, 'scratchpads', uid, 'items'),
    orderBy('savedAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Scratchpad));
}

export async function saveScratchpad(
  uid: string,
  data: Omit<Scratchpad, 'id' | 'savedAt' | 'updatedAt'>,
): Promise<string> {
  const db = getDbInstance();
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, 'scratchpads', uid, 'items'), {
    ...data,
    savedAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateScratchpad(
  uid: string,
  id: string,
  patch: Partial<Omit<Scratchpad, 'id' | 'savedAt'>>,
): Promise<void> {
  const db = getDbInstance();
  await updateDoc(doc(db, 'scratchpads', uid, 'items', id), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteScratchpad(uid: string, id: string): Promise<void> {
  const db = getDbInstance();
  await deleteDoc(doc(db, 'scratchpads', uid, 'items', id));
  // Also remove from shared collection if it was shared
  try { await deleteDoc(doc(db, 'sharedScratchpads', id)); } catch { /* ok */ }
}

// ── Shared Scratchpads ────────────────────────────────────────

export async function shareScratchpad(
  uid: string,
  id: string,
  ownerName: string,
  data: Pick<Scratchpad, 'title' | 'lang' | 'code' | 'notes' | 'category'>,
): Promise<void> {
  const db = getDbInstance();
  const now = new Date().toISOString();
  // Mark owner's item as shared
  await updateDoc(doc(db, 'scratchpads', uid, 'items', id), {
    isShared: true,
    ownerName,
    sharedAt: now,
    updatedAt: now,
  });
  // Write/overwrite denormalised doc in top-level collection
  await setDoc(doc(db, 'sharedScratchpads', id), {
    ownerUid: uid,
    ownerName,
    title: data.title,
    lang: data.lang,
    code: data.code,
    notes: data.notes,
    category: data.category,
    sharedAt: now,
  } satisfies Omit<SharedScratchpad, 'id'>);
}

export async function unshareScratchpad(uid: string, id: string): Promise<void> {
  const db = getDbInstance();
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'scratchpads', uid, 'items', id), {
    isShared: false,
    updatedAt: now,
  });
  await deleteDoc(doc(db, 'sharedScratchpads', id));
}

export async function getSharedScratchpads(max = 50): Promise<SharedScratchpad[]> {
  const db = getDbInstance();
  const q = query(
    collection(db, 'sharedScratchpads'),
    orderBy('sharedAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SharedScratchpad));
}

// ── Blog Posts ────────────────────────────────────────────────────────────

export async function getPublishedPosts(max = 50): Promise<BlogPost[]> {
  const db = getDbInstance();
  const q = query(
    collection(db, 'posts'),
    where('isDraft', '==', false),
    orderBy('publishedAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const db = getDbInstance();
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDbInstance();
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BlogPost;
}

export async function createPost(data: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> {
  const db = getDbInstance();
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, 'posts'), { ...data, createdAt: now });
  return ref.id;
}

export async function updatePost(id: string, patch: Partial<Omit<BlogPost, 'id'>>): Promise<void> {
  const db = getDbInstance();
  await updateDoc(doc(db, 'posts', id), patch);
}

export async function deletePost(id: string): Promise<void> {
  const db = getDbInstance();
  await deleteDoc(doc(db, 'posts', id));
}
