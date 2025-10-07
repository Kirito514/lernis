import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  setDoc,
  // deleteDoc, 
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

export interface UserAnalytics {
  id?: string;
  userId: string;
  totalCertificates: number;
  totalAchievements: number;
  totalTransactions: number;
  totalEduTokens: number;
  totalMaticSpent: number;
  lastLoginDate: string;
  totalLoginDays: number;
  averageSessionTime: number;
  coursesCompleted: number;
  certificatesVerified: number;
  nftsOwned: number;
  marketplacePurchases: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DashboardStats {
  id?: string;
  userId: string;
  totalCertificates: number;
  verifiedCertificates: number;
  pendingCertificates: number;
  totalAchievements: number;
  totalTransactions: number;
  eduTokenBalance: number;
  maticBalance: number;
  nftsOwned: number;
  marketplacePurchases: number;
  coursesCompleted: number;
  lastActivity: string;
  weeklyActivity: number;
  monthlyActivity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  course: string;
  progress: number;
  status: 'active' | 'completed' | 'inactive';
  joinDate: string;
  lastActive: string;
  certificates: number;
  achievements: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Teacher {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  courses: string[];
  students: number;
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  certificatesIssued: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AnalyticsData {
  id?: string;
  totalStudents: number;
  totalTeachers: number;
  totalCertificates: number;
  activeCourses: number;
  completionRate: number;
  monthlyGrowth: number;
  weeklyActivity: number;
  topCourses: { name: string; students: number; completion: number }[];
  recentActivity: { action: string; course: string; time: string; type: string }[];
  monthlyData: { month: string; students: number; certificates: number }[];
  departmentStats: { department: string; students: number; teachers: number }[];
  enrollmentTrends: { date: string; enrollments: number }[];
  certificateTrends: { date: string; issued: number }[];
  createdAt: Timestamp;
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
      // Return empty array instead of throwing error
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

// Token Balance Service
export const tokenBalanceService = {
  // Token balansini olish
  async getTokenBalance(userId: string): Promise<any> {
    try {
      const docRef = doc(db, 'tokenBalances', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Default balance yaratish
        const defaultBalance = {
          userId,
          balance: '100.00',
          usdValue: '5.00',
          symbol: 'EDU',
          name: 'EduCoin Platform Token',
          icon: '🎓',
          decimals: 2,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await setDoc(docRef, defaultBalance);
        return defaultBalance;
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  },

  // Token balansini yangilash
  async updateTokenBalance(userId: string, balance: string, usdValue: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'tokenBalances', userId);
      await setDoc(docRef, {
        balance,
        usdValue,
        updatedAt: Timestamp.now()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating token balance:', error);
      return false;
    }
  }
};

// NFT Ownership Service
export const nftOwnershipService = {
  // User'ning owned NFT'larini olish
  async getUserNFTs(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'nftOwnership'),
        where('ownerId', '==', userId),
        orderBy('acquiredAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  },

  // NFT ownership qo'shish
  async addNFTOwnership(nftData: any): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'nftOwnership'), {
        ...nftData,
        acquiredAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding NFT ownership:', error);
      return null;
    }
  },

  // NFT ownership o'chirish
  async removeNFTOwnership(userId: string, nftId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'nftOwnership'),
        where('ownerId', '==', userId),
        where('nftId', '==', nftId)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error('Error removing NFT ownership:', error);
      return false;
    }
  }
};

// NFT Transaction Service
export const nftTransactionService = {
  // NFT transaction'larini olish
  async getNFTTransactions(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'nftTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting NFT transactions:', error);
      return [];
    }
  },

  // NFT transaction qo'shish
  async addNFTTransaction(transactionData: any): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'nftTransactions'), {
        ...transactionData,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding NFT transaction:', error);
      return null;
    }
  }
};

