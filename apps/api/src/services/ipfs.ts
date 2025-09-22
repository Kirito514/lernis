import { CertificateMetadata } from '@edunft/shared';

// Mock IPFS service - in production, use Pinata or Web3.Storage
export async function uploadToIPFS(data: string): Promise<string> {
  // In production, you would:
  // 1. Upload the data to IPFS using Pinata or Web3.Storage
  // 2. Return the IPFS hash/CID
  
  // For now, we'll generate a mock CID
  const mockCid = `Qm${Math.random().toString(36).substr(2, 44)}`;
  
  console.log('Mock IPFS upload:', {
    data: data.substring(0, 100) + '...',
    cid: mockCid,
  });
  
  return mockCid;
}

export function generateMetadata({
  studentName,
  courseName,
  organizationName,
  issueDate,
  certificateId,
}: {
  studentName: string;
  courseName: string;
  organizationName: string;
  issueDate: Date;
  certificateId: string;
}): CertificateMetadata {
  return {
    name: `${courseName} Certificate`,
    description: `This certificate verifies that ${studentName} has successfully completed the ${courseName} course from ${organizationName}.`,
    image: `https://edunft.io/api/certificates/${certificateId}/image`,
    attributes: [
      {
        trait_type: 'Student Name',
        value: studentName,
      },
      {
        trait_type: 'Course',
        value: courseName,
      },
      {
        trait_type: 'Institution',
        value: organizationName,
      },
      {
        trait_type: 'Issue Date',
        value: issueDate.toISOString().split('T')[0],
      },
      {
        trait_type: 'Certificate Type',
        value: 'Educational Certificate',
      },
    ],
    external_url: `https://edunft.io/verify/${certificateId}`,
    background_color: 'ffffff',
  };
}
