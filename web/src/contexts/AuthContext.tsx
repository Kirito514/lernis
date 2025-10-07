import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { walletService, type WalletData } from '../services/walletService';

// Numeric User ID generator with uniqueness check
const generateNumericUserId = async (): Promise<string> => {
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../firebase/config');
  
  let userId: string = '';
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random 8-digit number
    const min = 10000000;
    const max = 99999999;
    userId = Math.floor(Math.random() * (max - min + 1)) + min + '';
    
    // Check if this userId already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }
  
  return userId;
};

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'organization' | 'admin';
  organization?: string;
  createdAt: string;
  walletAddress?: string;
  userId?: string;
  nickname?: string;
  bio?: string;
  updatedAt?: string;
  wallet?: WalletData;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, displayName: string, role: string, organization?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getAllUsers: () => Promise<UserData[]>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Foydalanuvchi ma'lumotlarini Firestore'dan olish (optimized)
  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        return data;
      } else {
        // Agar foydalanuvchi ma'lumoti yo'q bo'lsa, default ma'lumotlar yaratish
        const userId = await generateNumericUserId();
        
        // Avtomatik wallet yaratish (async, non-blocking)
        const walletPromise = walletService.createWallet(userId);
        
        const defaultUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: 'student',
          createdAt: new Date().toISOString(),
          userId: userId,
          nickname: user.displayName?.split(' ')[0] || 'User',
          bio: 'Passionate learner and blockchain enthusiast.',
          walletAddress: '', // Will be updated when wallet is ready
          wallet: undefined
        };
        
        // Set user data immediately, update wallet later
        await setDoc(doc(db, 'users', user.uid), defaultUserData);
        setUserData(defaultUserData);
        
        // Update wallet data asynchronously
        walletPromise.then(async (wallet) => {
          const updatedData = { ...defaultUserData, walletAddress: wallet.address, wallet };
          await setDoc(doc(db, 'users', user.uid), updatedData);
          setUserData(updatedData);
        });
        
        return defaultUserData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Ro'yxatdan o'tish
  const signup = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: string, 
    organization?: string
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Foydalanuvchi profilini yangilash
      await updateProfile(user, { displayName });
      
      // Firestore'da foydalanuvchi ma'lumotlarini saqlash
      const userId = await generateNumericUserId();
      
      // Avtomatik wallet yaratish
      const wallet = await walletService.createWallet(userId);
      
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        displayName,
        role: role as 'student' | 'teacher' | 'organization' | 'admin',
        organization,
        createdAt: new Date().toISOString(),
        userId: userId,
        nickname: displayName.split(' ')[0],
        bio: 'Passionate learner and blockchain enthusiast.',
        walletAddress: wallet.address,
        wallet: wallet
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Kirish
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  // Google orqali kirish
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Agar foydalanuvchi yangi bo'lsa, ma'lumotlarini saqlash
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userId = await generateNumericUserId();
        
        // Avtomatik wallet yaratish
        const wallet = await walletService.createWallet(userId);
        
        const userData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: 'student',
          createdAt: new Date().toISOString(),
          userId: userId,
          nickname: user.displayName?.split(' ')[0] || 'User',
          bio: 'Passionate learner and blockchain enthusiast.',
          walletAddress: wallet.address,
          wallet: wallet
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  };

  // Chiqish
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Barcha user'larni olish
  const getAllUsers = async (): Promise<UserData[]> => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  // Auth holatini kuzatish (optimized)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Non-blocking user data fetch
        fetchUserData(user).catch(console.error);
        
        // Avtomatik Firebase sync
        try {
          const { autoFirebaseService } = await import('../services/autoFirebaseService');
          await autoFirebaseService.autoSyncOnLogin(user.uid);
          console.log('Auto-sync completed for user:', user.uid);
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