// User Service
export const userService = {
  // Barcha user'larni olish
  async getAllUsers(): Promise<any[]> {
    try {
      // Firebase'dan real user'larni olish
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const realUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (realUsers.length > 0) {
          return realUsers;
        }
      } catch (firebaseError) {
        console.log('Firebase users not available, using demo users');
      }
      
      // Fallback to demo users if Firebase fails
      const demoUsers = [
        {
          id: 'user1',
          username: 'john_doe',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: '2024-01-15T10:00:00Z',
          role: 'student'
        },
        {
          id: 'user2',
          username: 'jane_smith',
          email: 'jane.smith@example.com',
          displayName: 'Jane Smith',
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: '2024-02-20T14:30:00Z',
          role: 'teacher'
        },
        {
          id: 'user3',
          username: 'crypto_master',
          email: 'crypto@blockchain.com',
          displayName: 'Crypto Master',
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: '2024-03-10T09:15:00Z',
          role: 'student'
        },
        {
          id: 'user4',
          username: 'blockchain_dev',
          email: 'dev@lernis.com',
          displayName: 'Blockchain Developer',
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: '2024-01-25T16:45:00Z',
          role: 'teacher'
        },
        {
          id: 'user5',
          username: 'nft_collector',
          email: 'collector@nft.com',
          displayName: 'NFT Collector',
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: '2024-02-05T11:20:00Z',
          role: 'student'
        }
      ];
      
      return demoUsers;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // User'ni ID bo'yicha qidirish
  async getUserById(userId: string): Promise<any | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  // User'larni qidirish
  async searchUsers(query: string, limit: number = 10): Promise<any[]> {
    try {
      const users = await this.getAllUsers();
      const searchQuery = query.toLowerCase();
      
      const filteredUsers = users.filter(user => {
        return (
          user.id.toLowerCase().includes(searchQuery) ||
          user.username.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery) ||
          user.displayName.toLowerCase().includes(searchQuery)
        );
      });

      return filteredUsers.slice(0, limit);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
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
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...stats,
          updatedAt: Timestamp.now()
        });
      } else {
        // Document doesn't exist, create it
        await setDoc(docRef, {
          ...stats,
          userId,
          updatedAt: Timestamp.now()
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating wallet stats:', error);
      return false;
    }
  }
};

// User Analytics Service
export const userAnalyticsService = {
  // User analytics olish
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const cacheKey = `userAnalytics_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const docRef = doc(db, 'userAnalytics', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const result = { id: docSnap.id, ...docSnap.data() } as UserAnalytics;
        setCachedData(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  },

  // User analytics yangilash
  async updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<boolean> {
    try {
      const docRef = doc(db, 'userAnalytics', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating user analytics:', error);
      return false;
    }
  },

  // Yangi user analytics yaratish
  async createUserAnalytics(analytics: Omit<UserAnalytics, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'userAnalytics'), {
        ...analytics,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user analytics:', error);
      return null;
    }
  }
};

// Dashboard Stats Service
export const dashboardStatsService = {
  // Dashboard statistikalarini olish
  async getDashboardStats(userId: string): Promise<DashboardStats | null> {
    const cacheKey = `dashboardStats_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const docRef = doc(db, 'dashboardStats', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const result = { id: docSnap.id, ...docSnap.data() } as DashboardStats;
        setCachedData(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return null;
    }
  },

  // Dashboard statistikalarini yangilash
  async updateDashboardStats(userId: string, updates: Partial<DashboardStats>): Promise<boolean> {
    try {
      const docRef = doc(db, 'dashboardStats', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      return false;
    }
  },

  // Yangi dashboard stats yaratish
  async createDashboardStats(stats: Omit<DashboardStats, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'dashboardStats'), {
        ...stats,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating dashboard stats:', error);
      return null;
    }
  },

  // Real-time dashboard stats hisoblash
  async calculateRealTimeStats(userId: string): Promise<DashboardStats> {
    try {
      // Barcha ma'lumotlarni parallel olish
      const [certificates, achievements, transactions, walletStats, eduBalance] = await Promise.all([
        certificateService.getCertificates(userId),
        achievementService.getAchievements(userId),
        transactionService.getTransactions(userId),
        walletService.getWalletStats(userId),
        // EDU token balance localStorage'dan olish
        Promise.resolve(JSON.parse(localStorage.getItem(`edu_token_balance_${userId}`) || '{"balance": "100.00", "usdValue": "5.00"}'))
      ]);

      // NFT transaksiyalarini localStorage'dan olish
      const nftTransactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');

      // Statistikalar hisoblash
      const totalCertificates = certificates.length;
      const verifiedCertificates = certificates.filter(c => c.verified).length;
      const pendingCertificates = totalCertificates - verifiedCertificates;
      const totalAchievements = achievements.length;
      const totalTransactions = transactions.length;
      const nftsOwned = nftTransactions.filter((tx: any) => tx.status === 'completed').length;
      const marketplacePurchases = nftTransactions.length;

      // Haftalik va oylik faoliyat hisoblash
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyActivity = transactions.filter(tx => 
        new Date(tx.date) >= weekAgo
      ).length;

      const monthlyActivity = transactions.filter(tx => 
        new Date(tx.date) >= monthAgo
      ).length;

      const dashboardStats: DashboardStats = {
        userId,
        totalCertificates,
        verifiedCertificates,
        pendingCertificates,
        totalAchievements,
        totalTransactions,
        eduTokenBalance: parseFloat(eduBalance.balance),
        maticBalance: walletStats?.maticBalance || 0,
        nftsOwned,
        marketplacePurchases,
        coursesCompleted: verifiedCertificates, // Verified certificates as completed courses
        lastActivity: now.toISOString(),
        weeklyActivity,
        monthlyActivity,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Firebase'ga saqlash
      await this.updateDashboardStats(userId, dashboardStats);

      return dashboardStats;
    } catch (error) {
      console.error('Error calculating real-time stats:', error);
      throw error;
    }
  }
};

// Student Service
export const studentService = {
  // Barcha studentlarni olish
  async getStudents(): Promise<Student[]> {
    const cacheKey = 'students_all';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const q = query(
        collection(db, 'students'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting students:', error);
      return [];
    }
  },

  // Yangi student qo'shish
  async addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding student:', error);
      return null;
    }
  },

  // Student yangilash
  async updateStudent(id: string, updates: Partial<Student>): Promise<boolean> {
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  }
};

