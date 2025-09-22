import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        wallet: true,
        organization: true,
        ownedCertificates: {
          include: {
            organization: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

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
          walletAddress: user.wallet?.address,
          isVerified: user.isVerified,
          organization: user.organization,
          certificates: user.ownedCertificates,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by username (public profile)
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        organization: true,
        ownedCertificates: {
          where: {
            status: 'MINTED',
          },
          include: {
            organization: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

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
          username: user.username,
          role: user.role,
          organization: user.organization,
          certificates: user.ownedCertificates,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { username } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: req.user!.id },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken',
          code: 'USERNAME_TAKEN',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(username && { username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
