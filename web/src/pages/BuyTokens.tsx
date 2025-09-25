import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { lernisTokenService, type PaymentMethod, type LernisTokenPrice } from '../services/lernisTokenService';
import {
  Coins,
  CreditCard,
  Smartphone,
  Building,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  Calculator,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export default function BuyTokens() {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [tokenPrice, setTokenPrice] = useState<LernisTokenPrice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [uzsAmount, setUzsAmount] = useState<string>('');
  const [lernisAmount, setLernisAmount] = useState<string>('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (uzsAmount && tokenPrice) {
      // UZS to USD conversion (1 USD = 12500 UZS)
      const usdAmount = parseFloat(uzsAmount) / 12500;
      // USD to EDU tokens conversion
      const eduTokens = usdAmount / tokenPrice.price;
      setLernisAmount(eduTokens.toFixed(2));
    } else {
      setLernisAmount('');
    }
  }, [uzsAmount, tokenPrice]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [methods, price] = await Promise.all([
        lernisTokenService.getPaymentMethods(),
        lernisTokenService.getLernisTokenPrice()
      ]);
      
      setPaymentMethods(methods);
      setTokenPrice(price);
      setSelectedPaymentMethod(methods[0]); // Default to first payment method
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser || !selectedPaymentMethod || !uzsAmount) return;
    
    setProcessing(true);
    try {
      const result = await lernisTokenService.purchaseLernisTokens(
        currentUser.uid,
        parseFloat(uzsAmount),
        selectedPaymentMethod.id,
        { amount: uzsAmount }
      );
      
      if (result.success) {
        alert(`Purchase successful! ${lernisAmount} EDU tokens have been added to your wallet.`);
        setShowPurchaseModal(false);
        setUzsAmount('');
        setLernisAmount('');
        // Real-time update uchun localStorage'ni yangilash
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error) {
      alert('Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'click': return <CreditCard className="h-6 w-6" />;
      case 'payme': return <Smartphone className="h-6 w-6" />;
      case 'bank_card': return <Building className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000]; // UZS amounts

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Buy EDU Tokens</h1>
              <p className="text-gray-600">Purchase EDU tokens to use in the platform</p>
            </div>
            {tokenPrice && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl px-4 py-2 border border-green-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div className="text-right">
                    <p className="text-sm text-gray-600">LERNIS Price</p>
                    <p className="font-semibold text-gray-900">${tokenPrice.price.toFixed(4)}</p>
                    <p className={`text-xs ${tokenPrice.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Purchase Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Coins className="h-6 w-6 text-blue-600" />
                <span>Purchase Tokens</span>
              </h2>

              {/* Amount Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (UZS)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={uzsAmount}
                      onChange={(e) => setUzsAmount(e.target.value)}
                      placeholder="Enter amount in UZS"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      UZS
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setUzsAmount(amount.toString())}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {amount.toLocaleString()} UZS
                    </button>
                  ))}
                </div>

                {/* Conversion Display */}
                {lernisAmount && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-900 font-medium">You will receive:</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">{lernisAmount} LERNIS</p>
                        <p className="text-sm text-blue-700">≈ ${(parseFloat(lernisAmount) * (tokenPrice?.price || 0)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        selectedPaymentMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPaymentMethod?.id === method.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {getPaymentIcon(method.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">
                              Fee: {method.fee}% • Min: {method.minAmount.toLocaleString()} UZS
                            </p>
                          </div>
                        </div>
                        {selectedPaymentMethod?.id === method.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              {selectedPaymentMethod && uzsAmount && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Fee Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{parseFloat(uzsAmount).toLocaleString()} UZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Fee ({selectedPaymentMethod.fee}%):</span>
                      <span className="font-medium">
                        {(parseFloat(uzsAmount) * selectedPaymentMethod.fee / 100).toLocaleString()} UZS
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-bold text-gray-900">
                        {(parseFloat(uzsAmount) * (1 + selectedPaymentMethod.fee / 100)).toLocaleString()} UZS
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={() => setShowPurchaseModal(true)}
                disabled={!uzsAmount || !selectedPaymentMethod || parseFloat(uzsAmount) < (selectedPaymentMethod?.minAmount || 0)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Coins className="h-5 w-5" />
                <span>Purchase EDU Tokens</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Token Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>About LERNIS Tokens</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    LERNIS tokens are the native utility tokens of the Lernis platform. Use them to:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mint educational NFTs and certificates</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Purchase premium course content</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Access exclusive marketplace items</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Participate in platform governance</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Security & Safety</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>All payments are processed through secure, licensed payment providers</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Your personal and financial information is encrypted and protected</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Tokens are instantly credited to your wallet after successful payment</span>
                  </div>
                </div>
              </div>

              {/* Token Stats */}
              {tokenPrice && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">${tokenPrice.price.toFixed(4)}</p>
                      <p className="text-sm text-gray-600">Current Price</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className={`text-2xl font-bold ${tokenPrice.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tokenPrice.change24h >= 0 ? '+' : ''}{tokenPrice.change24h.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-600">24h Change</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        ${(tokenPrice.marketCap / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600">Market Cap</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {(tokenPrice.totalSupply / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600">Total Supply</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedPaymentMethod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Purchase</h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">You're purchasing:</span>
                    <span className="font-semibold text-gray-900">{lernisAmount} LERNIS</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Payment method:</span>
                    <span className="font-semibold text-gray-900">{selectedPaymentMethod.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total amount:</span>
                    <span className="font-bold text-gray-900">
                      {(parseFloat(uzsAmount) * (1 + selectedPaymentMethod.fee / 100)).toLocaleString()} UZS
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Payment Process:</p>
                      <p>You will be redirected to {selectedPaymentMethod.name} to complete your payment securely.</p>
                    </div>
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
                  onClick={handlePurchase}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Confirm Purchase</span>
                      <ArrowRight className="h-4 w-4" />
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