// Teacher Service
export const teacherService = {
  // Barcha teacherlarni olish
  async getTeachers(): Promise<Teacher[]> {
    const cacheKey = 'teachers_all';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const q = query(
        collection(db, 'teachers'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Teacher[];
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting teachers:', error);
      return [];
    }
  },

  // Yangi teacher qo'shish
  async addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'teachers'), {
        ...teacher,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding teacher:', error);
      return null;
    }
  },

  // Teacher yangilash
  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<boolean> {
    try {
      const docRef = doc(db, 'teachers', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return false;
    }
  }
};

// Analytics Service
export const analyticsService = {
  // Analytics ma'lumotlarini olish
  async getAnalytics(): Promise<AnalyticsData | null> {
    const cacheKey = 'analytics_data';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
      const docRef = doc(db, 'analytics', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const result = { id: docSnap.id, ...docSnap.data() } as AnalyticsData;
        setCachedData(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  },

  // Real-time analytics hisoblash
  async calculateRealTimeAnalytics(): Promise<AnalyticsData> {
    try {
      // Barcha ma'lumotlarni parallel olish
      const [students, teachers, certificates, , transactions] = await Promise.all([
        studentService.getStudents(),
        teacherService.getTeachers(),
        getDocs(collection(db, 'certificates')),
        getDocs(collection(db, 'achievements')),
        getDocs(collection(db, 'transactions'))
      ]);

      const totalStudents = students.length;
      const totalTeachers = teachers.length;
      const totalCertificates = certificates.size;
      const activeCourses = new Set(certificates.docs.map(doc => doc.data().name)).size;
      
      // Completion rate hisoblash
      const completedStudents = students.filter(s => s.status === 'completed').length;
      const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

      // Haftalik faoliyat
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyActivity = transactions.docs.filter(doc => 
        new Date(doc.data().date) >= weekAgo
      ).length;

      // Oylik o'sish
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const monthlyGrowth = students.filter(s => 
        new Date(s.joinDate) >= monthAgo
      ).length;

      // Top courses
      const courseStats = new Map<string, { students: number; completions: number }>();
      students.forEach(student => {
        const current = courseStats.get(student.course) || { students: 0, completions: 0 };
        current.students++;
        if (student.status === 'completed') current.completions++;
        courseStats.set(student.course, current);
      });

      const topCourses = Array.from(courseStats.entries())
        .map(([name, stats]) => ({
          name,
          students: stats.students,
          completion: stats.students > 0 ? Math.round((stats.completions / stats.students) * 100) : 0
        }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);

      // Monthly data for charts
      const monthlyData = [
        { month: 'Jan', students: Math.max(120, totalStudents - 50), certificates: Math.max(95, totalCertificates - 30) },
        { month: 'Feb', students: Math.max(150, totalStudents - 30), certificates: Math.max(120, totalCertificates - 20) },
        { month: 'Mar', students: Math.max(180, totalStudents - 20), certificates: Math.max(140, totalCertificates - 15) },
        { month: 'Apr', students: Math.max(200, totalStudents - 10), certificates: Math.max(160, totalCertificates - 10) },
        { month: 'May', students: Math.max(220, totalStudents - 5), certificates: Math.max(180, totalCertificates - 5) },
        { month: 'Jun', students: totalStudents, certificates: totalCertificates }
      ];

      // Department statistics
      const departmentStats = new Map<string, { students: number; teachers: number }>();
      students.forEach(student => {
        const dept = student.course.includes('Web') ? 'Computer Science' : 
                    student.course.includes('Data') ? 'Data Science' :
                    student.course.includes('Blockchain') ? 'Blockchain' : 'Other';
        const current = departmentStats.get(dept) || { students: 0, teachers: 0 };
        current.students++;
        departmentStats.set(dept, current);
      });

      teachers.forEach(teacher => {
        const current = departmentStats.get(teacher.department) || { students: 0, teachers: 0 };
        current.teachers++;
        departmentStats.set(teacher.department, current);
      });

      const departmentStatsArray = Array.from(departmentStats.entries())
        .map(([department, stats]) => ({ department, ...stats }));

      // Enrollment trends (last 30 days)
      const enrollmentTrends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const enrollments = students.filter(s => 
          new Date(s.joinDate).toDateString() === date.toDateString()
        ).length;
        enrollmentTrends.push({
          date: date.toISOString().split('T')[0],
          enrollments
        });
      }

      // Certificate trends (last 30 days)
      const certificateTrends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const issued = certificates.docs.filter(doc => 
          new Date(doc.data().date).toDateString() === date.toDateString()
        ).length;
        certificateTrends.push({
          date: date.toISOString().split('T')[0],
          issued
        });
      }

      // Recent activity
      const recentActivity = [
        { action: 'New student enrolled', course: 'Web Development', time: '2 hours ago', type: 'enrollment' },
        { action: 'Certificate issued', course: 'Data Science', time: '4 hours ago', type: 'certificate' },
        { action: 'Course completed', course: 'Blockchain', time: '6 hours ago', type: 'completion' },
        { action: 'New teacher added', course: 'Mobile Development', time: '1 day ago', type: 'teacher' },
        { action: 'Course updated', course: 'AI/ML', time: '2 days ago', type: 'update' }
      ];

      const analyticsData: AnalyticsData = {
        totalStudents,
        totalTeachers,
        totalCertificates,
        activeCourses,
        completionRate,
        monthlyGrowth,
        weeklyActivity,
        topCourses,
        recentActivity,
        monthlyData,
        departmentStats: departmentStatsArray,
        enrollmentTrends,
        certificateTrends,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Firebase'ga saqlash
      await this.updateAnalytics(analyticsData);

      return analyticsData;
    } catch (error) {
      console.error('Error calculating real-time analytics:', error);
      throw error;
    }
  },

  // Analytics yangilash
  async updateAnalytics(analytics: AnalyticsData): Promise<boolean> {
    try {
      const docRef = doc(db, 'analytics', 'main');
      await updateDoc(docRef, {
        ...analytics,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating analytics:', error);
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
    await setDoc(docRef, walletStats as any);

    // User analytics yaratish
    const userAnalytics: Omit<UserAnalytics, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      totalCertificates: demoCertificates.length,
      totalAchievements: demoAchievements.length,
      totalTransactions: demoTransactions.length,
      totalEduTokens: 100.00,
      totalMaticSpent: 0.004,
      lastLoginDate: new Date().toISOString(),
      totalLoginDays: 1,
      averageSessionTime: 30,
      coursesCompleted: demoCertificates.length,
      certificatesVerified: demoCertificates.filter(c => c.verified).length,
      nftsOwned: 0,
      marketplacePurchases: 0
    };

    await userAnalyticsService.createUserAnalytics(userAnalytics);

    // Dashboard stats yaratish
    const dashboardStats: Omit<DashboardStats, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      totalCertificates: demoCertificates.length,
      verifiedCertificates: demoCertificates.filter(c => c.verified).length,
      pendingCertificates: demoCertificates.filter(c => !c.verified).length,
      totalAchievements: demoAchievements.length,
      totalTransactions: demoTransactions.length,
      eduTokenBalance: 100.00,
      maticBalance: 0.05,
      nftsOwned: 0,
      marketplacePurchases: 0,
      coursesCompleted: demoCertificates.filter(c => c.verified).length,
      lastActivity: new Date().toISOString(),
      weeklyActivity: demoTransactions.length,
      monthlyActivity: demoTransactions.length
    };

    await dashboardStatsService.createDashboardStats(dashboardStats);

    // Demo students yaratish
    const demoStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        userId: 'demo_student_1',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1 (555) 123-4567',
        course: 'Web Development',
        progress: 85,
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2024-01-20',
        certificates: 2,
        achievements: 3
      },
      {
        userId: 'demo_student_2',
        name: 'Bob Smith',
        email: 'bob.smith@email.com',
        phone: '+1 (555) 234-5678',
        course: 'Data Science',
        progress: 60,
        status: 'active',
        joinDate: '2024-01-10',
        lastActive: '2024-01-19',
        certificates: 1,
        achievements: 2
      },
      {
        userId: 'demo_student_3',
        name: 'Carol Davis',
        email: 'carol.davis@email.com',
        phone: '+1 (555) 345-6789',
        course: 'Blockchain Development',
        progress: 100,
        status: 'completed',
        joinDate: '2023-12-01',
        lastActive: '2024-01-18',
        certificates: 3,
        achievements: 5
      },
      {
        userId: 'demo_student_4',
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+1 (555) 456-7890',
        course: 'Web Development',
        progress: 30,
        status: 'inactive',
        joinDate: '2024-01-05',
        lastActive: '2024-01-12',
        certificates: 0,
        achievements: 1
      }
    ];

    // Demo teachers yaratish
    const demoTeachers: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        userId: 'demo_teacher_1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '+1 (555) 123-4567',
        department: 'Computer Science',
        courses: ['Web Development', 'Data Structures'],
        students: 45,
        rating: 4.9,
        status: 'active',
        joinDate: '2023-01-15',
        lastActive: '2024-01-20',
        certificatesIssued: 120
      },
      {
        userId: 'demo_teacher_2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        phone: '+1 (555) 234-5678',
        department: 'Data Science',
        courses: ['Machine Learning', 'Statistics'],
        students: 38,
        rating: 4.8,
        status: 'active',
        joinDate: '2023-03-10',
        lastActive: '2024-01-19',
        certificatesIssued: 95
      },
      {
        userId: 'demo_teacher_3',
        name: 'Dr. Emily Davis',
        email: 'emily.davis@university.edu',
        phone: '+1 (555) 345-6789',
        department: 'Blockchain',
        courses: ['Blockchain Development', 'Cryptocurrency'],
        students: 32,
        rating: 4.7,
        status: 'inactive',
        joinDate: '2023-02-01',
        lastActive: '2024-01-15',
        certificatesIssued: 78
      }
    ];

    // Demo ma'lumotlarni qo'shish
    for (const student of demoStudents) {
      await studentService.addStudent(student);
    }

    for (const teacher of demoTeachers) {
      await teacherService.addTeacher(teacher);
    }

    // Analytics ma'lumotlarini yaratish
    await analyticsService.calculateRealTimeAnalytics();

    console.log('Demo data seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return false;
  }
};
