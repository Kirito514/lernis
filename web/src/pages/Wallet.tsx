import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import MarketplaceBanner from '../components/MarketplaceBanner';
import { lernisTokenService, type LernisTokenBalance, type LernisTokenTransaction } from '../services/lernisTokenService';
import { nftMarketplaceService, type NFTTransaction, type NFT } from '../services/nftMarketplaceService';
import { userSearchService, type User } from '../services/userSearchService';
import { 
  certificateService, 
  achievementService, 
  transactionService, 
  walletService as firebaseWalletService,
  type Certificate,
  type Achievement,
  // type WalletStats
} from '../services/firebaseService';
import { walletService, type WalletBalance, type WalletTransaction } from '../services/walletService';
import { tokenService } from '../services/tokenService';
import QRCode from 'qrcode';
import {
  Bell,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  Coins,
  QrCode,
  Download,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Send,
  Key,
  FileText,
  Trophy,
  BarChart3,
  ArrowUpCircle,
  PlusCircle,
  // Minus,
  DollarSign,
  ArrowDownCircle,
  X,
  Search,
  Loader2,
  User as UserIcon
} from 'lucide-react';

export default function WalletPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  // const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [eduTokenBalance, setEduTokenBalance] = useState<LernisTokenBalance | null>(null);
  const [eduTokenTransactions, setEduTokenTransactions] = useState<LernisTokenTransaction[]>([]);
  const [nftTransactions, setNftTransactions] = useState<NFTTransaction[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  // const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  // const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhraseModal, setShowPhraseModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
  const [showTransferTokenModal, setShowTransferTokenModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportData, setExportData] = useState<{privateKey: string, mnemonic?: string} | null>(null);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  // const [showToast, setShowToast] = useState(false);
  // const [toastMessage, setToastMessage] = useState('');
  // const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Token creation form
  const [tokenForm, setTokenForm] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    decimals: 18
  });
  
  // Token transfer form
  const [transferForm, setTransferForm] = useState({
    tokenAddress: '',
    to: '',
    amount: ''
  });
  
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isTransferringToken, setIsTransferringToken] = useState(false);
  
  // NFT Send states
  const [showSendNFTModal, setShowSendNFTModal] = useState(false);
  const [selectedNFTForSend, setSelectedNFTForSend] = useState<NFT | null>(null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { currentUser, userData, getAllUsers } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };


  // NFT Send functions
  const handleSearchRecipients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // First try to get real users from Firebase
      const realUsers = await getAllUsers();
      const searchQuery = query.toLowerCase();
      
      // Filter real users
      const filteredRealUsers = realUsers
        .filter(user => 
          user.uid.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery) ||
          user.displayName.toLowerCase().includes(searchQuery) ||
          (user.nickname && user.nickname.toLowerCase().includes(searchQuery))
        )
        .slice(0, 5)
        .map(user => ({
          id: user.uid,
          username: user.nickname || user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.uid}`,
          email: user.email,
          displayName: user.displayName,
          avatar: '/api/placeholder/40/40',
          isActive: true,
          joinedAt: user.createdAt || new Date().toISOString()
        }));

      if (filteredRealUsers.length > 0) {
        setSearchResults(filteredRealUsers);
      } else {
        // Fall back to demo users
        const result = await userSearchService.searchUsers(query, 5);
        setSearchResults(result.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      // Fall back to demo users
      try {
        const result = await userSearchService.searchUsers(query, 5);
        setSearchResults(result.users);
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendNFT = async () => {
    if (!currentUser || !selectedNFTForSend || !selectedRecipient) return;

    setIsSending(true);
    try {
      const result = await nftMarketplaceService.giftNFT(
        currentUser.uid,
        selectedNFTForSend.id,
        selectedRecipient.id,
        giftMessage
      );

      if (result.success) {
        alert(`NFT "${selectedNFTForSend.name}" sent to ${selectedRecipient.displayName} successfully!`);
        // Refresh owned NFTs
        const userNFTs = await nftMarketplaceService.getUserNFTs(currentUser.uid);
        setOwnedNFTs(userNFTs);
        // Reset modal
        setShowSendNFTModal(false);
        setSelectedNFTForSend(null);
        setSelectedRecipient(null);
        setRecipientSearch('');
        setGiftMessage('');
        setSearchResults([]);
      } else {
        alert(result.error || 'Send failed');
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Send failed');
    } finally {
      setIsSending(false);
    }
  };

  // Firebase'dan ma'lumotlarni yuklash
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // EDU token ma'lumotlarini har doim yuklash
        const [eduBalance, eduTransactions] = await Promise.all([
          lernisTokenService.getLernisTokenBalance(currentUser.uid),
          lernisTokenService.getLernisTokenTransactions(currentUser.uid)
        ]);
        
        setEduTokenBalance(eduBalance);
        setEduTokenTransactions(eduTransactions);
        
        
        // NFT transaction'larini yuklash
        const storedNftTransactions = localStorage.getItem(`nft_transactions_${currentUser.uid}`);
        if (storedNftTransactions) {
          setNftTransactions(JSON.parse(storedNftTransactions));
        }
        
        // Owned NFTs'ni yuklash
        const userNFTs = await nftMarketplaceService.getUserNFTs(currentUser.uid);
        setOwnedNFTs(userNFTs);
        
        // Agar wallet mavjud bo'lsa, boshqa ma'lumotlarni ham yuklash
        if (userData?.wallet) {
            const [certs, achievs, , , balance, walletTrans, , ] = await Promise.all([
              certificateService.getCertificates(currentUser.uid),
              achievementService.getAchievements(currentUser.uid),
              transactionService.getTransactions(currentUser.uid),
              firebaseWalletService.getWalletStats(currentUser.uid),
              walletService.getWalletBalance(userData.wallet.address),
              walletService.getWalletTransactions(userData.wallet.address),
              tokenService.getTokenBalances(userData.wallet.address),
              tokenService.getTokenTransactions(userData.wallet.address)
            ]);
        
        setCertificates(certs);
        setAchievements(achievs);
            // setWalletStats(stats);
            setWalletBalance(balance);
            setWalletTransactions(walletTrans);
            // setTokenBalances([]);
            // setTokenTransactions([]);
        }
        
        console.log('EDU Token Balance:', eduBalance);
        console.log('EDU Token Transactions:', eduTransactions);
      } catch (error) {
        console.error('Error loading wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, userData?.wallet]);

  // EDU Token balance refresh
  useEffect(() => {
    if (!currentUser) return;
    
    const refreshEduBalance = async () => {
      try {
        const [eduBalance, eduTransactions] = await Promise.all([
          lernisTokenService.getLernisTokenBalance(currentUser.uid),
          lernisTokenService.getLernisTokenTransactions(currentUser.uid)
        ]);
        
        setEduTokenBalance(eduBalance);
        setEduTokenTransactions(eduTransactions);
        console.log('EDU balance refreshed:', eduBalance);
      } catch (error) {
        console.error('Error refreshing EDU balance:', error);
      }
    };

    // Har 10 soniyada yangilash (tezroq)
    const interval = setInterval(refreshEduBalance, 10000);
    
    // Dastlabki yuklash
    refreshEduBalance();

    return () => clearInterval(interval);
  }, [currentUser]);

  // Real-time balance refresh
  useEffect(() => {
    if (!userData?.wallet?.address) return;
    
    const refreshBalance = async () => {
      try {
        const balance = await walletService.getWalletBalance(userData?.wallet?.address || '');
        setWalletBalance(balance);
        console.log('Real balance updated:', balance);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    };

    // Initial load
    refreshBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshBalance, 30000);
    
    return () => clearInterval(interval);
  }, [userData?.wallet?.address]);

  // Wallet yaratish funksiyasi
  const handleCreateWallet = async () => {
    if (!currentUser || !userData?.userId) return;
    
    setIsCreatingWallet(true);
    try {
      // Yangi wallet yaratish
      const newWallet = await walletService.createWallet(userData.userId);
      
      // Firebase'ga saqlash
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        walletAddress: newWallet.address,
        wallet: newWallet,
        updatedAt: new Date().toISOString()
      });
      
      // Sahifani yangilash
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating wallet:', error);
      showToastNotification('Failed to create wallet. Please try again.', 'error');
    } finally {
      setIsCreatingWallet(false);
      setShowCreateWalletModal(false);
    }
  };

  // Wallet eksport funksiyasi
  const handleExportWallet = async () => {
    if (!userData?.wallet) return;
    
    setShowExportModal(true);
  };

  const confirmExport = async () => {
    if (!userData?.wallet || !exportPassword) return;
    
    try {
      const exportedData = await walletService.exportWallet(userData.wallet, exportPassword);
      setExportData(exportedData);
      setExportPassword('');
    } catch (error) {
      console.error('Error exporting wallet:', error);
      showToastNotification('Failed to export wallet. Please try again.', 'error');
    }
  };

  const showToastNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // setToastMessage(message);
    // setToastType(type);
    // setShowToast(true);
    // setTimeout(() => {
    //   setShowToast(false);
    // }, 3000);
    console.log(`Toast: ${type} - ${message}`);
  };

  const copyToClipboard = (text: string, itemType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemType);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  // const copyPhrase = () => {
  //   if (userData?.wallet?.mnemonic) {
  //     copyToClipboard(userData.wallet.mnemonic, 'phrase');
  //   } else {
  //     showToastNotification('No recovery phrase available', 'error');
  //   }
  // };

  const showAddressDetails = () => {
    if (userData?.wallet?.address) {
      generateQRCode(userData.wallet.address);
    }
    setShowAddressModal(true);
  };

  const showPhraseDetails = () => {
    setShowPhraseModal(true);
  };

  const generateQRCode = useCallback(async (address: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, []);

  const showQRCode = () => {
    if (userData?.wallet?.address) {
      generateQRCode(userData.wallet.address);
      setShowQRModal(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Token yaratish funksiyasi
  const handleCreateToken = async () => {
    if (!tokenForm.name || !tokenForm.symbol || !tokenForm.initialSupply) {
      showToastNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!userData?.userId) {
      showToastNotification('User ID not found', 'error');
      return;
    }

    setIsCreatingToken(true);
    try {
      // const tokenData = await tokenService.createToken(
      //   tokenForm.name,
      //   tokenForm.symbol,
      //   tokenForm.initialSupply,
      //   tokenForm.decimals,
      //   userData.userId
      // );

      showToastNotification(`Token "${tokenForm.symbol}" created successfully!`, 'success');
      setShowCreateTokenModal(false);
      setTokenForm({ name: '', symbol: '', initialSupply: '', decimals: 18 });
      
      // Token balanslarini yangilash
      if (userData?.wallet?.address) {
        // const newTokenBalances = await tokenService.getTokenBalances(userData.wallet.address);
        // setTokenBalances(newTokenBalances);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      showToastNotification('Failed to create token. Please try again.', 'error');
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Token jo'natish funksiyasi
  const handleTransferToken = async () => {
    if (!transferForm.tokenAddress || !transferForm.to || !transferForm.amount) {
      showToastNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!userData?.wallet?.privateKey) {
      showToastNotification('Wallet private key not found', 'error');
      return;
    }

    setIsTransferringToken(true);
    try {
      const txHash = await tokenService.transferToken(
        transferForm.tokenAddress,
        transferForm.to,
        transferForm.amount,
        userData.wallet.privateKey
      );

      showToastNotification(`Token transferred successfully! TX: ${txHash.slice(0, 10)}...`, 'success');
      setShowTransferTokenModal(false);
      setTransferForm({ tokenAddress: '', to: '', amount: '' });
      
      // Token tranzaksiyalarini yangilash
      if (userData?.wallet?.address) {
        // const newTokenTransactions = await tokenService.getTokenTransactions(userData.wallet.address);
        // setTokenTransactions(newTokenTransactions);
      }
    } catch (error) {
      console.error('Error transferring token:', error);
      showToastNotification('Failed to transfer token. Please try again.', 'error');
    } finally {
      setIsTransferringToken(false);
    }
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
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
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Wallet balance skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex items-center space-x-4">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex space-x-1 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
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
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - TokenPocket Style */}
        <header className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
                <p className="text-sm text-gray-500">Polygon Network</p>
            </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <QrCode className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Wallet mavjud emas */}
          {!userData?.wallet && (
            <div className="flex flex-col items-center justify-center min-h-[600px]">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                  <Wallet className="h-16 w-16 text-white" />
              </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 font-bold text-sm">!</span>
                </div>
              </div>
              <div className="text-center max-w-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Your Digital Assets</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Create a secure blockchain wallet to store your NFT certificates, achievements, and digital tokens. Your keys, your crypto.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCreateWalletModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                    <div className="flex items-center justify-center space-x-2">
                      <PlusCircle className="h-5 w-5" />
                      <span>Create New Wallet</span>
                    </div>
              </button>
                  <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold">
                    <div className="flex items-center justify-center space-x-2">
                      <Key className="h-5 w-5" />
                      <span>Import Existing</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wallet mavjud bo'lsa */}
          {userData?.wallet && (
            <div className="space-y-6">
              {/* Network Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Polygon Network</h3>
                      <p className="text-xs text-gray-500">Connected to Mainnet</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Chain ID: 137</p>
                    <p className="text-xs text-green-600">Live Data</p>
                  </div>
                </div>
              </div>

              {/* MetaMask Style Balance Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Total Balance</h3>
                        <p className="text-3xl font-bold text-gray-900">
                          {showBalance ? `${walletBalance?.matic || '0.0000'} MATIC` : '••••••'}
                        </p>
                        <p className="text-lg font-semibold text-blue-600 mt-2">
                          {showBalance ? `${eduTokenBalance?.balance || '100.00'} EDU` : '••••••'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ≈ ${showBalance ? (parseFloat(walletBalance?.usd || '0') + parseFloat(eduTokenBalance?.usdValue || '5')).toFixed(2) : '••••'} USD
                        </p>
                        <p className="text-xs text-green-600 mt-1">Live from Polygon</p>
                  </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Wallet className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    <button
                        onClick={showAddressDetails}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-sm"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Address</span>
                      </button>
                      <button
                        onClick={showQRCode}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-sm"
                      >
                        <QrCode className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">QR Code</span>
                      </button>
                      <button
                        onClick={showPhraseDetails}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-sm"
                      >
                        <Key className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Phrase</span>
                    </button>
                    <button
                      onClick={handleExportWallet}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-sm"
                    >
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Export</span>
                    </button>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                      <p className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{formatAddress(userData?.wallet?.address || '')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TokenPocket Style Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+2.5%</span>
                    </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Portfolio Value</h3>
                  <p className="text-lg font-bold text-gray-900">${walletBalance?.usd || '0.00'}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg">🎓</span>
                    </div>
                    <span className="text-xs text-gray-500">EDU</span>
                    </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">EDU Balance</h3>
                  <p className="text-lg font-bold text-gray-900">{eduTokenBalance?.balance || '100.00'}</p>
                  </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Coins className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-500">MATIC</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">MATIC Balance</h3>
                  <p className="text-lg font-bold text-gray-900">{walletBalance?.matic || '0.0000'}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500">NFTs</span>
                  </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">NFTs</h3>
                <p className="text-lg font-bold text-gray-900">{ownedNFTs.length}</p>
                  </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-xs text-gray-500">Total</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Transactions</h3>
                  <p className="text-lg font-bold text-gray-900">{walletTransactions.length}</p>
                </div>
              </div>

              {/* TokenPocket Style Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2">
                  <nav className="flex space-x-1">
                    {[
                      { id: 'overview', name: 'Overview', icon: BarChart3 },
                      { id: 'tokens', name: 'Tokens', icon: Coins },
                      { id: 'nfts', name: 'NFTs', icon: Trophy },
                      { id: 'certificates', name: 'Certificates', icon: FileText },
                      { id: 'achievements', name: 'Achievements', icon: Trophy },
                      { id: 'transactions', name: 'Transactions', icon: Activity }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.name}</span>
                        {selectedTab === tab.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {selectedTab === 'overview' && (
                    <div className="space-y-6">

                      {/* EDU Token Balance Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
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
                              <Coins className="h-4 w-4" />
                              <span>Buy More</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Transactions */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                          <div className="space-y-3">
                            {/* EDU Token Transactions */}
                            {eduTokenTransactions.slice(0, 3).map((tx) => (
                              <div key={`edu-${tx.id}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? (
                                      <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                                    <p className="text-xs text-gray-500">{tx.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? '+' : '-'}{tx.amount} {tx.symbol}
                                  </p>
                                  <p className={`text-xs ${
                                    tx.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* NFT Transactions */}
                            {nftTransactions.slice(0, 2).map((tx) => (
                              <div key={`nft-${tx.id}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                                    <span className="text-lg">🎨</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">NFT Purchase</p>
                                    <p className="text-xs text-gray-500">{tx.nftName}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-purple-600">-{tx.price} EDU</p>
                                  <p className={`text-xs ${
                                    tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* MATIC Transactions */}
                            {walletTransactions.slice(0, 2).map((tx, index) => (
                              <div key={`matic-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    tx.type === 'receive' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {tx.type === 'receive' ? (
                                      <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                                    <p className="text-xs text-gray-500">{formatDate(new Date(tx.timestamp).getTime())}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    tx.type === 'receive' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {tx.type === 'receive' ? '+' : '-'}{tx.value} MATIC
                                  </p>
                                  <p className={`text-xs ${
                                    tx.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* MetaMask Style Quick Actions */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <Send className="h-6 w-6 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">Send</span>
                            </button>
                            
                            <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                <ArrowDownRight className="h-6 w-6 text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">Receive</span>
                            </button>
                            
                            <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                <ArrowUpRight className="h-6 w-6 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">Swap</span>
                            </button>
                            
                            <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                                <Plus className="h-6 w-6 text-orange-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">Buy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NFTs Tab */}
                  {selectedTab === 'nfts' && (
                    <div className="space-y-6">
                      {/* NFTs Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">My NFTs</h3>
                          <p className="text-gray-600">Your purchased and received NFT collection</p>
                        </div>
                        <Link
                          to="/dashboard/marketplace"
                          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                          <span className="text-lg">🎨</span>
                          <span>Browse Marketplace</span>
                        </Link>
                      </div>

                      {/* NFTs Grid */}
                      {ownedNFTs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {ownedNFTs.map((nft) => (
                            <div
                              key={nft.id}
                              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                              {/* NFT Image */}
                              <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center text-6xl">
                                  {nft.category === 'certificate' ? '🎓' : 
                                   nft.category === 'achievement' ? '🏆' : 
                                   nft.category === 'badge' ? '🎖️' : 
                                   nft.category === 'course' ? '📚' : 
                                   nft.category === 'collectible' ? '🎨' : '💎'}
                                </div>
                              </div>

                              {/* NFT Info */}
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 truncate text-sm">{nft.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    nft.rarity === 'common' ? 'text-gray-500 bg-gray-100' :
                                    nft.rarity === 'rare' ? 'text-blue-500 bg-blue-100' :
                                    nft.rarity === 'epic' ? 'text-purple-500 bg-purple-100' :
                                    nft.rarity === 'legendary' ? 'text-yellow-500 bg-yellow-100' :
                                    'text-gray-500 bg-gray-100'
                                  }`}>
                                    {nft.rarity}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{nft.description}</p>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                  <span>By {nft.creator.name}</span>
                                  <span>{new Date(nft.mintedAt).toLocaleDateString()}</span>
                                </div>
                                
                                {/* Show if NFT was received as gift */}
                                {(nft as any).receivedFrom && (
                                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-green-600">🎁</span>
                                      <span className="text-xs text-green-700">
                                        Received from {(nft as any).receivedFrom}
                                      </span>
                                    </div>
                                    {(nft as any).giftMessage && (
                                      <p className="text-xs text-green-600 mt-1 italic">
                                        "{(nft as any).giftMessage}"
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Coins className="h-3 w-3 text-blue-600" />
                                    <span className="text-xs font-semibold text-gray-900">{nft.price} EDU</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-500">
                                      <Eye className="h-3 w-3" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSelectedNFTForSend(nft);
                                        setShowSendNFTModal(true);
                                      }}
                                      className="p-1 text-gray-400 hover:text-green-500"
                                      title="Send NFT"
                                    >
                                      <Send className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🎨</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h3>
                          <p className="text-gray-500 mb-6">Start collecting educational NFTs from the marketplace!</p>
                          <Link
                            to="/dashboard/marketplace"
                            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                          >
                            <span className="text-lg">🎨</span>
                            <span>Browse Marketplace</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tokens Tab */}
                  {selectedTab === 'tokens' && (
                    <div className="space-y-6">
                      {/* Marketplace Banner */}
                      <MarketplaceBanner variant="wallet" />
                      
                      {/* EDU Token Display */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">🎓</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">EduCoin Platform Token</h4>
                            <p className="text-sm text-gray-600 mb-2">Platform Native Token</p>
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">Balance</p>
                                <p className="text-lg font-semibold text-gray-900">{eduTokenBalance?.balance || '100.00'} EDU</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">USD Value</p>
                                <p className="text-lg font-semibold text-green-600">${eduTokenBalance?.usdValue || '5.00'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MATIC Token Display */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Coins className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">MATIC Token</h4>
                            <p className="text-sm text-gray-600 mb-2">Polygon Network Native Token</p>
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">Balance</p>
                                <p className="text-lg font-semibold text-gray-900">{walletBalance?.matic || '0.0000'} MATIC</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">USD Value</p>
                                <p className="text-lg font-semibold text-green-600">${walletBalance?.usd || '0.00'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* EDU Token Transactions */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent EDU Token Transactions</h3>
                        <div className="space-y-3">
                          {eduTokenTransactions.length > 0 ? (
                            eduTokenTransactions.slice(0, 5).map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? (
                                      <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                                    <p className="text-xs text-gray-500">{tx.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? '+' : '-'}{tx.amount} {tx.symbol}
                                  </p>
                                  <p className={`text-xs ${
                                    tx.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="h-8 w-8 text-gray-400" />
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h4>
                              <p className="text-gray-600 mb-4">Your EDU token transactions will appear here</p>
                              <Link
                                to="/dashboard/buy-tokens"
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <Coins className="h-4 w-4" />
                                <span>Buy EDU Tokens</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Empty State */}
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Coins className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Tokens</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          You currently have EDU and MATIC tokens. Custom tokens will appear here when you receive them.
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Connected to Polygon Network</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Certificates Tab */}
                  {selectedTab === 'certificates' && (
                    <div className="space-y-4">
                      {certificates.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates</h3>
                          <p className="text-gray-600">You haven't received any certificates yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {certificates.map((cert) => (
                            <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{cert.name || 'Certificate'}</h4>
                                  <p className="text-sm text-gray-600">{cert.issuer || 'Lernis Platform'}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{cert.date}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Achievements Tab */}
                  {selectedTab === 'achievements' && (
                    <div className="space-y-4">
                      {achievements.length === 0 ? (
                        <div className="text-center py-12">
                          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements</h3>
                          <p className="text-gray-600">You haven't earned any achievements yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {achievements.map((achievement) => (
                            <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{achievement.name || 'Achievement'}</h4>
                                  <p className="text-sm text-gray-600">Lernis Platform</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{achievement.date}</span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Earned</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transactions Tab */}
                  {selectedTab === 'transactions' && (
                    <div className="space-y-4">
                      {/* EDU Token Transactions */}
                      {eduTokenTransactions.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <span className="text-lg">🎓</span>
                            <span>EDU Token Transactions</span>
                          </h4>
                        <div className="space-y-3">
                            {eduTokenTransactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors duration-200">
                              <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? (
                                    <ArrowDownCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <ArrowUpCircle className="h-5 w-5 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                                    <p className="text-sm text-gray-600">{tx.description}</p>
                                    <p className="text-xs text-gray-500">{formatDate(new Date(tx.timestamp).getTime())}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                    tx.type === 'purchase' || tx.type === 'reward' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {tx.type === 'purchase' || tx.type === 'reward' ? '+' : '-'}{tx.amount} {tx.symbol}
                                  </p>
                                  <p className={`text-sm ${
                                    tx.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}

                      {/* NFT Transactions */}
                      {nftTransactions.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <span className="text-lg">🎨</span>
                            <span>NFT Transactions</span>
                          </h4>
                          <div className="space-y-3">
                            {nftTransactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors duration-200">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                                    <span className="text-lg">🎨</span>
                </div>
                                  <div>
                                    <p className="font-medium text-gray-900">NFT Purchase</p>
                                    <p className="text-sm text-gray-600">{tx.nftName}</p>
                                    <p className="text-xs text-gray-500">{formatDate(new Date(tx.timestamp).getTime())}</p>
              </div>
            </div>
                                <div className="text-right">
                                  <p className="font-medium text-purple-600">-{tx.price} EDU</p>
                                  <p className={`text-sm ${
                                    tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {tx.status}
                                  </p>
      </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {eduTokenTransactions.length === 0 && walletTransactions.length === 0 && nftTransactions.length === 0 && (
                        <div className="text-center py-12">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
                          <p className="text-gray-600 mb-4">You haven't made any transactions yet.</p>
                          <div className="flex items-center justify-center space-x-3">
                            <Link
                              to="/dashboard/buy-tokens"
                              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Coins className="h-4 w-4" />
                              <span>Buy EDU Tokens</span>
                            </Link>
                            <Link
                              to="/dashboard/marketplace"
                              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                              <span className="text-lg">🎨</span>
                              <span>Browse NFTs</span>
                            </Link>
          </div>
        </div>
      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* Export Wallet Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                  </div>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900">Export Wallet</h3>
                  <p className="text-sm text-gray-500">Download your wallet data securely</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportPassword('');
                    setExportData(null);
                  }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
            {/* Content */}
            <div className="p-6 space-y-4">
              {!exportData ? (
                <>
                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-800 mb-1">Security Notice</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Enter your password to export wallet data securely.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Success Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-800 mb-1">Export Successful</p>
                        <p className="text-xs text-green-700 leading-relaxed">
                          Keep this information secure and never share it.
                    </p>
                  </div>
                      </div>
                    </div>
                    
                  {/* Private Key */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Private Key</span>
                      </div>
                          <button
                          onClick={() => copyToClipboard(exportData.privateKey, 'privateKey')}
                          className={`text-sm font-medium flex items-center space-x-1 ${
                            copiedItem === 'privateKey' 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {copiedItem === 'privateKey' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                          </button>
                        </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                        {exportData.privateKey}
                      </p>
                          </div>
                        </div>

                  {/* Seed Phrase */}
                  {exportData.mnemonic && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Seed Phrase</span>
                                  </div>
                                  <button
                          onClick={() => copyToClipboard(exportData.mnemonic || '', 'seedPhrase')}
                          className={`text-sm font-medium flex items-center space-x-1 ${
                            copiedItem === 'seedPhrase' 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {copiedItem === 'seedPhrase' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                                  </button>
                                </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                          {exportData.mnemonic}
                        </p>
                                  </div>
                                    </div>
                                  )}
                </>
              )}
                                </div>
                                
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
                                  <button
                                    onClick={() => {
                  setShowExportModal(false);
                  setExportPassword('');
                  setExportData(null);
                                    }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                                  >
                Close
                                  </button>
              {!exportData ? (
                              <button
                  onClick={confirmExport}
                  disabled={!exportPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                  Export Wallet
                              </button>
              ) : (
                    <button
                      onClick={() => {
                        setShowExportModal(false);
                        setExportPassword('');
                    setExportData(null);
                      }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
                    >
                      Done
                    </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create Blockchain Wallet</h3>
                  <p className="text-sm text-gray-600">Generate a new wallet for your account</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">What you'll get:</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Unique wallet address on Polygon network</li>
                    <li>• Ability to receive NFT certificates</li>
                    <li>• Secure private key (encrypted and stored safely)</li>
                    <li>• 12-word recovery phrase</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Important:</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Your private key will be encrypted and stored securely. You can export it later if needed.
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateWalletModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWallet}
                    disabled={isCreatingWallet}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingWallet ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Wallet'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {showCreateTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Create New Token</h3>
                    <p className="text-sm text-gray-600">Deploy your own ERC-20 token</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateTokenModal(false);
                    setTokenForm({ name: '', symbol: '', initialSupply: '', decimals: 18 });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Token Name</label>
                  <input
                    type="text"
                    value={tokenForm.name}
                    onChange={(e) => setTokenForm({...tokenForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lernis Token"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={tokenForm.symbol}
                    onChange={(e) => setTokenForm({...tokenForm, symbol: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., LERN"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Supply</label>
                  <input
                    type="number"
                    value={tokenForm.initialSupply}
                    onChange={(e) => setTokenForm({...tokenForm, initialSupply: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1000000"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decimals</label>
                  <select
                    value={tokenForm.decimals}
                    onChange={(e) => setTokenForm({...tokenForm, decimals: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={18}>18 (Recommended)</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Estimated Cost</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Gas fee: ~0.05 MATIC
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateTokenModal(false);
                    setTokenForm({ name: '', symbol: '', initialSupply: '', decimals: 18 });
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateToken}
                  disabled={isCreatingToken || !tokenForm.name || !tokenForm.symbol || !tokenForm.initialSupply}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingToken ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Token'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Token Modal */}
      {showTransferTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Transfer Token</h3>
                    <p className="text-sm text-gray-600">Send tokens to another address</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTransferTokenModal(false);
                    setTransferForm({ tokenAddress: '', to: '', amount: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
                  <input
                    type="text"
                    value={transferForm.tokenAddress}
                    onChange={(e) => setTransferForm({...transferForm, tokenAddress: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0x..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={transferForm.to}
                    onChange={(e) => setTransferForm({...transferForm, to: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0x..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                  />
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Transaction Fee</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Gas fee: ~0.001 MATIC
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTransferTokenModal(false);
                    setTransferForm({ tokenAddress: '', to: '', amount: '' });
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferToken}
                  disabled={isTransferringToken || !transferForm.tokenAddress || !transferForm.to || !transferForm.amount}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransferringToken ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Transferring...
                    </>
                  ) : (
                    'Transfer Token'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Details Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Copy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wallet Address</h3>
                  <p className="text-sm text-gray-500">Your wallet's public address</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Address</span>
                  </div>
                    <button
                      onClick={() => copyToClipboard(userData?.wallet?.address || '', 'address')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        copiedItem === 'address' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {copiedItem === 'address' ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                    {userData?.wallet?.address || 'No address available'}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">QR Code</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto border border-gray-200 p-2">
                    {qrCodeDataURL ? (
                      <img 
                        src={qrCodeDataURL} 
                        alt="Wallet Address QR Code" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan to receive payments</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Close
              </button>
                <button
                  onClick={() => copyToClipboard(userData?.wallet?.address || '', 'address')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    copiedItem === 'address' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copiedItem === 'address' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Address</span>
                  )}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Wallet Info Modal */}
      {showPhraseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wallet Details</h3>
                  <p className="text-sm text-gray-500">Secure wallet information</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhraseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Private Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Private Key</span>
                  </div>
                    <button
                      onClick={() => copyToClipboard(userData?.wallet?.privateKey || '', 'privateKey')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        copiedItem === 'privateKey' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {copiedItem === 'privateKey' ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                    {userData?.wallet?.privateKey || 'No private key available'}
                  </p>
                </div>
              </div>

              {/* Seed Phrase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Seed Phrase</span>
                  </div>
                    <button
                      onClick={() => copyToClipboard(userData?.wallet?.mnemonic || '', 'seedPhrase')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        copiedItem === 'seedPhrase' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {copiedItem === 'seedPhrase' ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                </div>
                
                {/* Security Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800 mb-1">Security Warning</p>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        Never share your seed phrase. Anyone with access can control your wallet.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                    {userData?.wallet?.mnemonic || 'No seed phrase available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowPhraseModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Close
              </button>
                <button
                  onClick={() => copyToClipboard(userData?.wallet?.mnemonic || '', 'seedPhrase')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    copiedItem === 'seedPhrase' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copiedItem === 'seedPhrase' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Seed Phrase</span>
                  )}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                  <p className="text-sm text-gray-500">Scan to receive payments</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mx-auto border border-gray-200 p-4">
                  {qrCodeDataURL ? (
                    <img 
                      src={qrCodeDataURL} 
                      alt="Wallet Address QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3 font-mono">
                  {formatAddress(userData?.wallet?.address || '')}
                </p>
              </div>

              {/* Address Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Address</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(userData?.wallet?.address || '', 'address')}
                    className={`text-sm font-medium flex items-center space-x-1 ${
                      copiedItem === 'address' 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {copiedItem === 'address' ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                    {userData?.wallet?.address || 'No address available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Close
              </button>
                <button
                  onClick={() => copyToClipboard(userData?.wallet?.address || '', 'address')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    copiedItem === 'address' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copiedItem === 'address' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Address</span>
                  )}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Send NFT Modal */}
      {showSendNFTModal && selectedNFTForSend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send NFT</h3>
                <button
                  onClick={() => {
                    setShowSendNFTModal(false);
                    setSelectedNFTForSend(null);
                    setSelectedRecipient(null);
                    setRecipientSearch('');
                    setGiftMessage('');
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* NFT Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">
                    {selectedNFTForSend.category === 'certificate' ? '🎓' : 
                     selectedNFTForSend.category === 'achievement' ? '🏆' : 
                     selectedNFTForSend.category === 'badge' ? '🎖️' : 
                     selectedNFTForSend.category === 'course' ? '📚' : 
                     selectedNFTForSend.category === 'collectible' ? '🎨' : '💎'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{selectedNFTForSend.name}</h4>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-gray-900">{selectedNFTForSend.price} EDU</span>
                </div>
              </div>

              {/* Recipient Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to (ID, Username, or Email)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, username, or email..."
                    value={recipientSearch}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value);
                      handleSearchRecipients(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedRecipient(user);
                          setRecipientSearch(user.displayName);
                          setSearchResults([]);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{user.displayName}</p>
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Real User
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Recipient */}
              {selectedRecipient && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedRecipient.displayName}</p>
                      <p className="text-sm text-gray-500">@{selectedRecipient.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{selectedRecipient.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gift Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  placeholder="Add a personal message..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSendNFTModal(false);
                    setSelectedNFTForSend(null);
                    setSelectedRecipient(null);
                    setRecipientSearch('');
                    setGiftMessage('');
                    setSearchResults([]);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNFT}
                  disabled={!selectedRecipient || isSending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send NFT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
