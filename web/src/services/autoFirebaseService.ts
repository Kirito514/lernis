// Auto Firebase Service - Avtomatik ravishda barcha ma'lumotlarni Firebase'ga saqlash

export interface AutoSyncResult {
  success: boolean;
  message: string;
  syncedData?: {
    tokenBalance: boolean;
    nftOwnership: number;
    nftTransactions: number;
  };
}

export const autoFirebaseService = {
  // User login bo'lganda avtomatik sync qilish
  async autoSyncOnLogin(userId: string): Promise<AutoSyncResult> {
    try {
      console.log('Auto-syncing data for user:', userId);
      
      const results = {
        tokenBalance: false,
        nftOwnership: 0,
        nftTransactions: 0
      };

      // 1. Token balance'ni avtomatik sync qilish
      const tokenSyncResult = await this.syncTokenBalance(userId);
      if (tokenSyncResult.success) {
        results.tokenBalance = true;
      }

      // 2. NFT ownership'ni avtomatik sync qilish
      const nftOwnershipResult = await this.syncNFTOwnership(userId);
      if (nftOwnershipResult.success) {
        results.nftOwnership = nftOwnershipResult.count || 0;
      }

      // 3. NFT transactions'ni avtomatik sync qilish
      const nftTransactionsResult = await this.syncNFTTransactions(userId);
      if (nftTransactionsResult.success) {
        results.nftTransactions = nftTransactionsResult.count || 0;
      }

      return {
        success: true,
        message: 'Auto-sync completed successfully',
        syncedData: results
      };
    } catch (error) {
      console.error('Auto-sync failed:', error);
      return {
        success: false,
        message: 'Auto-sync failed: ' + (error as Error).message
      };
    }
  },

  // Token balance'ni avtomatik sync qilish
  async syncTokenBalance(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { tokenBalanceService } = await import('./firebaseService');
      
      // Firebase'dan token balance'ni olish
      const firebaseBalance = await tokenBalanceService.getTokenBalance(userId);
      
      // Agar Firebase'da ma'lumot yo'q bo'lsa, localStorage'dan olish va saqlash
      if (!firebaseBalance || firebaseBalance.balance === '100.00') {
        const storedBalance = localStorage.getItem(`edu_token_balance_${userId}`);
        if (storedBalance) {
          const balance = JSON.parse(storedBalance);
          const success = await tokenBalanceService.updateTokenBalance(
            userId, 
            balance.balance, 
            balance.usdValue
          );
          
          if (success) {
            return { success: true, message: 'Token balance synced to Firebase' };
          }
        }
      }
      
      return { success: true, message: 'Token balance already synced' };
    } catch (error) {
      console.error('Token balance sync failed:', error);
      return { success: false, message: 'Token balance sync failed' };
    }
  },

  // NFT ownership'ni avtomatik sync qilish
  async syncNFTOwnership(userId: string): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const { nftOwnershipService } = await import('./firebaseService');
      
      // Firebase'dan owned NFT'larni olish
      const firebaseNFTs = await nftOwnershipService.getUserNFTs(userId);
      
      // Agar Firebase'da ma'lumot yo'q bo'lsa, localStorage'dan olish va saqlash
      if (firebaseNFTs.length === 0) {
        const ownedNFTs = JSON.parse(localStorage.getItem(`owned_nfts_${userId}`) || '[]');
        
        if (ownedNFTs.length > 0) {
          let syncedCount = 0;
          
          for (const nft of ownedNFTs) {
            const ownershipData = {
              nftId: nft.id,
              ownerId: userId,
              nftName: nft.name,
              nftDescription: nft.description,
              nftImage: nft.image,
              nftPrice: nft.price,
              nftCategory: nft.category,
              nftRarity: nft.rarity,
              nftAttributes: nft.attributes,
              nftCreator: nft.creator,
              acquiredType: nft.purchasedAt ? 'purchase' : 'gift',
              acquiredAt: nft.purchasedAt || nft.receivedAt || new Date().toISOString(),
              receivedFrom: nft.receivedFrom,
              giftMessage: nft.giftMessage
            };
            
            const result = await nftOwnershipService.addNFTOwnership(ownershipData);
            if (result) {
              syncedCount++;
            }
          }
          
          return { 
            success: true, 
            message: `Synced ${syncedCount} NFTs to Firebase`,
            count: syncedCount
          };
        }
      }
      
      return { success: true, message: 'NFT ownership already synced', count: firebaseNFTs.length };
    } catch (error) {
      console.error('NFT ownership sync failed:', error);
      return { success: false, message: 'NFT ownership sync failed' };
    }
  },

  // NFT transactions'ni avtomatik sync qilish
  async syncNFTTransactions(userId: string): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const { nftTransactionService } = await import('./firebaseService');
      
      // Firebase'dan NFT transactions'ni olish
      const firebaseTransactions = await nftTransactionService.getNFTTransactions(userId);
      
      // Agar Firebase'da ma'lumot yo'q bo'lsa, localStorage'dan olish va saqlash
      if (firebaseTransactions.length === 0) {
        const transactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');
        
        if (transactions.length > 0) {
          let syncedCount = 0;
          
          for (const tx of transactions) {
            const transactionData = {
              userId: userId,
              nftId: tx.nftId,
              nftName: tx.nftName,
              buyer: tx.buyer,
              seller: tx.seller,
              price: tx.price,
              status: tx.status,
              type: tx.type,
              recipientId: tx.recipientId,
              recipientName: tx.recipientName,
              recipientEmail: tx.recipientEmail,
              giftMessage: tx.giftMessage,
              receivedFrom: tx.receivedFrom
            };
            
            const result = await nftTransactionService.addNFTTransaction(transactionData);
            if (result) {
              syncedCount++;
            }
          }
          
          return { 
            success: true, 
            message: `Synced ${syncedCount} transactions to Firebase`,
            count: syncedCount
          };
        }
      }
      
      return { success: true, message: 'NFT transactions already synced', count: firebaseTransactions.length };
    } catch (error) {
      console.error('NFT transactions sync failed:', error);
      return { success: false, message: 'NFT transactions sync failed' };
    }
  },

  // Real-time sync - har bir o'zgarishda Firebase'ga saqlash
  async syncOnChange(userId: string, dataType: 'token' | 'nft' | 'transaction', data: any): Promise<boolean> {
    try {
      switch (dataType) {
        case 'token':
          const { tokenBalanceService } = await import('./firebaseService');
          return await tokenBalanceService.updateTokenBalance(userId, data.balance, data.usdValue);
          
        case 'nft':
          const { nftOwnershipService } = await import('./firebaseService');
          if (data.action === 'add') {
            await nftOwnershipService.addNFTOwnership(data);
            return true;
          } else if (data.action === 'remove') {
            return await nftOwnershipService.removeNFTOwnership(userId, data.nftId);
          }
          return false;
          
        case 'transaction':
          const { nftTransactionService } = await import('./firebaseService');
          await nftTransactionService.addNFTTransaction(data);
          return true;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Real-time sync failed:', error);
      return false;
    }
  },

  // Background sync - har 5 daqiqada bir marta sync qilish
  async startBackgroundSync(userId: string): Promise<void> {
    try {
      // Har 5 daqiqada bir marta sync qilish
      setInterval(async () => {
        await this.autoSyncOnLogin(userId);
      }, 5 * 60 * 1000); // 5 minutes
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
};

