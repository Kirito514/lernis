import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MarketplaceBanner from '../components/MarketplaceBanner';
import { useAuth } from '../contexts/AuthContext';
import { lernisTokenService, type LernisTokenBalance } from '../services/lernisTokenService';
import { 
  certificateService, 
  achievementService, 
  transactionService, 
  walletService,
  seedDemoData,
  type Certificate,
  type Achievement,
  type Transaction,
  type WalletStats
} from '../services/firebaseService';
import {
  Bell,
  Search,
  Plus,
  TrendingUp,
  Users,
  FileText,
  Award,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [eduTokenBalance, setEduTokenBalance] = useState<LernisTokenBalance | null>(null);
  
  const { currentUser, userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Firebase'dan ma'lumotlarni yuklash (optimized)
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Check if demo data already exists to avoid seeding every time
        const existingCerts = await certificateService.getCertificates(currentUser.uid);
        
        // Only seed demo data if no certificates exist
        if (existingCerts.length === 0) {
          // Seed demo data in background (non-blocking)
          seedDemoData(currentUser.uid).catch(console.error);
        }
        
        // Load data in parallel with optimized queries
        const [certs, achievs, trans, stats, eduBalance] = await Promise.all([
          certificateService.getCertificates(currentUser.uid),
          achievementService.getAchievements(currentUser.uid),
          transactionService.getTransactions(currentUser.uid),
          walletService.getWalletStats(currentUser.uid),
          lernisTokenService.getLernisTokenBalance(currentUser.uid)
        ]);
        
        setCertificates(certs);
        setAchievements(achievs);
        setTransactions(trans);
        setWalletStats(stats);
        setEduTokenBalance(eduBalance);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // EDU Token balance refresh
  useEffect(() => {
    if (!currentUser) return;
    
    const refreshEduBalance = async () => {
      try {
        const eduBalance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
        setEduTokenBalance(eduBalance);
        console.log('Dashboard EDU balance refreshed:', eduBalance);
      } catch (error) {
        console.error('Error refreshing EDU balance:', error);
      }
    };

    // Har 15 soniyada yangilash
    const interval = setInterval(refreshEduBalance, 15000);
    
    // Dastlabki yuklash
    refreshEduBalance();

    return () => clearInterval(interval);
  }, [currentUser]);

  const stats = [
    {
      name: 'Certificates',
      value: certificates.length.toString(),
      change: `${certificates.filter(c => c.verified).length} verified`,
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      name: 'EDU Token Balance',
      value: eduTokenBalance ? `${eduTokenBalance.balance} EDU` : '100.00 EDU',
      change: `$${eduTokenBalance?.usdValue || '5.00'} USD`,
      changeType: 'positive',
      icon: Award,
      color: 'bg-green-500'
    },
    {
      name: 'Wallet Balance',
      value: walletStats ? `${walletStats.maticBalance} MATIC` : '0 MATIC',
      change: 'Polygon Network',
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'bg-purple-500'
    }
  ];

  // Firebase'dan olingan sertifikatlar
  const recentCertificates = certificates.slice(0, 4).map(cert => ({
    id: cert.id || '',
    studentName: userData?.displayName || 'You',
    course: cert.name,
    status: cert.verified ? 'verified' : 'pending',
    date: cert.date,
    grade: 'A+'
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mr-3" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
               <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                 <span>Welcome back, {userData?.displayName || currentUser?.displayName || 'User'}!</span>
                 <span>•</span>
                 <span>Role: {userData?.role || 'student'}</span>
                 <span>•</span>
                 <span>{currentUser?.email}</span>
               </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates, students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Create Button */}
              <Link
                to="/dashboard/certificates/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EDU Token Balance Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">EDU Token Balance</h3>
                  <p className="text-sm text-gray-600 mb-2">Platform Native Token</p>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{eduTokenBalance?.balance || '100.00'} EDU</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">USD Value</p>
                      <p className="text-2xl font-bold text-green-600">${eduTokenBalance?.usdValue || '5.00'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Link
                  to="/dashboard/buy-tokens"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Award className="h-4 w-4" />
                  <span>Buy More</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Marketplace Banner */}
          <MarketplaceBanner variant="dashboard" className="mb-8" />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/dashboard/certificates/create"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Certificate</p>
                  <p className="text-sm text-gray-600">Issue new NFT certificate</p>
                </div>
              </Link>
              
              <Link
                to="/dashboard/wallet"
                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Wallet</p>
                  <p className="text-sm text-gray-600">Check balance & transactions</p>
                </div>
              </Link>
              
              <Link
                to="/dashboard/my-certificates"
                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">My Certificates</p>
                  <p className="text-sm text-gray-600">View all certificates</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Certificates Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Certificates</h3>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCertificates.length > 0 ? (
                    recentCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cert.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                            {getStatusIcon(cert.status)}
                            {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cert.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                          <p className="text-gray-500 mb-4">You haven't received any certificates yet.</p>
                          <Link
                            to="/dashboard/courses"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <Plus className="h-4 w-4" />
                            Browse Courses
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {certificates.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{recentCertificates.length}</span> of{' '}
                    <span className="font-medium">{certificates.length}</span> results
                  </p>
                  {certificates.length > 4 && (
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                        Previous
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200">
                        1
                      </button>
                      {certificates.length > 8 && (
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                          2
                        </button>
                      )}
                      {certificates.length > 12 && (
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                          3
                        </button>
                      )}
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

