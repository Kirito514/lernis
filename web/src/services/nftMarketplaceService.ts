// NFT Marketplace Service
import { lernisTokenService } from './lernisTokenService';
import { autoFirebaseService } from './autoFirebaseService';

export interface NFTTransaction {
  id: string;
  nftId: string;
  nftName: string;
  buyer: string;
  seller: string;
  price: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;
  type: 'purchase' | 'gift' | 'transfer';
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number; // in LERNIS tokens
  currency: 'LERNIS';
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  owner?: {
    id: string;
    name: string;
    avatar: string;
  };
  category: 'certificate' | 'achievement' | 'course' | 'badge' | 'collectible';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  mintedAt: string;
  tokenId?: string;
  contractAddress?: string;
  isListed: boolean;
  isOwned: boolean;
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  totalSupply: number;
  floorPrice: number;
  volume: number;
  nfts: NFT[];
}

export interface NFTCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface NFTSearchFilters {
  category?: string;
  rarity?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'price' | 'date' | 'rarity' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export const nftMarketplaceService = {
  // Get all NFTs
  async getNFTs(filters?: NFTSearchFilters): Promise<NFT[]> {
     // Simulate API call
     const mockNFTs: NFT[] = [
       // LEGENDARY NFTs (Eng qimmat va noyob)
       {
         id: '1',
         name: 'Blockchain Grandmaster Certificate',
         description: 'The ultimate certificate for mastering all aspects of blockchain technology. Only awarded to the most dedicated learners.',
         image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
         price: 500,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'certificate',
         rarity: 'legendary',
         attributes: [
           { trait_type: 'Mastery Level', value: 'Grandmaster' },
           { trait_type: 'Technologies', value: 'All Blockchain' },
           { trait_type: 'Rarity Score', value: 9999 }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '2',
         name: 'Crypto Trading Legend',
         description: 'Legendary status achieved by mastering advanced trading strategies and portfolio management across all major cryptocurrencies.',
         image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop',
         price: 450,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'achievement',
         rarity: 'legendary',
         attributes: [
           { trait_type: 'Trading Level', value: 'Legend' },
           { trait_type: 'Profit Rate', value: '500%+' },
           { trait_type: 'Years Active', value: 5 }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
         isListed: true,
         isOwned: false
       },
       
       // EPIC NFTs (Yuqori darajadagi)
       {
         id: '3',
         name: 'Smart Contract Expert',
         description: 'Expert-level certification in smart contract development with proven track record of secure and efficient code.',
         image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
         price: 200,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'certificate',
         rarity: 'epic',
         attributes: [
           { trait_type: 'Languages', value: 'Solidity, Rust' },
           { trait_type: 'Audits Passed', value: 15 },
           { trait_type: 'Gas Optimization', value: 'Expert' }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '4',
         name: 'DeFi Protocol Architect',
         description: 'Epic achievement for designing and implementing complex DeFi protocols that have been adopted by the community.',
         image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
         price: 180,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'badge',
         rarity: 'epic',
         attributes: [
           { trait_type: 'Protocols Built', value: 3 },
           { trait_type: 'TVL Managed', value: '$10M+' },
           { trait_type: 'Innovation Score', value: 100 }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '5',
         name: 'Metaverse Pioneer',
         description: 'Pioneer status in metaverse development, creating immersive virtual worlds and experiences.',
         image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
         price: 220,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'achievement',
         rarity: 'epic',
         attributes: [
           { trait_type: 'Virtual Worlds', value: 5 },
           { trait_type: 'Active Users', value: '10K+' },
           { trait_type: 'Technologies', value: 'Unity, Unreal' }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
         isListed: true,
         isOwned: false
       },
       
       // RARE NFTs (Orta daraja)
       {
         id: '6',
         name: 'DeFi Yield Farmer',
         description: 'Rare achievement for mastering yield farming strategies across multiple DeFi protocols.',
         image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
         price: 120,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'achievement',
         rarity: 'rare',
         attributes: [
           { trait_type: 'APY Achieved', value: '200%+' },
           { trait_type: 'Protocols Used', value: 10 },
           { trait_type: 'Risk Management', value: 'Advanced' }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '7',
         name: 'DAO Governance Leader',
         description: 'Rare badge for active participation and leadership in decentralized autonomous organization governance.',
         image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
         price: 100,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'badge',
         rarity: 'rare',
         attributes: [
           { trait_type: 'Proposals Created', value: 25 },
           { trait_type: 'Votes Cast', value: 100 },
           { trait_type: 'Community Score', value: 85 }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '8',
         name: 'Blockchain Developer',
         description: 'Rare certificate for completing comprehensive blockchain development training with practical projects.',
         image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
         price: 90,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'certificate',
         rarity: 'rare',
         attributes: [
           { trait_type: 'Projects Completed', value: 5 },
           { trait_type: 'Code Quality', value: 'High' },
           { trait_type: 'Peer Reviews', value: 'Excellent' }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
         isListed: true,
         isOwned: false
       },
       
       // COMMON NFTs (Boshlang'ich daraja)
       {
         id: '9',
         name: 'Crypto Basics Graduate',
         description: 'Common certificate for completing the fundamental cryptocurrency and blockchain basics course.',
         image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
         price: 30,
         currency: 'LERNIS',
         creator: {
           id: 'creator1',
           name: 'Lernis Academy',
           avatar: '/api/placeholder/40/40'
         },
         category: 'certificate',
         rarity: 'common',
         attributes: [
           { trait_type: 'Course Duration', value: '2 weeks' },
           { trait_type: 'Completion Rate', value: '95%' },
           { trait_type: 'Knowledge Level', value: 'Beginner' }
         ],
         mintedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
         isListed: true,
         isOwned: false
       },
       {
         id: '10',
         name: 'Digital Art Enthusiast',
         description: 'Common collectible for art lovers who appreciate the intersection of technology and creativity.',
         image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
         price: 40,
         currency: 'LERNIS',
         creator: {
           id: 'creator2',
           name: 'Digital Artists Collective',
           avatar: '/api/placeholder/40/40'
         },
         category: 'collectible',
         rarity: 'common',
         attributes: [
           { trait_type: 'Art Style', value: 'Digital Abstract' },
           { trait_type: 'Color Palette', value: 'Vibrant' },
           { trait_type: 'Inspiration', value: 'Blockchain' }
         ],
         mintedAt: new Date().toISOString(),
         isListed: true,
         isOwned: false
       }
     ];

    // Apply filters
    let filteredNFTs = mockNFTs;
    
    if (filters?.category) {
      filteredNFTs = filteredNFTs.filter(nft => nft.category === filters.category);
    }
    
    if (filters?.rarity) {
      filteredNFTs = filteredNFTs.filter(nft => nft.rarity === filters.rarity);
    }
    
    if (filters?.priceMin) {
      filteredNFTs = filteredNFTs.filter(nft => nft.price >= filters.priceMin!);
    }
    
    if (filters?.priceMax) {
      filteredNFTs = filteredNFTs.filter(nft => nft.price <= filters.priceMax!);
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredNFTs.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'date':
            aValue = new Date(a.mintedAt).getTime();
            bValue = new Date(b.mintedAt).getTime();
            break;
          case 'rarity':
            const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
            aValue = rarityOrder[a.rarity];
            bValue = rarityOrder[b.rarity];
            break;
          default:
            return 0;
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    return filteredNFTs;
  },

  // Get NFT categories
  async getCategories(): Promise<NFTCategory[]> {
    return [
      {
        id: 'certificate',
        name: 'Certificates',
        icon: '🎓',
        description: 'Educational certificates and diplomas',
        count: 45
      },
      {
        id: 'achievement',
        name: 'Achievements',
        icon: '🏆',
        description: 'Skill achievements and milestones',
        count: 32
      },
      {
        id: 'badge',
        name: 'Badges',
        icon: '🎖️',
        description: 'Specialized skill badges',
        count: 28
      },
      {
        id: 'course',
        name: 'Courses',
        icon: '📚',
        description: 'Course completion NFTs',
        count: 67
      },
      {
        id: 'collectible',
        name: 'Collectibles',
        icon: '🎨',
        description: 'Unique collectible items',
        count: 15
      }
    ];
  },

  // Get NFT collections
  async getCollections(): Promise<NFTCollection[]> {
    return [
      {
        id: '1',
        name: 'Lernis Academy Collection',
        description: 'Official NFTs from Lernis Academy',
        image: '/api/placeholder/400/400',
        creator: {
          id: 'creator1',
          name: 'Lernis Academy',
          avatar: '/api/placeholder/40/40'
        },
        totalSupply: 150,
        floorPrice: 25,
        volume: 5000,
        nfts: []
      }
    ];
  },

  // Get user's owned NFTs
  async getUserNFTs(userId: string): Promise<NFT[]> {
    try {
      // Firebase'dan owned NFT'larni olish
      const { nftOwnershipService } = await import('./firebaseService');
      const firebaseNFTs = await nftOwnershipService.getUserNFTs(userId);
      
      if (firebaseNFTs.length > 0) {
        return firebaseNFTs.map(nft => ({
          ...nft,
          owner: {
            id: nft.ownerId,
            name: 'You',
            avatar: '/api/placeholder/40/40'
          },
          isOwned: true
        }));
      }
      
      // Fallback to localStorage if Firebase fails
      const ownedNFTs = JSON.parse(localStorage.getItem(`owned_nfts_${userId}`) || '[]');
      
      // Also check for NFTs purchased or received through transactions
      const transactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');
      const allNFTs = await this.getNFTs();
      const transactionNFTs = transactions
        .filter((tx: NFTTransaction) => 
          (tx.type === 'purchase' || tx.type === 'gift') && 
          tx.status === 'completed' && 
          tx.buyer === userId
        )
        .map((tx: NFTTransaction) => {
          // Find the NFT details from the marketplace
          const nft = allNFTs.find(n => n.id === tx.nftId);
          if (nft) {
            return {
              ...nft,
              owner: {
                id: userId,
                name: 'You',
                avatar: '/api/placeholder/40/40'
              },
              isOwned: true,
              receivedAt: tx.timestamp,
              receivedFrom: tx.type === 'gift' ? tx.seller : undefined,
              giftMessage: tx.giftMessage
            };
          }
          return null;
        })
        .filter(Boolean);

      // Combine owned NFTs and transaction NFTs, removing duplicates
      const allOwnedNFTs = [...ownedNFTs, ...transactionNFTs];
      const uniqueNFTs = allOwnedNFTs.filter((nft, index, self) => 
        index === self.findIndex(n => n.id === nft.id)
      );

      return uniqueNFTs;
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  },

  // Purchase NFT
  async purchaseNFT(userId: string, nftId: string): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    try {
      // NFT ma'lumotlarini olish
      const nfts = await this.getNFTs();
      const nft = nfts.find(n => n.id === nftId);
      
      if (!nft) {
        return { success: false, error: 'NFT not found' };
      }
      
      // User'ning EDU token balansini tekshirish
      const userBalance = await lernisTokenService.getLernisTokenBalance(userId);
      
      if (parseFloat(userBalance.balance) < nft.price) {
        return { success: false, error: 'Insufficient EDU tokens' };
      }
      
      // EDU token balansini kamaytirish
      const newBalance = (parseFloat(userBalance.balance) - nft.price).toFixed(2);
      const newUsdValue = (parseFloat(newBalance) * 0.05).toFixed(2); // $0.05 per EDU
      
      await lernisTokenService.updateTokenBalance(userId, newBalance, newUsdValue);
      
      // NFT sotib olish transaction'ini qo'shish
      const transaction = {
        id: `nft_tx_${Date.now()}`,
        type: 'purchase' as const,
        amount: nft.price.toString(),
        symbol: 'EDU',
        timestamp: new Date().toISOString(),
        status: 'confirmed' as const,
        description: `Purchased NFT: ${nft.name}`
      };
      
      await lernisTokenService.addTransaction(userId, transaction);
      
      // NFT ownership'ni yangilash
      const updatedNFTs = nfts.map(n => 
        n.id === nftId ? { ...n, owner: userId, isOwned: true } : n
      );
      
      localStorage.setItem('marketplace_nfts', JSON.stringify(updatedNFTs));
      
      // Add to user's owned NFTs in Firebase (avtomatik sync)
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
        acquiredType: 'purchase',
        acquiredAt: new Date().toISOString(),
        action: 'add'
      };
      
      await autoFirebaseService.syncOnChange(userId, 'nft', ownershipData);
      
      // Fallback to localStorage
      const ownedNFTs = JSON.parse(localStorage.getItem(`owned_nfts_${userId}`) || '[]');
      const purchasedNFT = {
        ...nft,
        owner: {
          id: userId,
          name: 'You',
          avatar: '/api/placeholder/40/40'
        },
        isOwned: true,
        purchasedAt: new Date().toISOString()
      };
      ownedNFTs.push(purchasedNFT);
      localStorage.setItem(`owned_nfts_${userId}`, JSON.stringify(ownedNFTs));
      
      // NFT transaction'ini Firebase'ga saqlash (avtomatik sync)
      const nftTransactionData = {
        userId: userId,
        nftId: nftId,
        nftName: nft.name,
        buyer: userId,
        seller: typeof nft.owner === 'string' ? nft.owner : 'unknown',
        price: nft.price,
        status: 'completed',
        type: 'purchase'
      };
      
      await autoFirebaseService.syncOnChange(userId, 'transaction', nftTransactionData);
      
      // Fallback to localStorage
      const nftTransaction: NFTTransaction = {
        id: `nft_tx_${Date.now()}`,
        nftId: nftId,
        nftName: nft.name,
        buyer: userId,
        seller: typeof nft.owner === 'string' ? nft.owner : 'unknown',
        price: nft.price,
        timestamp: new Date().toISOString(),
        status: 'completed',
        type: 'purchase'
      };
      
      const existingTransactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');
      existingTransactions.unshift(nftTransaction);
      localStorage.setItem(`nft_transactions_${userId}`, JSON.stringify(existingTransactions));
      
      return { 
        success: true, 
        transactionId: transaction.id 
      };
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      return { success: false, error: 'Purchase failed' };
    }
  },

  // Mint NFT
  async mintNFT(
    userId: string,
    _name: string,
    _description: string,
    _image: string,
    _category: string,
    _attributes: { trait_type: string; value: string | number }[]
  ): Promise<{ success: boolean; nftId?: string; error?: string }> {
    try {
      // Simulate NFT minting
      console.log(`User ${userId} minting NFT: ${_name}`);
      
      // In real app, this would:
      // 1. Check user has enough LERNIS for minting fee
      // 2. Create NFT metadata
      // 3. Mint NFT on blockchain
      // 4. Deduct minting fee
      
      return { 
        success: true, 
        nftId: `nft_${Date.now()}` 
      };
    } catch (error) {
      return { success: false, error: 'Minting failed' };
    }
  },

  // List NFT for sale
  async listNFT(userId: string, nftId: string, price: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`User ${userId} listing NFT ${nftId} for ${price} LERNIS`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Listing failed' };
    }
  },

  // Gift NFT to another user
  async giftNFT(
    senderId: string, 
    nftId: string, 
    recipientId: string, 
    giftMessage?: string
  ): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    try {
      // Import user search service
      const { userSearchService } = await import('./userSearchService');
      
      // Validate recipient
      const recipientValidation = await userSearchService.validateUser(recipientId);
      if (!recipientValidation.isValid) {
        return { success: false, error: recipientValidation.error || 'Invalid recipient' };
      }
      
      const recipient = recipientValidation.user!;
      
      // Get NFT details
      const nfts = await this.getNFTs();
      const nft = nfts.find(n => n.id === nftId);
      
      if (!nft) {
        return { success: false, error: 'NFT not found' };
      }
      
      // Check if sender has enough EDU tokens
      const senderBalance = await lernisTokenService.getLernisTokenBalance(senderId);
      
      if (parseFloat(senderBalance.balance) < nft.price) {
        return { success: false, error: 'Insufficient EDU tokens' };
      }
      
      // Deduct tokens from sender
      const newBalance = (parseFloat(senderBalance.balance) - nft.price).toFixed(2);
      const newUsdValue = (parseFloat(newBalance) * 0.05).toFixed(2);
      
      await lernisTokenService.updateTokenBalance(senderId, newBalance, newUsdValue);
      
      // Add transaction record for sender
      const senderTransaction = {
        id: `nft_gift_${Date.now()}`,
        type: 'gift' as const,
        amount: `-${nft.price}`,
        symbol: 'EDU',
        timestamp: new Date().toISOString(),
        status: 'confirmed' as const,
        description: `Gifted NFT: ${nft.name} to ${recipient.displayName}`
      };
      
      await lernisTokenService.addTransaction(senderId, senderTransaction);
      
      // Create NFT gift transaction
      const nftGiftTransaction: NFTTransaction = {
        id: `nft_gift_${Date.now()}`,
        nftId: nftId,
        nftName: nft.name,
        buyer: senderId,
        seller: typeof nft.owner === 'string' ? nft.owner : 'marketplace',
        price: nft.price,
        timestamp: new Date().toISOString(),
        status: 'completed',
        type: 'gift',
        recipientId: recipient.id,
        recipientName: recipient.displayName,
        recipientEmail: recipient.email,
        giftMessage: giftMessage
      };
      
      // Save gift transaction for sender in Firebase (avtomatik sync)
      const senderTransactionData = {
        userId: senderId,
        nftId: nftId,
        nftName: nft.name,
        buyer: senderId,
        seller: typeof nft.owner === 'string' ? nft.owner : 'marketplace',
        price: nft.price,
        status: 'completed',
        type: 'gift',
        recipientId: recipient.id,
        recipientName: recipient.displayName,
        recipientEmail: recipient.email,
        giftMessage: giftMessage
      };
      
      await autoFirebaseService.syncOnChange(senderId, 'transaction', senderTransactionData);
      
      // Save gift transaction for recipient in Firebase (avtomatik sync)
      const recipientTransactionData = {
        userId: recipientId,
        nftId: nftId,
        nftName: nft.name,
        buyer: recipientId,
        seller: senderId,
        price: nft.price,
        status: 'completed',
        type: 'gift',
        receivedFrom: senderId,
        giftMessage: giftMessage
      };
      
      await autoFirebaseService.syncOnChange(recipientId, 'transaction', recipientTransactionData);
      
      // Fallback to localStorage
      const senderTransactions = JSON.parse(localStorage.getItem(`nft_transactions_${senderId}`) || '[]');
      senderTransactions.unshift(nftGiftTransaction);
      localStorage.setItem(`nft_transactions_${senderId}`, JSON.stringify(senderTransactions));
      
      const recipientTransactions = JSON.parse(localStorage.getItem(`nft_transactions_${recipientId}`) || '[]');
      const recipientGiftTransaction = {
        ...nftGiftTransaction,
        id: `nft_received_${Date.now()}`,
        buyer: recipientId,
        seller: senderId
      };
      recipientTransactions.unshift(recipientGiftTransaction);
      localStorage.setItem(`nft_transactions_${recipientId}`, JSON.stringify(recipientTransactions));
      
      // Update NFT ownership
      const updatedNFTs = nfts.map(n => 
        n.id === nftId ? { 
          ...n, 
          owner: {
            id: recipientId,
            name: recipient.displayName,
            avatar: recipient.avatar || '/api/placeholder/40/40'
          },
          isOwned: true 
        } : n
      );
      
      localStorage.setItem('marketplace_nfts', JSON.stringify(updatedNFTs));
      
      // Remove from sender's owned NFTs in Firebase (avtomatik sync)
      await autoFirebaseService.syncOnChange(senderId, 'nft', {
        action: 'remove',
        nftId: nftId
      });
      
      // Add to recipient's owned NFTs in Firebase (avtomatik sync)
      const recipientOwnershipData = {
        nftId: nft.id,
        ownerId: recipientId,
        nftName: nft.name,
        nftDescription: nft.description,
        nftImage: nft.image,
        nftPrice: nft.price,
        nftCategory: nft.category,
        nftRarity: nft.rarity,
        nftAttributes: nft.attributes,
        nftCreator: nft.creator,
        acquiredType: 'gift',
        acquiredAt: new Date().toISOString(),
        receivedFrom: senderId,
        giftMessage: giftMessage,
        action: 'add'
      };
      
      await autoFirebaseService.syncOnChange(recipientId, 'nft', recipientOwnershipData);
      
      // Fallback to localStorage
      const senderOwnedNFTs = JSON.parse(localStorage.getItem(`owned_nfts_${senderId}`) || '[]');
      const updatedSenderNFTs = senderOwnedNFTs.filter((ownedNFT: any) => ownedNFT.id !== nftId);
      localStorage.setItem(`owned_nfts_${senderId}`, JSON.stringify(updatedSenderNFTs));
      
      const recipientOwnedNFTs = JSON.parse(localStorage.getItem(`owned_nfts_${recipientId}`) || '[]');
      recipientOwnedNFTs.push({
        ...nft,
        owner: {
          id: recipientId,
          name: recipient.displayName,
          avatar: recipient.avatar || '/api/placeholder/40/40'
        },
        isOwned: true,
        receivedAt: new Date().toISOString(),
        receivedFrom: senderId,
        giftMessage: giftMessage
      });
      localStorage.setItem(`owned_nfts_${recipientId}`, JSON.stringify(recipientOwnedNFTs));
      
      return { 
        success: true, 
        transactionId: nftGiftTransaction.id 
      };
    } catch (error) {
      console.error('Error gifting NFT:', error);
      return { success: false, error: 'Gift failed' };
    }
  },

  // Get user's received gifts
  async getUserReceivedGifts(userId: string): Promise<NFTTransaction[]> {
    try {
      // Firebase'dan received gifts'ni olish
      const { nftTransactionService } = await import('./firebaseService');
      const firebaseTransactions = await nftTransactionService.getNFTTransactions(userId);
      const receivedGifts = firebaseTransactions.filter(tx => 
        tx.type === 'gift' && tx.buyer === userId && tx.seller !== userId
      );
      
      if (receivedGifts.length > 0) {
        return receivedGifts;
      }
      
      // Fallback to localStorage
      const transactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');
      return transactions.filter((tx: NFTTransaction) => 
        tx.type === 'gift' && tx.buyer === userId
      );
    } catch (error) {
      console.error('Error getting received gifts:', error);
      return [];
    }
  },

  // Get user's sent gifts
  async getUserSentGifts(userId: string): Promise<NFTTransaction[]> {
    try {
      // Firebase'dan sent gifts'ni olish
      const { nftTransactionService } = await import('./firebaseService');
      const firebaseTransactions = await nftTransactionService.getNFTTransactions(userId);
      const sentGifts = firebaseTransactions.filter(tx => 
        tx.type === 'gift' && tx.buyer === userId
      );
      
      if (sentGifts.length > 0) {
        return sentGifts;
      }
      
      // Fallback to localStorage
      const transactions = JSON.parse(localStorage.getItem(`nft_transactions_${userId}`) || '[]');
      return transactions.filter((tx: NFTTransaction) => 
        tx.type === 'gift' && tx.seller === userId
      );
    } catch (error) {
      console.error('Error getting sent gifts:', error);
      return [];
    }
  },

  // Get minting cost
  getMintingCost(): number {
    return 10; // 10 LERNIS tokens
  }
};
