'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink, Copy, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import QRCode from 'qrcode.react';

const CertificateVerification = () => {
  const params = useParams();
  const certificateId = params.id as string;
  
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<any>(null);

  const fetchCertificate = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/verify/${certificateId}`);
      setCertificate(response.data.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setError('Certificate not found or error occurred');
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  const fetchQRCode = useCallback(async () => {
    try {
      // Generate QR code data locally
      const qrData = {
        verificationUrl: `${window.location.origin}/verify/${certificateId}`
      };
      setQrCode(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [certificateId]);

  useEffect(() => {
    fetchCertificate();
    fetchQRCode();
  }, [fetchCertificate, fetchQRCode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Certificate Not Found</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">
            Please check the certificate ID and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
        <p className="text-gray-600">Verify the authenticity of this educational certificate</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Certificate Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Certificate Details</h2>
              <div className="flex items-center space-x-2">
                {certificate.status === 'minted' ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Verified on Blockchain</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm font-medium">Pending Blockchain Verification</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate.studentName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Course Name</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate.courseName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Institution</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate.institution}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Completion Date</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {certificate.logoURI && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Institution Logo</label>
                  <img 
                    src={certificate.logoURI} 
                    alt="Institution Logo" 
                    className="h-16 w-auto object-contain rounded"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Certificate ID</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                    {certificate.certificateId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(certificate.certificateId)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {certificate.status === 'minted' && certificate.transactionHash && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Blockchain Transaction</label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                      {certificate.transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(certificate.transactionHash)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    View on PolygonScan (Mumbai Testnet)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Code and Verification */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
            {qrCode ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                  <QRCode value={qrCode.verificationUrl} size={200} />
                </div>
                <p className="text-sm text-gray-600 mb-2">Scan to verify this certificate</p>
                <button
                  onClick={() => copyToClipboard(qrCode.verificationUrl)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center space-x-1 mx-auto"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy verification link</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading QR code...</p>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Certificate Created</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Metadata Stored</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blockchain Verification</span>
                {certificate.status === 'minted' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                )}
              </div>
            </div>

            {certificate.status === 'minted' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Certificate Verified on Blockchain</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  This certificate has been minted as an NFT on the Polygon blockchain and is fully verified.
                </p>
              </div>
            )}
          </div>

          {/* Network Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Network</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">Polygon Mumbai Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract:</span>
                <span className="font-mono text-xs">EduNFT Certificate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Standard:</span>
                <span className="font-medium">ERC-721 (NFT)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
