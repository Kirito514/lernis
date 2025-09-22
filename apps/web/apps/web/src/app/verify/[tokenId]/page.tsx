'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import QRCode from 'react-qr-code';
import Link from 'next/link';

interface VerificationData {
  certificate: {
    id: string;
    tokenId: number;
    studentName: string;
    courseName: string;
    issueDate: string;
    ipfsCid: string;
    metadataJson: string;
    status: string;
    qrCodeUrl: string;
  };
  organization: {
    id: string;
    name: string;
    description: string;
    website: string;
    verified: boolean;
    verifiedAt: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
  owner: {
    id: string;
    username: string;
    email: string;
  };
  verification: {
    isVerifiedOnChain: boolean;
    isOrganizationVerified: boolean;
    contractAddress: string;
    network: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenId) {
      fetchVerificationData();
    }
  }, [tokenId]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/verify/${tokenId}`);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">{error || 'Certificate not found'}</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = data.verification.isVerifiedOnChain && data.verification.isOrganizationVerified;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                EduNFT
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status */}
        <div className="text-center mb-8">
          {isVerified ? (
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-green-600">Certificate Verified</h1>
                <p className="text-gray-600">This certificate is authentic and verified</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4">
              <XCircleIcon className="h-16 w-16 text-red-500 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-red-600">Verification Failed</h1>
                <p className="text-gray-600">This certificate could not be verified</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificate Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">{data.certificate.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="font-medium text-gray-900">{data.certificate.studentName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(data.certificate.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="font-medium text-gray-900">{data.organization.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Issuing Organization</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{data.organization.name}</h3>
                  {data.organization.description && (
                    <p className="text-gray-600 mt-1">{data.organization.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Verification Status</span>
                  {data.organization.verified ? (
                    <span className="badge-success">Verified</span>
                  ) : (
                    <span className="badge-error">Not Verified</span>
                  )}
                </div>
                {data.organization.website && (
                  <div>
                    <a
                      href={data.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {data.organization.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Token ID</p>
                  <p className="font-mono text-sm text-gray-900">{data.certificate.tokenId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {data.verification.contractAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="text-sm text-gray-900">{data.verification.network}</p>
                </div>
                {data.certificate.ipfsCid && (
                  <div>
                    <p className="text-sm text-gray-500">IPFS CID</p>
                    <p className="font-mono text-sm text-gray-900 break-all">
                      {data.certificate.ipfsCid}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Certificate</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode
                  value={`${window.location.origin}/verify/${tokenId}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Scan to verify this certificate
              </p>
            </div>

            {/* Verification Status */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blockchain Verification</span>
                  {data.verification.isVerifiedOnChain ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Organization Verified</span>
                  {data.verification.isOrganizationVerified ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full btn-secondary"
                >
                  Print Certificate
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/verify/${tokenId}`);
                  }}
                  className="w-full btn-secondary"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
