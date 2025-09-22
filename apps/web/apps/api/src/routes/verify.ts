import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const router = Router();
const prisma = new PrismaClient();

// Verify certificate by token ID
router.get('/:tokenId', async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    // Find certificate by token ID
    const certificate = await prisma.certificate.findUnique({
      where: { tokenId: parseInt(tokenId) },
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

    // Verify on blockchain (mock for now)
    const isVerifiedOnChain = await verifyOnBlockchain(parseInt(tokenId));

    res.json({
      success: true,
      data: {
        certificate: {
          id: certificate.id,
          tokenId: certificate.tokenId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          issueDate: certificate.issueDate,
          ipfsCid: certificate.ipfsCid,
          metadataJson: certificate.metadataJson,
          status: certificate.status,
          qrCodeUrl: certificate.qrCodeUrl,
        },
        organization: {
          id: certificate.organization.id,
          name: certificate.organization.name,
          description: certificate.organization.description,
          website: certificate.organization.website,
          verified: certificate.organization.verified,
          verifiedAt: certificate.organization.verifiedAt,
          user: certificate.organization.user,
        },
        owner: certificate.ownerUser,
        verification: {
          isVerifiedOnChain,
          isOrganizationVerified: certificate.organization.verified,
          contractAddress: process.env.CONTRACT_ADDRESS,
          network: 'Mumbai Testnet',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify certificate by contract address and token ID
router.get('/:contractAddress/:tokenId', async (req, res, next) => {
  try {
    const { contractAddress, tokenId } = req.params;

    // Validate contract address
    if (!ethers.isAddress(contractAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contract address',
        code: 'INVALID_CONTRACT_ADDRESS',
      });
    }

    // Check if this is our contract
    if (contractAddress.toLowerCase() !== process.env.CONTRACT_ADDRESS?.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Certificate not issued by EduNFT',
        code: 'INVALID_CONTRACT',
      });
    }

    // Find certificate by token ID
    const certificate = await prisma.certificate.findUnique({
      where: { tokenId: parseInt(tokenId) },
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

    // Verify on blockchain
    const isVerifiedOnChain = await verifyOnBlockchain(parseInt(tokenId));

    res.json({
      success: true,
      data: {
        certificate: {
          id: certificate.id,
          tokenId: certificate.tokenId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          issueDate: certificate.issueDate,
          ipfsCid: certificate.ipfsCid,
          metadataJson: certificate.metadataJson,
          status: certificate.status,
          qrCodeUrl: certificate.qrCodeUrl,
        },
        organization: {
          id: certificate.organization.id,
          name: certificate.organization.name,
          description: certificate.organization.description,
          website: certificate.organization.website,
          verified: certificate.organization.verified,
          verifiedAt: certificate.organization.verifiedAt,
          user: certificate.organization.user,
        },
        owner: certificate.ownerUser,
        verification: {
          isVerifiedOnChain,
          isOrganizationVerified: certificate.organization.verified,
          contractAddress,
          network: 'Mumbai Testnet',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Mock function to verify certificate on blockchain
async function verifyOnBlockchain(tokenId: number): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Connect to the Mumbai testnet
    // 2. Get the contract instance
    // 3. Call the ownerOf function to verify the token exists
    // 4. Call the tokenURI function to get the metadata URI
    // 5. Verify the metadata matches our database record

    // For now, we'll return true if the certificate exists in our database
    const certificate = await prisma.certificate.findUnique({
      where: { tokenId },
    });

    return !!certificate && certificate.status === 'MINTED';
  } catch (error) {
    console.error('Blockchain verification error:', error);
    return false;
  }
}

export { router as verifyRoutes };
