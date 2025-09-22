import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateOTP, decryptData } from '@edunft/shared';
import { sendOTPEmail } from '../services/email';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const exportWalletSchema = z.object({
  otp: z.string().length(6),
});

// Request OTP for wallet export
router.post('/export', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        code: 'WALLET_NOT_FOUND',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP via email (in production, use real email service)
    await sendOTPEmail(user.email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email address',
    });
  } catch (error) {
    next(error);
  }
});

// Confirm OTP and export wallet
router.post('/export/confirm', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { otp } = exportWalletSchema.parse(req.body);

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId: req.user!.id,
        code: otp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
        code: 'INVALID_OTP',
      });
    }

    // Get user's wallet
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        code: 'WALLET_NOT_FOUND',
      });
    }

    // Decrypt private key
    const privateKey = await decryptData(
      user.wallet.encryptedPrivateKey,
      process.env.ENCRYPTION_KEY_32B!,
      user.wallet.iv
    );

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Log the export action
    await prisma.auditLog.create({
      data: {
        event: 'WALLET_EXPORTED',
        actorId: req.user!.id,
        details: {
          walletAddress: user.wallet.address,
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: {
        address: user.wallet.address,
        privateKey,
        warning: 'Keep your private key secure and never share it with anyone. Anyone with access to this private key can control your wallet.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get wallet balance
router.get('/balance', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        code: 'WALLET_NOT_FOUND',
      });
    }

    // In a real implementation, you would fetch the balance from the blockchain
    // For now, we'll return a mock balance
    const balance = '0.0'; // This would be fetched from Mumbai testnet

    res.json({
      success: true,
      data: {
        address: user.wallet.address,
        balance,
        network: 'Mumbai Testnet',
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as walletRoutes };
