import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { ethers } from 'ethers';
import { z } from 'zod';
import { CreateUserSchema, LoginSchema } from '@edunft/shared';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { encryptData, generateIV, generateEncryptionKey } from '@edunft/shared';

const router = Router();
const prisma = new PrismaClient();

// Mock database for development
const mockUsers = [
  {
    id: '1',
    email: 'admin@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // admin123
    username: 'admin',
    role: UserRole.ADMIN,
    isVerified: true,
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'university@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // university123
    username: 'university',
    role: UserRole.UNIVERSITY,
    isVerified: true,
    walletAddress: '0x8ba1f109551bD432803012645Hac136c',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'student@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // student123
    username: 'student',
    role: UserRole.STUDENT,
    isVerified: true,
    walletAddress: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(),
  },
];

// Validation schemas
const registerSchema = CreateUserSchema;
const loginSchema = LoginSchema;

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, username, role } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists',
        code: 'USER_EXISTS',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create wallet
    const wallet = ethers.Wallet.createRandom();
    const encryptionKey = generateEncryptionKey();
    const iv = generateIV();
    const encryptedPrivateKey = await encryptData(
      wallet.privateKey,
      encryptionKey.toString('hex'),
      iv.toString('hex')
    );

    // Create user and wallet in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          username,
          role: role as UserRole,
        },
      });

      const walletRecord = await tx.wallet.create({
        data: {
          userId: user.id,
          address: wallet.address,
          encryptedPrivateKey: encryptedPrivateKey,
          iv: iv.toString('hex'),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { walletId: walletRecord.id },
      });

      return { user, wallet: walletRecord };
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: result.user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          role: result.user.role,
          walletAddress: result.wallet.address,
          isVerified: result.user.isVerified,
          createdAt: result.user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user in mock database
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify password (for demo, accept any password)
    const isValidPassword = password === 'admin123' || password === 'university123' || password === 'student123';
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET || 'dev-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          walletAddress: user.walletAddress,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = mockUsers.find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          walletAddress: user.walletAddress,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
