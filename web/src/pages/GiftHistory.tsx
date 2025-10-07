import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { nftMarketplaceService, type NFTTransaction } from '../services/nftMarketplaceService';
import {
  Gift,
  Send,
  Download,
  Calendar,
  User,
  Mail,
  Hash,
  Coins,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export default function GiftHistory() {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentGifts, setSentGifts] = useState<NFTTransaction[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<NFTTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  useEffect(() => {
    if (currentUser) {
      loadGiftHistory();
    }
  }, [currentUser]);

  const loadGiftHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [sent, received] = await Promise.all([
        nftMarketplaceService.getUserSentGifts(currentUser.uid),
        nftMarketplaceService.getUserReceivedGifts(currentUser.uid)
      ]);
      
      setSentGifts(sent);
      setReceivedGifts(received);
    } catch (error) {
      console.error('Error loading gift history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gift history...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gift History</h1>
              <p className="text-gray-600">Track your NFT gifts sent and received</p>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sent'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Sent Gifts</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {sentGifts.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'received'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Received Gifts</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {receivedGifts.length}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Gift List */}
            <div className="p-6">
              {activeTab === 'sent' ? (
                <div className="space-y-4">
                  {sentGifts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No gifts sent yet</h3>
                      <p className="text-gray-500">Start gifting NFTs to your friends and colleagues!</p>
                    </div>
                  ) : (
                    sentGifts.map((gift) => (
                      <div key={gift.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Gift className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{gift.nftName}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(gift.status)}`}>
                                  {gift.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>To: {gift.recipientName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{gift.recipientEmail}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Coins className="h-4 w-4" />
                                  <span>{gift.price} EDU</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(gift.timestamp)}</span>
                                </div>
                              </div>
                              
                              {gift.giftMessage && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">"{gift.giftMessage}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(gift.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedGifts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No gifts received yet</h3>
                      <p className="text-gray-500">Share your profile with friends to receive NFT gifts!</p>
                    </div>
                  ) : (
                    receivedGifts.map((gift) => (
                      <div key={gift.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Gift className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{gift.nftName}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(gift.status)}`}>
                                  {gift.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>From: {gift.seller}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Coins className="h-4 w-4" />
                                  <span>Value: {gift.price} EDU</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(gift.timestamp)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Hash className="h-4 w-4" />
                                  <span>ID: {gift.nftId}</span>
                                </div>
                              </div>
                              
                              {gift.giftMessage && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm text-green-800">"{gift.giftMessage}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(gift.status)}
                            <button className="p-2 text-gray-400 hover:text-blue-600">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

