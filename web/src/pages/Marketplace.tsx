import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { nftMarketplaceService, type NFT, type NFTCategory } from '../services/nftMarketplaceService';
import { lernisTokenService } from '../services/lernisTokenService';
import { userSearchService, type User } from '../services/userSearchService';
import {
  ShoppingBag,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Heart,
  Coins,
  Plus,
  X,
  Gift,
  User as UserIcon,
  Send,
  Loader2
} from 'lucide-react';

export default function Marketplace() {
  const { currentUser, getAllUsers } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [categories, setCategories] = useState<NFTCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [lernisBalance, setLernisBalance] = useState<string>('0');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  // Gift modal states
  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGifting, setIsGifting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [nftsData, categoriesData] = await Promise.all([
        nftMarketplaceService.getNFTs(),
        nftMarketplaceService.getCategories()
      ]);
      
      setNfts(nftsData);
      setCategories(categoriesData);

      if (currentUser) {
        try {
          const tokenBalance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
          setLernisBalance(tokenBalance.balance);
        } catch (tokenError) {
          console.error('Error loading token balance:', tokenError);
          setLernisBalance('0.00');
        }
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      // Set default data if loading fails
      setNfts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseNFT = async (nft: NFT) => {
    if (!currentUser) return;
    
    const balance = parseFloat(lernisBalance);
    if (balance < nft.price) {
      alert('Insufficient EDU tokens!');
      return;
    }

    try {
      const result = await nftMarketplaceService.purchaseNFT(currentUser.uid, nft.id);
      if (result.success) {
        alert(`NFT "${nft.name}" purchased successfully!`);
        // Refresh data
        await loadData();
        // Refresh EDU balance
        const newBalance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
        setLernisBalance(newBalance.balance);
        setShowPurchaseModal(false);
        setSelectedNFT(null);
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed');
    }
  };

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

  const handleGiftNFT = async () => {
    if (!currentUser || !selectedNFT || !selectedRecipient) return;

    setIsGifting(true);
    try {
      const result = await nftMarketplaceService.giftNFT(
        currentUser.uid,
        selectedNFT.id,
        selectedRecipient.id,
        giftMessage
      );

      if (result.success) {
        alert(`NFT "${selectedNFT.name}" gifted to ${selectedRecipient.displayName} successfully!`);
        // Refresh data
        await loadData();
        // Refresh EDU balance
        const newBalance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
        setLernisBalance(newBalance.balance);
        // Reset gift modal
        setShowGiftModal(false);
        setSelectedNFT(null);
        setSelectedRecipient(null);
        setRecipientSearch('');
        setGiftMessage('');
        setSearchResults([]);
      } else {
        alert(result.error || 'Gift failed');
      }
    } catch (error) {
      console.error('Gift error:', error);
      alert('Gift failed');
    } finally {
      setIsGifting(false);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = selectedCategory === 'all' || nft.category === selectedCategory;
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100';
      case 'rare': return 'text-blue-500 bg-blue-100';
      case 'epic': return 'text-purple-500 bg-purple-100';
      case 'legendary': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'certificate': return '🎓';
      case 'achievement': return '🏆';
      case 'badge': return '🎖️';
      case 'course': return '📚';
      case 'collectible': return '🎨';
      default: return '💎';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NFT Marketplace</h1>
              <p className="text-gray-600">Discover and collect educational NFTs</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* EDU Balance */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 py-2 border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{lernisBalance} EDU</span>
                </div>
              </div>
              <button
                onClick={() => {/* setShowMintModal(true) */}}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Mint NFT</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center space-x-2 ${
                    selectedCategory === category.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* NFTs Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center text-6xl">
                    {getCategoryIcon(nft.category)}
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{nft.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nft.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">{nft.price} EDU</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>By {nft.creator.name}</span>
                    <span>{new Date(nft.mintedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedNFT(nft);
                        setShowPurchaseModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Buy</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNFT(nft);
                        setShowGiftModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Gift</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNFTs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedNFT && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Purchase NFT</h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{getCategoryIcon(selectedNFT.category)}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedNFT.name}</h4>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Coins className="h-5 w-5 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">{selectedNFT.price} EDU</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your Balance:</span>
                    <span className="font-medium text-gray-900">{lernisBalance} EDU</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">After Purchase:</span>
                    <span className="font-medium text-gray-900">
                      {(parseFloat(lernisBalance) - selectedNFT.price).toFixed(2)} EDU
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchaseNFT(selectedNFT)}
                  disabled={parseFloat(lernisBalance) < selectedNFT.price}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && selectedNFT && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Gift NFT</h3>
                <button
                  onClick={() => {
                    setShowGiftModal(false);
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
                  <span className="text-3xl">{getCategoryIcon(selectedNFT.category)}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{selectedNFT.name}</h4>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-gray-900">{selectedNFT.price} EDU</span>
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
                  Gift Message (Optional)
                </label>
                <textarea
                  placeholder="Add a personal message..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Balance Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-medium text-gray-900">{lernisBalance} EDU</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">After Gift:</span>
                  <span className="font-medium text-gray-900">
                    {(parseFloat(lernisBalance) - selectedNFT.price).toFixed(2)} EDU
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowGiftModal(false);
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
                  onClick={handleGiftNFT}
                  disabled={!selectedRecipient || parseFloat(lernisBalance) < selectedNFT.price || isGifting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGifting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Gift</span>
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