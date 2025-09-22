import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  website: z.string().url().optional(),
});

// Create organization
router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, description, website } = createOrganizationSchema.parse(req.body);

    // Check if user already has an organization
    const existingOrg = await prisma.organization.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: 'User already has an organization',
        code: 'ORGANIZATION_EXISTS',
      });
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        userId: req.user!.id,
        name,
        description,
        website,
      },
    });

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        orgId: organization.id,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        organization,
        verificationRequest,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's organization
router.get('/my', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: req.user!.id },
      include: {
        verificationRequest: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        certificates: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get organization by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        certificates: {
          where: {
            status: 'MINTED',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update organization
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, website } = createOrganizationSchema.parse(req.body);

    // Check if user owns this organization
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found or access denied',
        code: 'ORGANIZATION_NOT_FOUND',
      });
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
        website,
      },
    });

    res.json({
      success: true,
      data: {
        organization: updatedOrganization,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Upload organization documents
router.post('/:id/documents', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { documents } = req.body; // Array of file URLs

    // Check if user owns this organization
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found or access denied',
        code: 'ORGANIZATION_NOT_FOUND',
      });
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        documents: {
          push: documents,
        },
      },
    });

    res.json({
      success: true,
      data: {
        organization: updatedOrganization,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as organizationRoutes };
