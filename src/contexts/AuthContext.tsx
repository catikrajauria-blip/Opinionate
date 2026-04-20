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
      setLoading(true);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Force re-login once a week check
          const lastLoginStr = localStorage.getItem('last_login_verified');
          const now = Date.now();
          const oneWeek = 7 * 24 * 60 * 60 * 1000;

          if (lastLoginStr) {
            const lastLogin = parseInt(lastLoginStr, 10);
            if (now - lastLogin > oneWeek) {
              console.log('Session expired, signing out for fresh auth');
              localStorage.removeItem('last_login_verified');
              await firebaseSignOut(auth);
              setUser(null);
              setProfile(null);
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
            console.log('Creating new user profile...');
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
            let profileData = userSnap.data() as any;
            
            // Check if this is the hardcoded admin and update role if necessary
            if (firebaseUser.email?.toLowerCase() === 'catikrajauria@gmail.com' && profileData.role !== 'admin') {
              console.log('Upgrading profile to admin role...');
              await setDoc(userRef, { role: 'admin' }, { merge: true });
              profileData.role = 'admin';
            }

            // Always update lastLogin
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            
            setProfile({
              ...profileData,
              createdAt: profileData.createdAt?.toDate?.()?.toISOString() || profileData.createdAt,
              lastLogin: profileData.lastLogin?.toDate?.()?.toISOString() || profileData.lastLogin
            } as UserProfile);
          }
        } catch (error) {
          console.error('Auth context sync error:', error);
          // Don't crash the app if Firestore profile fails, just set profile to null
          // This allows users to still see the public site even if profile creation hits a rule error
          setProfile(null);
        }
      } else {
        setProfile(null);
        localStorage.removeItem('last_login_verified');
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
