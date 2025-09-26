import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateService, type Certificate } from '../services/firebaseService';
import {
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  User,
  Building,
  Hash,
  Shield,
  Download,
  Share2,
  ExternalLink,
  AlertTriangle,
  Clock,
  Search,
  QrCode,
  Eye,
  Copy
} from 'lucide-react';

export default function DashboardVerification() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'valid' | 'invalid' | 'pending' | 'none'>('none');
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);

  useEffect(() => {
    // Load recent verifications from localStorage
    const recent = JSON.parse(localStorage.getItem('recent_verifications') || '[]');
    setRecentVerifications(recent.slice(0, 5)); // Show last 5
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setVerificationStatus('pending');
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to find certificate in multiple sources
      let foundCertificate = null;

      // 1. Check localStorage for certificates
      const allCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
      foundCertificate = allCertificates.find((cert: any) => 
        cert.certificateId === searchId || cert.id === searchId
      );

      // 2. Check localStorage for certificate creation records
      if (!foundCertificate) {
        const creationRecords = JSON.parse(localStorage.getItem('certificate_creation_records') || '[]');
        foundCertificate = creationRecords.find((record: any) => 
          record.certificateId === searchId || record.id === searchId
        );
      }

      // 3. Check localStorage for NFT transactions (minted certificates)
      if (!foundCertificate) {
        const nftTransactions = JSON.parse(localStorage.getItem('nft_transactions') || '[]');
        foundCertificate = nftTransactions.find((tx: any) => 
          tx.certificateId === searchId || tx.id === searchId
        );
      }

      // 4. Check localStorage for email records
      if (!foundCertificate) {
        const emailRecords = JSON.parse(localStorage.getItem('email_records') || '[]');
        foundCertificate = emailRecords.find((record: any) => 
          record.certificateId === searchId || record.id === searchId
        );
      }

      // 5. Try Firebase as final fallback
      if (!foundCertificate) {
        try {
          const firebaseCerts = await certificateService.getCertificates('all');
          foundCertificate = firebaseCerts.find(cert => 
            cert.id === searchId || (cert as any).certificateId === searchId
          );
        } catch (firebaseError) {
          console.error('Firebase error:', firebaseError);
        }
      }

      if (foundCertificate) {
        setCertificate(foundCertificate);
        setVerificationStatus('valid');
        
        // Save to recent verifications
        const recent = JSON.parse(localStorage.getItem('recent_verifications') || '[]');
        const newVerification = {
          id: searchId,
          status: 'valid',
          timestamp: new Date().toISOString(),
          studentName: (foundCertificate as any).studentName || foundCertificate.name,
          courseName: foundCertificate.name
        };
        const updatedRecent = [newVerification, ...recent.filter((v: any) => v.id !== searchId)].slice(0, 10);
        localStorage.setItem('recent_verifications', JSON.stringify(updatedRecent));
        setRecentVerifications(updatedRecent.slice(0, 5));
      } else {
        setVerificationStatus('invalid');
        setError('Certificate not found or invalid');
        
        // Save failed verification
        const recent = JSON.parse(localStorage.getItem('recent_verifications') || '[]');
        const newVerification = {
          id: searchId,
          status: 'invalid',
          timestamp: new Date().toISOString(),
          error: 'Certificate not found'
        };
        const updatedRecent = [newVerification, ...recent.filter((v: any) => v.id !== searchId)].slice(0, 10);
        localStorage.setItem('recent_verifications', JSON.stringify(updatedRecent));
        setRecentVerifications(updatedRecent.slice(0, 5));
      }
    } catch (err) {
      setVerificationStatus('invalid');
      setError('Error verifying certificate');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPublic = () => {
    if (certificate) {
      const publicUrl = `${window.location.origin}/verify/${searchId}`;
      window.open(publicUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    if (certificate) {
      const publicUrl = `${window.location.origin}/verify/${searchId}`;
      navigator.clipboard.writeText(publicUrl).then(() => {
        alert('Verification link copied to clipboard!');
      });
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'valid':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500 animate-spin" />;
      default:
        return <Shield className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'invalid':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'Certificate Verified';
      case 'invalid':
        return 'Certificate Invalid';
      case 'pending':
        return 'Verifying...';
      default:
        return 'Enter Certificate ID to verify';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
              <p className="mt-2 text-gray-600">Verify the authenticity of certificates issued through our platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/verification/log')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <FileText className="h-4 w-4" />
                View Log
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Verification Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify Certificate</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate ID
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="Enter certificate ID (e.g., CERT-2025-XXXXX)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading || !searchId.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Display */}
                {verificationStatus !== 'none' && (
                  <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon()}
                      <div>
                        <h3 className="font-semibold">{getStatusText()}</h3>
                        {error && (
                          <p className="text-sm mt-1">{error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate Details */}
                {certificate && verificationStatus === 'valid' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-semibold text-gray-900">
                          {(certificate as any).studentName || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course Name</p>
                        <p className="font-semibold text-gray-900">{certificate.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Issuer</p>
                        <p className="font-semibold text-gray-900">{certificate.issuer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Issue Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(certificate.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={handleViewPublic}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        View Public Page
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Scanner Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Scanner</h2>
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Scan QR code from certificate to verify instantly</p>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Open Scanner
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Verifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Verifications</h3>
              <div className="space-y-3">
                {recentVerifications.length > 0 ? (
                  recentVerifications.map((verification, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {verification.status === 'valid' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {verification.studentName || verification.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(verification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent verifications</p>
                )}
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Verified</span>
                  <span className="font-semibold text-green-600">
                    {recentVerifications.filter(v => v.status === 'valid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Invalid</span>
                  <span className="font-semibold text-red-600">
                    {recentVerifications.filter(v => v.status === 'invalid').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">
                    {recentVerifications.length > 0 
                      ? Math.round((recentVerifications.filter(v => v.status === 'valid').length / recentVerifications.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Having trouble verifying a certificate? Check our help documentation or contact support.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200">
                  📖 Verification Guide
                </button>
                <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200">
                  💬 Contact Support
                </button>
                <button className="w-full text-left text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200">
                  ❓ FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
