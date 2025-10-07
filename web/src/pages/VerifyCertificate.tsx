import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Clock
} from 'lucide-react';

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'valid' | 'invalid' | 'pending'>('pending');

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!certificateId) {
        setError('Certificate ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Try to find certificate in multiple sources
        let foundCertificate = null;

        // 1. Check localStorage for certificates
        const allCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
        foundCertificate = allCertificates.find((cert: any) => 
          cert.certificateId === certificateId || cert.id === certificateId
        );

        // 2. Check localStorage for certificate creation records
        if (!foundCertificate) {
          const creationRecords = JSON.parse(localStorage.getItem('certificate_creation_records') || '[]');
          foundCertificate = creationRecords.find((record: any) => 
            record.certificateId === certificateId || record.id === certificateId
          );
        }

        // 3. Check localStorage for NFT transactions (minted certificates)
        if (!foundCertificate) {
          const nftTransactions = JSON.parse(localStorage.getItem('nft_transactions') || '[]');
          foundCertificate = nftTransactions.find((tx: any) => 
            tx.certificateId === certificateId || tx.id === certificateId
          );
        }

        // 4. Check localStorage for email records
        if (!foundCertificate) {
          const emailRecords = JSON.parse(localStorage.getItem('email_records') || '[]');
          foundCertificate = emailRecords.find((record: any) => 
            record.certificateId === certificateId || 
            record.id === certificateId ||
            record.emailId === certificateId ||
            `email_${record.timestamp}` === certificateId
          );
        }

        // 5. Try Firebase as final fallback
        if (!foundCertificate) {
          try {
            const firebaseCerts = await certificateService.getCertificates('all');
            foundCertificate = firebaseCerts.find(cert => 
              cert.id === certificateId || (cert as any).certificateId === certificateId
            );
          } catch (firebaseError) {
            console.error('Firebase error:', firebaseError);
          }
        }

        if (foundCertificate) {
          console.log('Found certificate:', foundCertificate);
          
          // Normalize certificate data structure
          const normalizedCertificate = {
            ...foundCertificate,
            // Ensure we have the right field names
            studentName: foundCertificate.studentName || (foundCertificate as any).studentName,
            courseName: foundCertificate.courseName || (foundCertificate as any).courseName || foundCertificate.name,
            certificateId: foundCertificate.certificateId || (foundCertificate as any).certificateId || foundCertificate.id,
            date: foundCertificate.date || (foundCertificate as any).issueDate || (foundCertificate as any).date,
            issuer: foundCertificate.issuer || (foundCertificate as any).issuer,
            name: foundCertificate.name || (foundCertificate as any).courseName || (foundCertificate as any).name
          };
          
          console.log('Normalized certificate:', normalizedCertificate);
          setCertificate(normalizedCertificate);
          setVerificationStatus('valid');
        } else {
          console.log('Certificate not found for ID:', certificateId);
          setVerificationStatus('invalid');
          setError('Certificate not found or invalid');
        }
      } catch (err) {
        setVerificationStatus('invalid');
        setError('Error verifying certificate');
        console.error('Verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'valid':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'invalid':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'Certificate Verified';
      case 'invalid':
        return 'Certificate Invalid';
      default:
        return 'Verifying...';
    }
  };

  const handleDownloadPDF = () => {
    if (!certificate) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', sans-serif;
              background: #f8fafc;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .certificate-container {
              width: 842px;
              height: 595px;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 3px solid #e2e8f0;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              position: relative;
              overflow: hidden;
            }
            
            .certificate-border {
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              bottom: 20px;
              border: 2px solid #3b82f6;
              border-radius: 15px;
              background: white;
            }
            
            .certificate-header {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 80px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border-radius: 15px 15px 0 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .certificate-title {
              color: white;
              font-family: 'Playfair Display', serif;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 2px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .certificate-content {
              padding: 100px 60px 60px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .main-content {
              text-align: center;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .certificate-text {
              font-size: 18px;
              color: #64748b;
              margin-bottom: 30px;
              font-weight: 300;
            }
            
            .student-name {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              color: #1e40af;
              margin: 20px 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .course-info {
              font-size: 24px;
              font-weight: 600;
              color: #374151;
              margin: 20px 0;
            }
            
            .issuer-info {
              font-size: 20px;
              font-weight: 500;
              color: #6b7280;
              margin: 20px 0;
            }
            
            .date-info {
              font-size: 18px;
              font-weight: 600;
              color: #374151;
              margin: 20px 0;
            }
            
            .signatures-section {
              margin-top: 40px;
              border-top: 2px solid #e5e7eb;
              padding-top: 30px;
            }
            
            .verified-by {
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 30px;
              letter-spacing: 1px;
            }
            
            .signatures {
              display: flex;
              justify-content: space-between;
              gap: 40px;
            }
            
            .signature-item {
              flex: 1;
              text-align: center;
            }
            
            .signature-line {
              border-bottom: 2px solid #d1d5db;
              height: 50px;
              margin-bottom: 15px;
              position: relative;
            }
            
            .signature-name {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 5px;
            }
            
            .signature-title {
              font-size: 14px;
              color: #6b7280;
            }
            
            .qr-section {
              position: absolute;
              bottom: 30px;
              left: 30px;
              display: flex;
              align-items: center;
              gap: 15px;
            }
            
            .qr-code {
              width: 80px;
              height: 80px;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              font-size: 10px;
              color: #6b7280;
              text-align: center;
              line-height: 1.2;
            }
            
            .certificate-id {
              font-size: 12px;
              color: #6b7280;
              font-weight: 500;
            }
            
            .decorative-elements {
              position: absolute;
              top: 50%;
              left: 20px;
              right: 20px;
              height: 2px;
              background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%);
              z-index: 1;
            }
            
            .decorative-elements::before,
            .decorative-elements::after {
              content: '';
              position: absolute;
              top: -8px;
              width: 16px;
              height: 16px;
              background: #3b82f6;
              border-radius: 50%;
            }
            
            .decorative-elements::before {
              left: 50px;
            }
            
            .decorative-elements::after {
              right: 50px;
            }
            
            @media print {
              body { 
                background: white; 
                padding: 0;
              }
              .certificate-container { 
                box-shadow: none;
                border: 2px solid #e2e8f0;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="certificate-border">
              <div class="certificate-header">
                <h1 class="certificate-title">CERTIFICATE OF COMPLETION</h1>
              </div>
              
              <div class="certificate-content">
                <div class="main-content">
                  <p class="certificate-text">This is to certify that</p>
                  <h2 class="student-name">${(certificate as any).studentName || certificate.name || 'Student Name'}</h2>
                  <p class="certificate-text">has successfully completed the course</p>
                  <h3 class="course-info">${certificate.name || 'Course Name'}</h3>
                  <p class="issuer-info">On behalf of ${certificate.issuer || 'Institution Name'}</p>
                  <p class="date-info">Issued on ${certificate.date || new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="signatures-section">
                  <p class="verified-by">VERIFIED BY</p>
                  <div class="signatures">
                    <div class="signature-item">
                      <div class="signature-line"></div>
                      <p class="signature-name">${(certificate as any).signatory1Name || 'Papry Naznin'}</p>
                      <p class="signature-title">${(certificate as any).signatory1Title || 'President'}</p>
                    </div>
                    <div class="signature-item">
                      <div class="signature-line"></div>
                      <p class="signature-name">${(certificate as any).signatory2Name || 'Die Erlan'}</p>
                      <p class="signature-title">${(certificate as any).signatory2Title || 'Director'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="qr-section">
                <div class="qr-code">
                  QR Code<br/>
                  Verification
                </div>
                <div class="certificate-id">
                  Certificate ID:<br/>
                  ${certificate.id}
                </div>
              </div>
              
              <div class="decorative-elements"></div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Certificate Verification',
        text: `Verify certificate: ${certificateId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Verification link copied to clipboard!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Certificate</h2>
          <p className="text-gray-600">Please wait while we verify your certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
                <p className="text-sm text-gray-600">Verify the authenticity of certificates</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status */}
        <div className={`rounded-xl border-2 p-8 text-center mb-8 ${getStatusColor()}`}>
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-3xl font-bold mb-2">{getStatusText()}</h2>
          <p className="text-lg">
            {verificationStatus === 'valid' 
              ? 'This certificate has been verified and is authentic.'
              : verificationStatus === 'invalid'
              ? 'This certificate could not be verified or does not exist.'
              : 'Verification in progress...'
            }
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Details */}
        {certificate && verificationStatus === 'valid' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-semibold text-gray-900">
                      {(certificate as any).studentName || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Course Name</p>
                    <p className="font-semibold text-gray-900">
                      {(certificate as any).courseName || certificate.name || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issuer</p>
                    <p className="font-semibold text-gray-900">{certificate.issuer}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.date ? new Date(certificate.date).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Hash className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Certificate ID</p>
                    <p className="font-semibold text-gray-900 font-mono">
                      {(certificate as any).certificateId || certificate.id || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${
                      verificationStatus === 'valid' ? 'text-green-600' : 
                      verificationStatus === 'invalid' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {verificationStatus === 'valid' ? 'Verified' : 
                       verificationStatus === 'invalid' ? 'Invalid' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {certificate.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{certificate.description}</p>
              </div>
            )}

            {/* Additional Details */}
            {(certificate as any).grade && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Grade</h4>
                <p className="text-gray-700">{(certificate as any).grade}</p>
              </div>
            )}

            {(certificate as any).badge && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Badge</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {(certificate as any).badge}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Verification Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Certificate Verification</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• This verification system ensures the authenticity of certificates issued through our platform.</p>
            <p>• Each certificate has a unique ID that can be verified through this system.</p>
            <p>• Verified certificates are stored securely and cannot be tampered with.</p>
            <p>• If you have any concerns about a certificate's authenticity, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
