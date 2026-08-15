import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export type NavTab = 'pos' | 'kitchen' | 'menu' | 'history' | 'reports';

// Authorized Admin Master Credentials
export const ADMIN_EMAIL = 'Friskadmi@friskapos.com';
export const ADMIN_PASSWORD = 'Frisk@1234';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (targetUid: string, newRole: UserRole) => Promise<void>;
  hasPermission: (tab: NavTab) => boolean;
  canManageMenu: boolean;
  canCloseShift: boolean;
  canCancelSales: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, NavTab[]> = {
  CEO: ['pos', 'kitchen', 'menu', 'history', 'reports'],
  Supervisor: ['pos', 'kitchen', 'menu', 'history', 'reports'],
  Cajero: ['pos', 'kitchen', 'history'],
  Cocinero: ['kitchen'],
};

const SESSION_STORAGE_KEY = 'friska_admin_auth_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session from localStorage and Firebase Auth
  useEffect(() => {
    // 1. Check local admin session
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.profile && parsed?.profile?.role) {
          setUser(parsed.user as User);
          setUserProfile(parsed.profile as UserProfile);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
    }

    // 2. Check Firebase Auth State as fallback
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || data.email || ADMIN_EMAIL,
                displayName: firebaseUser.displayName || data.displayName || 'Administrador CEO',
                photoURL: firebaseUser.photoURL || data.photoURL || '',
                role: 'CEO', // Exclusively CEO for authorized admin
                createdAt: data.createdAt || Date.now(),
                lastLogin: Date.now(),
                status: 'active',
              });
            } else {
              const adminProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || ADMIN_EMAIL,
                displayName: firebaseUser.displayName || 'Administrador CEO',
                photoURL: '',
                role: 'CEO',
                createdAt: Date.now(),
                lastLogin: Date.now(),
                status: 'active',
              };
              setDoc(userDocRef, adminProfile).catch(() => {});
              setUserProfile(adminProfile);
            }
            setUser(firebaseUser);
            setLoading(false);
          }, () => {
            // In case of Firestore offline or rules restriction
            const adminProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || ADMIN_EMAIL,
              displayName: firebaseUser.displayName || 'Administrador CEO',
              photoURL: '',
              role: 'CEO',
              createdAt: Date.now(),
              lastLogin: Date.now(),
              status: 'active',
            };
            setUser(firebaseUser);
            setUserProfile(adminProfile);
            setLoading(false);
          });

          return () => unsubscribeSnapshot();
        } catch (err) {
          console.warn('Auth snapshot init error:', err);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<void> => {
    setLoading(true);

    const cleanEmail = email.trim();
    const isEmailValid = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isPasswordValid = pass === ADMIN_PASSWORD;

    // Strict administrative validation
    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      throw new Error('Credenciales inválidas. Acceso restringido al personal autorizado.');
    }

    // Set Active CEO Administrator Profile
    const adminUser = {
      uid: 'friska_admin_ceo_master',
      email: ADMIN_EMAIL,
      displayName: 'Administrador CEO',
      emailVerified: true,
      isAnonymous: false,
    } as unknown as User;

    const adminProfile: UserProfile = {
      uid: 'friska_admin_ceo_master',
      email: ADMIN_EMAIL,
      displayName: 'Administrador CEO',
      photoURL: '',
      role: 'CEO',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      status: 'active',
    };

    // Store in localStorage to guarantee persistent active session
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        user: {
          uid: adminUser.uid,
          email: adminUser.email,
          displayName: adminUser.displayName,
        },
        profile: adminProfile,
      }));
    } catch (e) {
      console.warn('Could not store session in localStorage:', e);
    }

    // Sync to Firestore if accessible
    try {
      const userDocRef = doc(db, 'users', adminProfile.uid);
      await setDoc(userDocRef, adminProfile, { merge: true });
    } catch (err) {
      console.warn('Could not sync admin profile to Firestore (using local session):', err);
    }

    setUser(adminUser);
    setUserProfile(adminProfile);
    setLoading(false);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      await signOut(auth).catch(() => {});
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setUser(null);
      setUserProfile(null);
    }
  };

  const updateUserRole = async (targetUid: string, newRole: UserRole) => {
    const userDocRef = doc(db, 'users', targetUid);
    try {
      await updateDoc(userDocRef, {
        role: newRole,
        lastUpdated: Date.now()
      });
      if (userProfile && userProfile.uid === targetUid) {
        setUserProfile(prev => prev ? { ...prev, role: newRole } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  const currentRole: UserRole = userProfile?.role || 'CEO';

  const hasPermission = (tab: NavTab): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[currentRole] || [];
    return allowed.includes(tab);
  };

  const canManageMenu = true;
  const canCloseShift = true;
  const canCancelSales = true;
  const canManageUsers = true;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: currentRole,
        loading,
        signInWithEmail,
        logout,
        updateUserRole,
        hasPermission,
        canManageMenu,
        canCloseShift,
        canCancelSales,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
