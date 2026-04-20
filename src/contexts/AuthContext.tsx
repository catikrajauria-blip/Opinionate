import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Force re-login once a week check
        const lastLoginStr = localStorage.getItem('last_login_verified');
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (lastLoginStr) {
          const lastLogin = parseInt(lastLoginStr, 10);
          if (now - lastLogin > oneWeek) {
            localStorage.removeItem('last_login_verified');
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
        } else {
          localStorage.setItem('last_login_verified', now.toString());
        }

        // Sync user profile with Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'catikrajauria@gmail.com' ? 'admin' : 'user',
            isBlocked: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          setProfile(newProfile);
        } else {
          const profileData = userSnap.data() as any;
          
          // Force re-login logic if needed (user requested "once a week")
          // Firebase Auth persists indefinitely by default. 
          // We can check local storage for a "last_prompted_login" or similar
          // but usually users just want an "Active" session.
          // For now we just update lastLogin.
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          
          setProfile({
            ...profileData,
            createdAt: profileData.createdAt?.toDate?.()?.toISOString() || profileData.createdAt,
            lastLogin: profileData.lastLogin?.toDate?.()?.toISOString() || profileData.lastLogin
          } as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
