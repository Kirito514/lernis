'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, ExternalLink, Download, Share2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CertificateView = () => {
  const params = useParams();
  const certificateId = params.id as string;
  
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/certificates/${certificateId}`);
      setCertificate(response.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setError('Certificate not found or error occurred');
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  const downloadCertificate = () => {
    // Create a canvas to generate PDF-like certificate
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !certificate) return;
    
    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Inner border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);
    
    // Title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 48px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 180);
    
    // This is to certify
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Inter';
    ctx.fillText('This is to certify that', canvas.width / 2, 240);
    
    // Student name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Inter';
    ctx.fillText(certificate.studentName, canvas.width / 2, 300);
    
    // Has successfully completed
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Inter';
    ctx.fillText('has successfully completed', canvas.width / 2, 360);
    
    // Course name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Inter';
    ctx.fillText(certificate.courseName, canvas.width / 2, 420);
    
    // Institution
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Inter';
    ctx.fillText(`offered by ${certificate.institution}`, canvas.width / 2, 460);
    
    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Inter';
    ctx.fillText(`Completed on ${new Date(certificate.completionDate).toLocaleDateString()}`, canvas.width / 2, 520);
    
    // Certificate ID
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`Certificate ID: ${certificate.certificateId}`, 100, 700);
    
    // Status
    if (certificate.status === 'minted') {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 20px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('✓ Verified on Blockchain', canvas.width - 100, 700);
    }
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.certificateId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded!');
      }
    });
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${certificate.studentName} - ${certificate.courseName} Certificate`,
          text: `View ${certificate.studentName}'s certificate for ${certificate.courseName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate link copied to clipboard!');
    }
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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Certificate Not Found</h1>
          <p className="text-red-700 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate View</h1>
        <p className="text-gray-600">Beautiful certificate layout for sharing and printing</p>
      </div>

      {/* Certificate Display */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="max-w-4xl mx-auto">
          {/* Certificate Border */}
          <div className="border-8 border-blue-800 rounded-lg p-12 relative">
            {/* Inner Border */}
            <div className="border-2 border-blue-500 rounded-lg p-8">
              
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <GraduationCap className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
                <h1 className="text-5xl font-bold text-blue-800 mb-4">Certificate of Completion</h1>
                <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
              </div>

              {/* Certificate Content */}
              <div className="text-center space-y-6">
                <p className="text-xl text-gray-600">This is to certify that</p>
                
                <h2 className="text-4xl font-bold text-gray-900">{certificate.studentName}</h2>
                
                <p className="text-xl text-gray-600">has successfully completed</p>
                
                <h3 className="text-3xl font-bold text-gray-800">{certificate.courseName}</h3>
                
                <p className="text-lg text-gray-600">offered by</p>
                
                <h4 className="text-2xl font-semibold text-gray-800">{certificate.institution}</h4>
                
                <p className="text-lg text-gray-600">
                  Completed on {new Date(certificate.completionDate).toLocaleDateString()}
                </p>
              </div>

              {/* Institution Logo */}
              {certificate.logoURI && (
                <div className="text-center mt-8">
                  <img 
                    src={certificate.logoURI} 
                    alt="Institution Logo" 
                    className="h-20 w-auto object-contain mx-auto"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="text-left">
                    <p><strong>Certificate ID:</strong></p>
                    <p className="font-mono">{certificate.certificateId}</p>
                  </div>
                  <div className="text-right">
                    {certificate.status === 'minted' ? (
                      <div className="flex items-center justify-end space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Verified on Blockchain</span>
                      </div>
                    ) : (
                      <div className="text-yellow-600">
                        <span className="font-medium">Pending Verification</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={downloadCertificate}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download Certificate</span>
        </button>
        
        <button
          onClick={shareCertificate}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span>Share Certificate</span>
        </button>
      </div>

      {/* Certificate Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium text-gray-600">Student:</span> {certificate.studentName}</p>
            <p><span className="font-medium text-gray-600">Course:</span> {certificate.courseName}</p>
            <p><span className="font-medium text-gray-600">Institution:</span> {certificate.institution}</p>
          </div>
          <div>
            <p><span className="font-medium text-gray-600">Completion Date:</span> {new Date(certificate.completionDate).toLocaleDateString()}</p>
            <p><span className="font-medium text-gray-600">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                certificate.status === 'minted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {certificate.status === 'minted' ? 'Verified on Blockchain' : 'Pending Verification'}
              </span>
            </p>
            {certificate.status === 'minted' && certificate.transactionHash && (
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-medium">Transaction:</span>
                <a
                  href={`https://mumbai.polygonscan.com/tx/${certificate.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1 flex items-center space-x-1"
                >
                  <span>{certificate.transactionHash.slice(0, 10)}...</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
