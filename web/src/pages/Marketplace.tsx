import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { nftMarketplaceService, type NFT, type NFTCategory } from '../services/nftMarketplaceService';
import { lernisTokenService } from '../services/lernisTokenService';
import {
  ShoppingBag,
  Filter,
  Search,
  Grid,
  List,
  // Star,
  Eye,
  Heart,
  // TrendingUp,
  // Award,
  // Zap,
  Coins,
  Plus,
  X,
  // CheckCircle,
  // AlertCircle,
  // Crown,
  // Gem,
  // Shield,
  // Sparkles
} from 'lucide-react';

export default function Marketplace() {
  const { currentUser } = useAuth();
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
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  // const [showMintModal, setShowMintModal] = useState(false);

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
        const tokenBalance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
        setLernisBalance(tokenBalance.balance);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
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

  // Rarity uchun vizual effektlar
  // const getRarityConfig = (rarity: NFT['rarity']) => {
  //   switch (rarity) {
  //     case 'legendary':
  //       return {
  //         gradient: 'from-yellow-400 via-orange-500 to-red-600',
  //         glow: 'shadow-2xl shadow-yellow-500/50',
  //         border: 'border-yellow-400',
  //         bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
  //         icon: Crown,
  //         iconColor: 'text-yellow-600',
  //         textColor: 'text-yellow-800',
  //         badgeBg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  //         animation: 'animate-pulse'
  //       };
  //     case 'epic':
  //       return {
  //         gradient: 'from-purple-500 via-pink-500 to-purple-600',
  //         glow: 'shadow-xl shadow-purple-500/40',
  //         border: 'border-purple-400',
  //         bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
  //         icon: Gem,
  //         iconColor: 'text-purple-600',
  //         textColor: 'text-purple-800',
  //         badgeBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
  //         animation: 'hover:animate-bounce'
  //       };
  //     case 'rare':
  //       return {
  //         gradient: 'from-blue-500 via-cyan-500 to-blue-600',
  //         glow: 'shadow-lg shadow-blue-500/30',
  //         border: 'border-blue-400',
  //         bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
  //         icon: Shield,
  //         iconColor: 'text-blue-600',
  //         textColor: 'text-blue-800',
  //         badgeBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  //         animation: 'hover:scale-105'
  //       };
  //     case 'common':
  //       return {
  //         gradient: 'from-gray-400 via-gray-500 to-gray-600',
  //         glow: 'shadow-md shadow-gray-400/20',
  //         border: 'border-gray-300',
  //         bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
  //         icon: Sparkles,
  //         iconColor: 'text-gray-600',
  //         textColor: 'text-gray-700',
  //         badgeBg: 'bg-gradient-to-r from-gray-400 to-gray-500',
  //         animation: ''
  //       };
  //     default:
  //       return {
  //         gradient: 'from-gray-400 to-gray-500',
  //         glow: '',
  //         border: 'border-gray-300',
  //         bg: 'bg-gray-50',
  //         icon: Sparkles,
  //         iconColor: 'text-gray-600',
  //         textColor: 'text-gray-700',
  //         badgeBg: 'bg-gray-400',
  //         animation: ''
  //       };
  //   }
  // };

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
                  
                  <button
                    onClick={() => {
                      setSelectedNFT(nft);
                      setShowPurchaseModal(true);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Buy Now</span>
                  </button>
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
    </div>
  );
}
