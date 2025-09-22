import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const approveRejectSchema = z.object({
  notes: z.string().optional(),
});

// Get all verification requests
router.get('/verification-requests', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = status ? { status: status as any } : {};

    const [requests, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        include: {
          organization: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.verificationRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Approve verification request
router.post('/verification-requests/:id/approve', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = approveRejectSchema.parse(req.body);

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!verificationRequest) {
      return res.status(404).json({
        success: false,
        error: 'Verification request not found',
        code: 'VERIFICATION_REQUEST_NOT_FOUND',
      });
    }

    if (verificationRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Verification request is not pending',
        code: 'INVALID_STATUS',
      });
    }

    // Update verification request and organization in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.verificationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          notes,
        },
      });

      const updatedOrganization = await tx.organization.update({
        where: { id: verificationRequest.orgId },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      return { updatedRequest, updatedOrganization };
    });

    // Log the approval action
    await prisma.auditLog.create({
      data: {
        event: 'ORGANIZATION_APPROVED',
        actorId: req.user!.id,
        details: {
          organizationId: verificationRequest.orgId,
          organizationName: verificationRequest.organization.name,
          notes,
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: {
        verificationRequest: result.updatedRequest,
        organization: result.updatedOrganization,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Reject verification request
router.post('/verification-requests/:id/reject', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = approveRejectSchema.parse(req.body);

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!verificationRequest) {
      return res.status(404).json({
        success: false,
        error: 'Verification request not found',
        code: 'VERIFICATION_REQUEST_NOT_FOUND',
      });
    }

    if (verificationRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Verification request is not pending',
        code: 'INVALID_STATUS',
      });
    }

    const updatedRequest = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes,
      },
    });

    // Log the rejection action
    await prisma.auditLog.create({
      data: {
        event: 'ORGANIZATION_REJECTED',
        actorId: req.user!.id,
        details: {
          organizationId: verificationRequest.orgId,
          organizationName: verificationRequest.organization.name,
          notes,
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: {
        verificationRequest: updatedRequest,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const where = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          wallet: true,
          organization: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats
router.get('/stats', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      verifiedOrganizations,
      totalCertificates,
      mintedCertificates,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.organization.count({ where: { verified: true } }),
      prisma.certificate.count(),
      prisma.certificate.count({ where: { status: 'MINTED' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrganizations,
          verifiedOrganizations,
          totalCertificates,
          mintedCertificates,
          pendingVerifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };
