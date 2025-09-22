import { z } from 'zod';

// User roles
export enum UserRole {
  STUDENT = 'STUDENT',
  UNIVERSITY = 'UNIVERSITY',
  TRAINING_CENTER = 'TRAINING_CENTER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

// Verification request status
export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Certificate status
export enum CertificateStatus {
  PENDING = 'PENDING',
  MINTED = 'MINTED',
  FAILED = 'FAILED',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  walletId?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Organization types
export interface Organization {
  id: string;
  userId: string;
  name: string;
  description?: string;
  website?: string;
  documents: string[];
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  website?: string;
  documents: string[];
}

export interface VerificationRequest {
  id: string;
  orgId: string;
  status: VerificationStatus;
  notes?: string;
  uploadedFiles: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Certificate types
export interface Certificate {
  id: string;
  tokenId?: number;
  ownerUserId: string;
  orgId: string;
  studentName: string;
  courseName: string;
  issueDate: Date;
  ipfsCid?: string;
  metadataJson?: string;
  status: CertificateStatus;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificateRequest {
  studentName: string;
  courseName: string;
  ownerAddress: string;
  issueDate: string;
  pdfFile?: string;
}

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url: string;
  background_color: string;
}

// Wallet types
export interface Wallet {
  id: string;
  address: string;
  encryptedPrivateKey: string;
  iv: string;
  createdAt: Date;
}

export interface WalletExportRequest {
  otp: string;
}

// Validation schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(50),
  role: z.nativeEnum(UserRole),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  website: z.string().url().optional(),
});

export const CreateCertificateSchema = z.object({
  studentName: z.string().min(1).max(100),
  courseName: z.string().min(1).max(100),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  issueDate: z.string().datetime(),
});

export const WalletExportSchema = z.object({
  otp: z.string().length(6),
});

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}
