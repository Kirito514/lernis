import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Types
export interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  description: string;
  date: string;
  type: 'certificate' | 'diploma' | 'badge';
  image: string;
  verified: boolean;
  hash: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Achievement {
  id?: string;
  name: string;
  description: string;
  type: 'badge' | 'sticker' | 'token';
  image: string;
  date: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Transaction {
  id?: string;
  type: 'mint' | 'transfer' | 'verify' | 'claim';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  time: string;
  hash: string;
  gas: string;
  amount?: string;
  currency?: string;
  from?: string;
  to?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WalletStats {
  maticBalance: number;
  nftCertificates: number;
  achievements: number;
  walletAddress: string;
  userId: string;
  updatedAt: Timestamp;
}

// Simple cache for Firebase queries
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Certificate Service
export const certificateService = {
  // Barcha sertifikatlarni olish (with caching)
  async getCertificates(userId: string): Promise<Certificate[]> {
    const cacheKey = `certificates_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Certificate[];
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting certificates:', error);
      return [];
    }
  },

  // Bitta sertifikat olish
  async getCertificate(id: string): Promise<Certificate | null> {
    try {
      const docRef = doc(db, 'certificates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Certificate;
      }
      return null;
    } catch (error) {
      console.error('Error getting certificate:', error);
      return null;
    }
  },

  // Yangi sertifikat qo'shish
  async addCertificate(certificate: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'certificates'), {
        ...certificate,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding certificate:', error);
      return null;
    }
  },

  // Sertifikat yangilash
  async updateCertificate(id: string, updates: Partial<Certificate>): Promise<boolean> {
    try {
      const docRef = doc(db, 'certificates', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating certificate:', error);
      return false;
    }
  }
};

// Achievement Service
export const achievementService = {
  // Barcha achievement'larni olish (with caching)
  async getAchievements(userId: string): Promise<Achievement[]> {
    const cacheKey = `achievements_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const q = query(
        collection(db, 'achievements'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[];
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  },

  // Yangi achievement qo'shish
  async addAchievement(achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'achievements'), {
        ...achievement,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding achievement:', error);
      return null;
    }
  }
};

// Transaction Service
export const transactionService = {
  // Barcha transaksiyalarni olish (with caching)
  async getTransactions(userId: string): Promise<Transaction[]> {
    const cacheKey = `transactions_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20) // Reduced limit for better performance
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  // Yangi transaksiya qo'shish
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  }
};

// Wallet Service
export const walletService = {
  // Wallet statistikalarini olish (with caching)
  async getWalletStats(userId: string): Promise<WalletStats | null> {
    const cacheKey = `walletStats_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const docRef = doc(db, 'walletStats', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const result = { ...docSnap.data() } as WalletStats;
        setCachedData(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error getting wallet stats:', error);
      return null;
    }
  },

  // Wallet statistikalarini yangilash
  async updateWalletStats(userId: string, stats: Partial<WalletStats>): Promise<boolean> {
    try {
      const docRef = doc(db, 'walletStats', userId);
      await updateDoc(docRef, {
        ...stats,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating wallet stats:', error);
      return false;
    }
  }
};

// Demo ma'lumotlar qo'shish
export const seedDemoData = async (userId: string) => {
  try {
    // Demo sertifikatlar
    const demoCertificates: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Web Development Bootcamp',
        issuer: 'Tech University',
        description: 'Complete web development course covering HTML, CSS, JavaScript, and React',
        date: '2024-01-15',
        type: 'certificate',
        image: '/api/placeholder/200/150',
        verified: true,
        hash: '0x1234...5678',
        userId
      },
      {
        name: 'Data Science Fundamentals',
        issuer: 'Tech University',
        description: 'Introduction to data science, machine learning, and statistical analysis',
        date: '2024-01-10',
        type: 'certificate',
        image: '/api/placeholder/200/150',
        verified: true,
        hash: '0x9876...5432',
        userId
      },
      {
        name: 'Blockchain Development',
        issuer: 'Tech University',
        description: 'Smart contracts, DeFi, and NFT development on Ethereum and Polygon',
        date: '2024-01-05',
        type: 'certificate',
        image: '/api/placeholder/200/150',
        verified: true,
        hash: '0xabcd...efgh',
        userId
      }
    ];

    // Demo achievement'lar
    const demoAchievements: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'First Certificate',
        description: 'Received your first NFT certificate',
        type: 'badge',
        image: '/api/placeholder/100/100',
        date: '2024-01-15',
        rarity: 'common',
        points: 10,
        userId
      },
      {
        name: 'Top Performer',
        description: 'Achieved 95%+ in all courses',
        type: 'badge',
        image: '/api/placeholder/100/100',
        date: '2024-01-10',
        rarity: 'rare',
        points: 50,
        userId
      },
      {
        name: 'Early Adopter',
        description: 'Joined in the first month',
        type: 'badge',
        image: '/api/placeholder/100/100',
        date: '2024-01-01',
        rarity: 'legendary',
        points: 100,
        userId
      }
    ];

    // Demo transaksiyalar
    const demoTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        type: 'mint',
        description: 'Certificate minted: Web Development Bootcamp',
        status: 'completed',
        date: '2024-01-15',
        time: '14:30',
        hash: '0x1234...5678',
        gas: '0.001 MATIC',
        userId
      },
      {
        type: 'transfer',
        description: 'Certificate shared with employer',
        status: 'completed',
        date: '2024-01-14',
        time: '09:15',
        hash: '0x9876...5432',
        gas: '0.002 MATIC',
        userId
      },
      {
        type: 'mint',
        description: 'Achievement badge minted: Top Performer',
        status: 'pending',
        date: '2024-01-13',
        time: '16:45',
        hash: '0xabcd...efgh',
        gas: '0.001 MATIC',
        userId
      }
    ];

    // Demo ma'lumotlarni qo'shish
    for (const cert of demoCertificates) {
      await certificateService.addCertificate(cert);
    }

    for (const achievement of demoAchievements) {
      await achievementService.addAchievement(achievement);
    }

    for (const transaction of demoTransactions) {
      await transactionService.addTransaction(transaction);
    }

    // Wallet statistikalarini yaratish
    const walletStats: WalletStats = {
      maticBalance: 0.05,
      nftCertificates: demoCertificates.length,
      achievements: demoAchievements.length,
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      userId,
      updatedAt: Timestamp.now()
    };

    const docRef = doc(db, 'walletStats', userId);
    await updateDoc(docRef, walletStats);

    console.log('Demo data seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return false;
  }
};
