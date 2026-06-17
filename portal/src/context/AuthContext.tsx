'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/firestore';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authInstance: import('firebase/auth').Auth;
    try { authInstance = getAuthInstance(); } catch { setLoading(false); return; }
    const unsub = onAuthStateChanged(authInstance, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Load Firestore profile
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
        // Sync session cookie with server
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch {
          // Non-critical: session cookie is for SSR middleware only
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function logout() {
    await signOut(getAuthInstance());
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
