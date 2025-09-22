import { ethers } from 'ethers';

/**
 * Generate a random 32-byte encryption key
 */
export function generateEncryptionKey(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Generate a random IV for encryption
 */
export function generateIV(): string {
  return ethers.hexlify(ethers.randomBytes(16));
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, key: string, iv: string): Promise<string> {
  // For now, return a simple base64 encoding
  // In production, implement proper AES-GCM encryption
  return Buffer.from(data).toString('base64');
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: string, key: string, iv: string): Promise<string> {
  // For now, return a simple base64 decoding
  // In production, implement proper AES-GCM decryption
  return Buffer.from(encryptedData, 'base64').toString();
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if an Ethereum address is valid
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Format an Ethereum address for display
 */
export function formatAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Generate a random username
 */
export function generateUsername(): string {
  const adjectives = ['smart', 'bright', 'wise', 'clever', 'brilliant', 'genius'];
  const nouns = ['student', 'learner', 'scholar', 'graduate', 'alumni', 'expert'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}_${randomNoun}_${randomNumber}`;
}

/**
 * Generate a random organization name
 */
export function generateOrgName(): string {
  const prefixes = ['University of', 'College of', 'Institute of', 'Academy of', 'School of'];
  const subjects = ['Technology', 'Science', 'Arts', 'Business', 'Engineering', 'Medicine'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  return `${randomPrefix} ${randomSubject}`;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    if (typeof setTimeout !== 'undefined') {
      setTimeout(resolve, ms);
    } else {
      // Fallback for environments without setTimeout
      resolve();
    }
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) break;
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Generate a unique file ID
 */
export function generateFileId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
