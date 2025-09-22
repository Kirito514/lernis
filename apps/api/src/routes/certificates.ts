import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { uploadToIPFS, generateMetadata } from '../services/ipfs';
import { mintCertificate } from '../services/blockchain';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const createCertificateSchema = z.object({
  studentName: z.string().min(1).max(100),
  courseName: z.string().min(1).max(100),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  issueDate: z.string().datetime(),
});

// Mint certificate (only verified organizations)
router.post('/mint', requireAuth, requireRole([UserRole.UNIVERSITY, UserRole.TRAINING_CENTER]), async (req: AuthRequest, res, next) => {
  try {
    const { studentName, courseName, ownerAddress, issueDate } = createCertificateSchema.parse(req.body);

    // Check if user has a verified organization
    const organization = await prisma.organization.findFirst({
      where: {
        userId: req.user!.id,
        verified: true,
      },
    });

    if (!organization) {
      return res.status(403).json({
        success: false,
        error: 'Only verified organizations can mint certificates',
        code: 'ORGANIZATION_NOT_VERIFIED',
      });
    }

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        ownerUserId: req.user!.id, // This should be the student's user ID, but for now using the issuer
        orgId: organization.id,
        studentName,
        courseName,
        issueDate: new Date(issueDate),
        status: 'PENDING',
      },
    });

    try {
      // Generate metadata
      const metadata = generateMetadata({
        studentName,
        courseName,
        organizationName: organization.name,
        issueDate: new Date(issueDate),
        certificateId: certificate.id,
      });

      // Upload metadata to IPFS
      const ipfsCid = await uploadToIPFS(JSON.stringify(metadata));

      // Update certificate with IPFS CID
      await prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          ipfsCid,
          metadataJson: JSON.stringify(metadata),
        },
      });

      // Mint NFT (this would integrate with Biconomy for gasless transactions)
      const tokenId = await mintCertificate(ownerAddress, `ipfs://${ipfsCid}`, organization.id);

      // Update certificate with token ID
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          tokenId,
          status: 'MINTED',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          certificate: updatedCertificate,
          tokenId,
          ipfsUrl: `ipfs://${ipfsCid}`,
        },
      });
    } catch (mintError) {
      // Update certificate status to failed
      await prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          status: 'FAILED',
        },
      });

      throw mintError;
    }
  } catch (error) {
    next(error);
  }
});

// Get user's certificates
router.get('/my', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { ownerUserId: req.user!.id },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        certificates,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get organization's issued certificates
router.get('/issued', requireAuth, requireRole([UserRole.UNIVERSITY, UserRole.TRAINING_CENTER]), async (req: AuthRequest, res, next) => {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        userId: req.user!.id,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        code: 'ORGANIZATION_NOT_FOUND',
      });
    }

    const certificates = await prisma.certificate.findMany({
      where: { orgId: organization.id },
      include: {
        ownerUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        certificates,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get certificate by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true,
              },
            },
          },
        },
        ownerUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
        code: 'CERTIFICATE_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        certificate,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as certificateRoutes };
