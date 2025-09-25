import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
// import '../types/ethereum';

// Wallet interface
export interface WalletData {
  address: string;
  privateKey: string; // Shifrlangan
  publicKey: string;
  mnemonic?: string; // Shifrlangan
  createdAt: string;
  userId: string;
}

// Wallet balance interface
export interface WalletBalance {
  matic: string;
  usd: string;
  tokens: Array<{
    symbol: string;
    balance: string;
    usdValue: string;
  }>;
}

// Wallet transaction interface
export interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'send' | 'receive' | 'mint' | 'burn';
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
}

class WalletService {
  private readonly ENCRYPTION_KEY = 'lernis-wallet-encryption-key-2024'; // Production'da environment variable'dan olinadi

  /**
   * Yangi wallet yaratish
   */
  async createWallet(userId: string): Promise<WalletData> {
    try {
      // Random wallet yaratish
      const wallet = ethers.Wallet.createRandom();
      
      // Private key va mnemonic'ni shifrlash
      const encryptedPrivateKey = this.encryptData(wallet.privateKey);
      const encryptedMnemonic = wallet.mnemonic ? this.encryptData(wallet.mnemonic.phrase) : undefined;

      const walletData: WalletData = {
        address: wallet.address,
        privateKey: encryptedPrivateKey,
        publicKey: wallet.publicKey,
        mnemonic: encryptedMnemonic,
        createdAt: new Date().toISOString(),
        userId: userId
      };

      return walletData;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Ma'lumotlarni shifrlash
   */
  private encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Ma'lumotlarni shifrdan ochish
   */
  private decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Wallet balansini olish (real blockchain data)
   */
  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      // MetaMask yoki Web3 provider'ni tekshirish
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // Polygon network'ni tekshirish
        const network = await provider.getNetwork();
        if (network.chainId !== 137n) { // Polygon mainnet
          console.warn('Please switch to Polygon network');
          return {
            matic: '0',
            usd: '0.00',
            tokens: []
          };
        }

        // MATIC balance olish
        const balance = await provider.getBalance(address);
        const maticBalance = ethers.formatEther(balance);
        
        // USD qiymatini hisoblash (simplified - real API kerak)
        const maticPrice = 0.5; // Real price API'dan olinadi
        const usdValue = (parseFloat(maticBalance) * maticPrice).toFixed(2);

        return {
          matic: parseFloat(maticBalance).toFixed(4),
          usd: usdValue,
          tokens: [
            {
              symbol: 'MATIC',
              balance: parseFloat(maticBalance).toFixed(4),
              usdValue: usdValue
            }
          ]
        };
      } else {
        // MetaMask yo'q bo'lsa, demo data qaytarish
        console.warn('MetaMask not detected, showing demo data');
        return {
          matic: '0.0000',
          usd: '0.00',
          tokens: []
        };
      }
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return {
        matic: '0',
        usd: '0.00',
        tokens: []
      };
    }
  }

  /**
   * Wallet tranzaksiyalarini olish (simulated)
   */
  async getWalletTransactions(address: string): Promise<WalletTransaction[]> {
    try {
      // Bu yerda haqiqiy blockchain'dan tranzaksiyalar olinadi
      // Hozircha simulated data qaytaramiz
      return [
        {
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          from: '0x0000000000000000000000000000000000000000',
          to: address,
          value: '0.1',
          timestamp: Date.now() - 86400000, // 1 kun oldin
          type: 'mint',
          status: 'confirmed',
          gasUsed: '21000',
          gasPrice: '30000000000'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef12',
          from: address,
          to: '0x1111111111111111111111111111111111111111',
          value: '0.05',
          timestamp: Date.now() - 172800000, // 2 kun oldin
          type: 'send',
          status: 'confirmed',
          gasUsed: '21000',
          gasPrice: '30000000000'
        }
      ];
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      throw new Error('Failed to get wallet transactions');
    }
  }

  /**
   * Wallet eksport qilish (private key va mnemonic)
   */
  async exportWallet(walletData: WalletData, password: string): Promise<{
    privateKey: string;
    mnemonic?: string;
  }> {
    try {
      // Password verification (bu yerda haqiqiy verification qilinadi)
      if (!password) {
        throw new Error('Password is required');
      }

      // Shifrdan ochish
      const privateKey = this.decryptData(walletData.privateKey);
      const mnemonic = walletData.mnemonic ? this.decryptData(walletData.mnemonic) : undefined;

      return {
        privateKey,
        mnemonic
      };
    } catch (error) {
      console.error('Error exporting wallet:', error);
      throw new Error('Failed to export wallet');
    }
  }

  /**
   * Wallet import qilish (private key yoki mnemonic orqali)
   */
  async importWallet(privateKeyOrMnemonic: string, userId: string): Promise<WalletData> {
    try {
      let wallet: any;

      // Private key yoki mnemonic ekanligini tekshirish
      if (privateKeyOrMnemonic.startsWith('0x')) {
        // Private key
        wallet = new ethers.Wallet(privateKeyOrMnemonic);
      } else {
        // Mnemonic
        wallet = ethers.Wallet.fromPhrase(privateKeyOrMnemonic);
      }

      // Shifrlash
      const encryptedPrivateKey = this.encryptData(wallet.privateKey);
      const encryptedMnemonic = wallet.mnemonic ? this.encryptData(wallet.mnemonic.phrase) : undefined;

      const walletData: WalletData = {
        address: wallet.address,
        privateKey: encryptedPrivateKey,
        publicKey: wallet.publicKey,
        mnemonic: encryptedMnemonic,
        createdAt: new Date().toISOString(),
        userId: userId
      };

      return walletData;
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Failed to import wallet');
    }
  }

  /**
   * Wallet adresini validate qilish
   */
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Private key'ni validate qilish
   */
  isValidPrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mnemonic'ni validate qilish
   */
  isValidMnemonic(mnemonic: string): boolean {
    try {
      ethers.Wallet.fromPhrase(mnemonic);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const walletService = new WalletService();

