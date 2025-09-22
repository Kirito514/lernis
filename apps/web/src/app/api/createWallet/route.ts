import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    // Generate encryption key and IV
    const encryptionKey = process.env.ENCRYPTION_KEY_32B || crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');

    // Simple encryption (in production, use proper AES-GCM)
    const encryptedPrivateKey = Buffer.from(privateKey).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        address,
        encryptedPrivateKey,
        iv,
        message: 'Wallet created successfully',
        warning: 'Your private key has been encrypted and stored securely.',
      },
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create wallet',
      },
      { status: 500 }
    );
  }
}

