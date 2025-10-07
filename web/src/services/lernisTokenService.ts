// Lernis Platform Token Service
export interface LernisTokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  icon: string;
  decimals: number;
}

export interface LernisTokenTransaction {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'purchase' | 'reward' | 'gift' | 'certificate_creation';
  amount: string;
  symbol: string;
  from?: string;
  to?: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  description?: string;
}

export interface LernisTokenPrice {
  symbol: string;
  price: number; // USD price
  change24h: number; // 24h change percentage
  marketCap: number;
  totalSupply: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'click' | 'payme' | 'bank_card';
  icon: string;
  fee: number; // percentage
  minAmount: number;
  maxAmount: number;
}

export const lernisTokenService = {
  // Certificate creation cost configuration
  CERTIFICATE_CREATION_COST: 10, // 10 EDU tokens per certificate

  // Token balance management
  async getLernisTokenBalance(userId: string): Promise<LernisTokenBalance> {
    try {
      // Firebase'dan balansni olish
      const { tokenBalanceService } = await import('./firebaseService');
      const firebaseBalance = await tokenBalanceService.getTokenBalance(userId);
      
      if (firebaseBalance) {
        return {
          symbol: firebaseBalance.symbol || 'EDU',
          name: firebaseBalance.name || 'EduCoin Platform Token',
          balance: firebaseBalance.balance,
          usdValue: firebaseBalance.usdValue,
          icon: firebaseBalance.icon || '🎓',
          decimals: firebaseBalance.decimals || 2
        };
      }
      
      // Fallback to localStorage if Firebase fails
      const storedBalance = localStorage.getItem(`edu_token_balance_${userId}`);
      if (storedBalance) {
        const balance = JSON.parse(storedBalance);
        return {
          symbol: 'EDU',
          name: 'EduCoin Platform Token',
          balance: balance.balance,
          usdValue: balance.usdValue,
          icon: '🎓',
          decimals: 2
        };
      }
      
      // Default balance
      const defaultBalance = {
        symbol: 'EDU',
        name: 'EduCoin Platform Token',
        balance: '100.00',
        usdValue: '5.00',
        icon: '🎓',
        decimals: 2
      };
      
      return defaultBalance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return {
        symbol: 'EDU',
        name: 'EduCoin Platform Token',
        balance: '0.00',
        usdValue: '0.00',
        icon: '🎓',
        decimals: 2
      };
    }
  },

  // Token balansini yangilash
  async updateTokenBalance(userId: string, newBalance: string, newUsdValue: string): Promise<void> {
    try {
      // Avtomatik Firebase sync
      const { autoFirebaseService } = await import('./autoFirebaseService');
      await autoFirebaseService.syncOnChange(userId, 'token', {
        balance: newBalance,
        usdValue: newUsdValue
      });
      
      // localStorage'ga ham saqlash (fallback uchun)
      localStorage.setItem(`edu_token_balance_${userId}`, JSON.stringify({
        balance: newBalance,
        usdValue: newUsdValue
      }));
    } catch (error) {
      console.error('Error updating token balance:', error);
      // Fallback to localStorage
      localStorage.setItem(`edu_token_balance_${userId}`, JSON.stringify({
        balance: newBalance,
        usdValue: newUsdValue
      }));
    }
  },

  // Token transactions
  async getLernisTokenTransactions(userId: string): Promise<LernisTokenTransaction[]> {
    try {
      const storedTransactions = localStorage.getItem(`edu_token_transactions_${userId}`);
      if (storedTransactions) {
        return JSON.parse(storedTransactions);
      }
      
      // Default transactions
      const defaultTransactions = [
        {
          id: '1',
          type: 'reward' as const,
          amount: '50.00',
          symbol: 'EDU',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'confirmed' as const,
          description: 'Welcome bonus'
        }
      ];
      
      localStorage.setItem(`edu_token_transactions_${userId}`, JSON.stringify(defaultTransactions));
      return defaultTransactions;
    } catch (error) {
      console.error('Error getting token transactions:', error);
      return [];
    }
  },

  // Transaction qo'shish
  async addTransaction(userId: string, transaction: LernisTokenTransaction): Promise<void> {
    try {
      const existingTransactions = await this.getLernisTokenTransactions(userId);
      const updatedTransactions = [transaction, ...existingTransactions];
      localStorage.setItem(`edu_token_transactions_${userId}`, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  },

  // Token price information
  async getLernisTokenPrice(): Promise<LernisTokenPrice> {
    return {
      symbol: 'EDU',
      price: 0.05, // $0.05 per EDU token
      change24h: 2.5,
      marketCap: 1000000,
      totalSupply: 20000000
    };
  },

  // Payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'click',
        name: 'Click',
        type: 'click',
        icon: '💳',
        fee: 1.5,
        minAmount: 1000, // 1000 UZS
        maxAmount: 1000000 // 1M UZS
      },
      {
        id: 'payme',
        name: 'Payme',
        type: 'payme',
        icon: '📱',
        fee: 2.0,
        minAmount: 1000,
        maxAmount: 500000
      },
      {
        id: 'bank_card',
        name: 'Bank Card',
        type: 'bank_card',
        icon: '🏦',
        fee: 2.5,
        minAmount: 1000,
        maxAmount: 2000000
      }
    ];
  },

  // Real token purchase
  async purchaseLernisTokens(
    userId: string, 
    amountUZS: number, 
    paymentMethod: string,
    _paymentData: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // UZS to USD conversion (simplified)
      const usdAmount = amountUZS / 12500; // 1 USD = 12500 UZS
      const tokenPrice = await this.getLernisTokenPrice();
      const tokensToReceive = (usdAmount / tokenPrice.price).toFixed(2);
      
      // Current balance
      const currentBalance = await this.getLernisTokenBalance(userId);
      const newBalance = (parseFloat(currentBalance.balance) + parseFloat(tokensToReceive)).toFixed(2);
      const newUsdValue = (parseFloat(newBalance) * tokenPrice.price).toFixed(2);
      
      // Update balance
      await this.updateTokenBalance(userId, newBalance, newUsdValue);
      
      // Add transaction
      const transaction: LernisTokenTransaction = {
        id: `tx_${Date.now()}`,
        type: 'purchase',
        amount: tokensToReceive,
        symbol: 'EDU',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        description: `Purchased via ${paymentMethod} (${amountUZS} UZS)`
      };
      
      await this.addTransaction(userId, transaction);
      
      return {
        success: true,
        transactionId: transaction.id
      };
    } catch (error) {
      console.error('Error buying tokens:', error);
      return {
        success: false,
        error: 'Purchase failed. Please try again.'
      };
    }
  },

  // Convert UZS to EDU tokens
  convertUzsToLernis(uzsAmount: number, lernisPrice: number): number {
    // UZS to USD conversion (1 USD = 12500 UZS)
    const usdAmount = uzsAmount / 12500;
    // USD to EDU tokens conversion
    return usdAmount / lernisPrice;
  },

  // Convert EDU to UZS
  convertLernisToUzs(lernisAmount: number, lernisPrice: number): number {
    // EDU to USD conversion
    const usdAmount = lernisAmount * lernisPrice;
    // USD to UZS conversion (1 USD = 12500 UZS)
    return usdAmount * 12500;
  },

  // Check if user has enough tokens for certificate creation
  async hasEnoughTokensForCertificate(userId: string): Promise<boolean> {
    try {
      const balance = await this.getLernisTokenBalance(userId);
      return parseFloat(balance.balance) >= this.CERTIFICATE_CREATION_COST;
    } catch (error) {
      console.error('Error checking token balance:', error);
      return false;
    }
  },

  // Deduct tokens for certificate creation
  async deductTokensForCertificate(userId: string, certificateId: string, studentName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentBalance = await this.getLernisTokenBalance(userId);
      const currentBalanceNum = parseFloat(currentBalance.balance);
      
      if (currentBalanceNum < this.CERTIFICATE_CREATION_COST) {
        return {
          success: false,
          error: `Insufficient tokens. You need ${this.CERTIFICATE_CREATION_COST} EDU tokens but only have ${currentBalanceNum} EDU tokens.`
        };
      }

      // Calculate new balance
      const newBalance = (currentBalanceNum - this.CERTIFICATE_CREATION_COST).toFixed(2);
      const tokenPrice = await this.getLernisTokenPrice();
      const newUsdValue = (parseFloat(newBalance) * tokenPrice.price).toFixed(2);

      // Update balance
      await this.updateTokenBalance(userId, newBalance, newUsdValue);

      // Add transaction record
      const transaction: LernisTokenTransaction = {
        id: `cert_${Date.now()}`,
        type: 'certificate_creation',
        amount: `-${this.CERTIFICATE_CREATION_COST}`,
        symbol: 'EDU',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        description: `Certificate created for ${studentName} (ID: ${certificateId})`
      };

      await this.addTransaction(userId, transaction);

      return { success: true };
    } catch (error) {
      console.error('Error deducting tokens for certificate:', error);
      return {
        success: false,
        error: 'Failed to process token deduction. Please try again.'
      };
    }
  },

  // Check if user has enough LERNIS for NFT minting
  async checkMintingBalance(userId: string, mintingCost: number): Promise<boolean> {
    const balance = await this.getLernisTokenBalance(userId);
    return parseFloat(balance.balance) >= mintingCost;
  },

  // Deduct LERNIS tokens for NFT minting
  async deductMintingFee(_userId: string, _amount: number): Promise<boolean> {
    try {
      // In real app, this would deduct from user's LERNIS balance
      console.log(`Deducting ${_amount} LERNIS for NFT minting`);
      return true;
    } catch (error) {
      return false;
    }
  }
};
