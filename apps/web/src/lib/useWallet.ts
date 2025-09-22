import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  smartAccountAddress: string | null;
  isGaslessEnabled: boolean;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    isLoading: false,
    error: null,
    smartAccountAddress: null,
    isGaslessEnabled: false,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.ethereum &&
      (window.ethereum.isMetaMask || 
       window.ethereum.providers?.some((provider: any) => provider.isMetaMask) ||
       typeof window.ethereum.request === 'function')
    );
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }

      const address = accounts[0];
      
      // Get balance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      // Mock gasless minting setup
      const signer = await provider.getSigner();
      const smartAccountAddress = '0x' + Math.random().toString(16).substr(2, 40);

      setWalletState({
        address,
        balance: balanceInEth,
        isConnected: true,
        isLoading: false,
        error: null,
        smartAccountAddress,
        isGaslessEnabled: true,
      });

      return true;
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet',
      }));
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletState({
      address: null,
      balance: null,
      isConnected: false,
      isLoading: false,
      error: null,
      smartAccountAddress: null,
      isGaslessEnabled: false,
    });
  };

  // Get wallet info
  const getWalletInfo = async () => {
    if (!isMetaMaskInstalled() || !walletState.isConnected) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletState.address!);
      const balanceInEth = ethers.formatEther(balance);

      setWalletState(prev => ({
        ...prev,
        balance: balanceInEth,
      }));

      return {
        address: walletState.address,
        balance: balanceInEth,
        smartAccountAddress: walletState.smartAccountAddress,
        isGaslessEnabled: walletState.isGaslessEnabled,
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return null;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Mock gasless minting functions
  const mintCertificate = async (contractAddress: string, recipientAddress: string, tokenURI: string) => {
    if (!walletState.isGaslessEnabled) {
      throw new Error('Gasless minting not enabled');
    }
    
    // Mock gasless minting
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    return {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      userOpHash: '0x' + Math.random().toString(16).substr(2, 64),
      gasless: true,
      tokenId: Math.floor(Math.random() * 1000000)
    };
  };

  const transferCertificate = async (contractAddress: string, from: string, to: string, tokenId: number) => {
    if (!walletState.isGaslessEnabled) {
      throw new Error('Gasless minting not enabled');
    }
    
    // Mock gasless transfer
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    return {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      userOpHash: '0x' + Math.random().toString(16).substr(2, 64),
      gasless: true
    };
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getWalletInfo,
    isMetaMaskInstalled,
    mintCertificate,
    transferCertificate,
    setWalletState,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
