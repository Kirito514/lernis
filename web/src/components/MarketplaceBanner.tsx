// import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Coins, ArrowRight, Star, Zap, TrendingUp } from 'lucide-react';

interface MarketplaceBannerProps {
  variant?: 'wallet' | 'dashboard';
  className?: string;
}

export default function MarketplaceBanner({ variant = 'dashboard', className = '' }: MarketplaceBannerProps) {
  if (variant === 'wallet') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">NFT Marketplace</h3>
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                <Star className="h-3 w-3" />
                <span>New!</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              Discover and collect educational NFTs! Use your EDU tokens to purchase certificates, achievements, and exclusive digital collectibles.
            </p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Marketplace</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>50+ NFTs Available</span>
              </div>
            </div>
            
            <Link
              to="/dashboard/marketplace"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="ml-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="text-4xl">🎓</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">NFT Marketplace</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Star className="h-3 w-3" />
                  <span>New Feature</span>
                </div>
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed max-w-md">
            Discover educational NFTs and digital collectibles! Purchase certificates, achievements, and exclusive content using EDU tokens.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/60 rounded-lg p-3 border border-white/40">
              <div className="flex items-center space-x-2 mb-1">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">EDU Tokens</span>
              </div>
              <p className="text-xs text-gray-600">Easy payment system</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 border border-white/40">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">50+ NFTs</span>
              </div>
              <p className="text-xs text-gray-600">Available now</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard/marketplace"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard/buy-tokens"
              className="inline-flex items-center space-x-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200"
            >
              <Coins className="h-4 w-4" />
              <span>Buy Tokens</span>
            </Link>
          </div>
        </div>
        
        <div className="ml-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="text-6xl">🎓</div>
            <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="h-3 w-3 text-yellow-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
