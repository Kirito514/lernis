import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import { encryptData, generateIV, generateEncryptionKey } from '@edunft/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminWallet = ethers.Wallet.createRandom();
  const adminEncryptionKey = generateEncryptionKey();
  const adminIv = generateIV();
  const adminEncryptedPrivateKey = await encryptData(
    adminWallet.privateKey,
    adminEncryptionKey.toString('hex'),
    adminIv.toString('hex')
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edunft.io' },
    update: {},
    create: {
      email: 'admin@edunft.io',
      passwordHash: adminPassword,
      username: 'admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const adminWalletRecord = await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      address: adminWallet.address,
      encryptedPrivateKey: adminEncryptedPrivateKey,
      iv: adminIv.toString('hex'),
    },
  });

  await prisma.user.update({
    where: { id: admin.id },
    data: { walletId: adminWalletRecord.id },
  });

  // Create verified university
  const universityPassword = await bcrypt.hash('university123', 12);
  const universityWallet = ethers.Wallet.createRandom();
  const universityEncryptionKey = generateEncryptionKey();
  const universityIv = generateIV();
  const universityEncryptedPrivateKey = await encryptData(
    universityWallet.privateKey,
    universityEncryptionKey.toString('hex'),
    universityIv.toString('hex')
  );

  const university = await prisma.user.upsert({
    where: { email: 'university@edunft.io' },
    update: {},
    create: {
      email: 'university@edunft.io',
      passwordHash: universityPassword,
      username: 'university',
      role: 'UNIVERSITY',
      isVerified: true,
    },
  });

  const universityWalletRecord = await prisma.wallet.upsert({
    where: { userId: university.id },
    update: {},
    create: {
      userId: university.id,
      address: universityWallet.address,
      encryptedPrivateKey: universityEncryptedPrivateKey,
      iv: universityIv.toString('hex'),
    },
  });

  await prisma.user.update({
    where: { id: university.id },
    data: { walletId: universityWalletRecord.id },
  });

  // Create verified organization
  const organization = await prisma.organization.upsert({
    where: { userId: university.id },
    update: {},
    create: {
      userId: university.id,
      name: 'University of Technology',
      description: 'A leading technology university offering cutting-edge programs in computer science, engineering, and digital innovation.',
      website: 'https://university-tech.edu',
      documents: 'university-license.pdf,accreditation-cert.pdf',
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Create verification request (approved)
  await prisma.verificationRequest.upsert({
    where: { id: 'verification-1' },
    update: {},
    create: {
      id: 'verification-1',
      orgId: organization.id,
      status: 'APPROVED',
      notes: 'Approved after reviewing official documentation',
      uploadedFiles: 'license.pdf,accreditation.pdf',
    },
  });

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 12);
  const studentWallet = ethers.Wallet.createRandom();
  const studentEncryptionKey = generateEncryptionKey();
  const studentIv = generateIV();
  const studentEncryptedPrivateKey = await encryptData(
    studentWallet.privateKey,
    studentEncryptionKey.toString('hex'),
    studentIv.toString('hex')
  );

  const student = await prisma.user.upsert({
    where: { email: 'student@edunft.io' },
    update: {},
    create: {
      email: 'student@edunft.io',
      passwordHash: studentPassword,
      username: 'student',
      role: 'STUDENT',
      isVerified: true,
    },
  });

  const studentWalletRecord = await prisma.wallet.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      address: studentWallet.address,
      encryptedPrivateKey: studentEncryptedPrivateKey,
      iv: studentIv.toString('hex'),
    },
  });

  await prisma.user.update({
    where: { id: student.id },
    data: { walletId: studentWalletRecord.id },
  });

  // Create sample certificate
  await prisma.certificate.upsert({
    where: { id: 'cert-1' },
    update: {},
    create: {
      id: 'cert-1',
      tokenId: 1,
      ownerUserId: student.id,
      orgId: organization.id,
      studentName: 'John Doe',
      courseName: 'Blockchain Development',
      issueDate: new Date('2024-01-15'),
      ipfsCid: 'QmSampleCertificate123',
      metadataJson: JSON.stringify({
        name: 'Blockchain Development Certificate',
        description: 'Certificate of completion for Blockchain Development course',
        attributes: [
          { trait_type: 'Student Name', value: 'John Doe' },
          { trait_type: 'Course', value: 'Blockchain Development' },
          { trait_type: 'Institution', value: 'University of Technology' },
        ],
      }),
      status: 'MINTED',
      qrCodeUrl: 'https://edunft.io/verify/1',
    },
  });

  // Create audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        event: 'USER_CREATED',
        actorId: admin.id,
        details: JSON.stringify({
          userId: admin.id,
          email: admin.email,
          role: admin.role,
        }),
      },
      {
        event: 'ORGANIZATION_APPROVED',
        actorId: admin.id,
        details: JSON.stringify({
          organizationId: organization.id,
          organizationName: organization.name,
        }),
      },
      {
        event: 'CERTIFICATE_MINTED',
        actorId: university.id,
        details: JSON.stringify({
          certificateId: 'cert-1',
          studentName: 'John Doe',
          courseName: 'Blockchain Development',
        }),
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Sample accounts created:');
  console.log('Admin: admin@edunft.io / admin123');
  console.log('University: university@edunft.io / university123');
  console.log('Student: student@edunft.io / student123');
  console.log('\n🔑 Wallet addresses:');
  console.log(`Admin: ${adminWallet.address}`);
  console.log(`University: ${universityWallet.address}`);
  console.log(`Student: ${studentWallet.address}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
