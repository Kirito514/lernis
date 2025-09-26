import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  FileText,
  Download,
  Share2,
  Eye,
  Calendar,
  User,
  Building,
  Hash,
  CheckCircle,
  Clock,
  Mail,
  ExternalLink,
  QrCode
} from 'lucide-react';

interface StudentCertificate {
  id: string;
  certificateId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  issuer: string;
  issueDate: string;
  verificationLink: string;
  status: 'sent' | 'received' | 'viewed';
  sentAt: string;
  receivedAt?: string;
  viewedAt?: string;
  grade?: string;
  badge?: string;
  description?: string;
}

export default function StudentCertificates() {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'viewed'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadStudentCertificates();
  }, []);

  const loadStudentCertificates = () => {
    try {
      // Load certificates sent to this student's email
      const emailRecords = JSON.parse(localStorage.getItem('email_records') || '[]');
      const studentCerts = emailRecords
        .filter((record: any) => 
          record.to === currentUser?.email && 
          record.type === 'certificate_sent'
        )
        .map((record: any) => ({
          id: record.id,
          certificateId: record.certificateId,
          studentName: record.studentName,
          studentEmail: record.to,
          courseName: record.courseName,
          issuer: record.issuer,
          issueDate: record.issueDate,
          verificationLink: record.verificationLink,
          status: 'received' as const,
          sentAt: record.sentAt,
          receivedAt: new Date().toISOString()
        }));

      // Mark as viewed if student has visited verification page
      const viewedCerts = JSON.parse(localStorage.getItem('viewed_certificates') || '[]');
      const updatedCerts = studentCerts.map((cert: StudentCertificate) => {
        const viewed = viewedCerts.find((v: any) => v.certificateId === cert.certificateId);
        if (viewed) {
          return {
            ...cert,
            status: 'viewed' as const,
            viewedAt: viewed.viewedAt
          };
        }
        return cert;
      });

      setCertificates(updatedCerts);
    } catch (error) {
      console.error('Error loading student certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificate: StudentCertificate) => {
    // Mark as viewed
    const viewedCerts = JSON.parse(localStorage.getItem('viewed_certificates') || '[]');
    const existingIndex = viewedCerts.findIndex((v: any) => v.certificateId === certificate.certificateId);
    
    if (existingIndex === -1) {
      viewedCerts.push({
        certificateId: certificate.certificateId,
        viewedAt: new Date().toISOString(),
        studentEmail: currentUser?.email
      });
      localStorage.setItem('viewed_certificates', JSON.stringify(viewedCerts));
      
      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert.certificateId === certificate.certificateId 
          ? { ...cert, status: 'viewed', viewedAt: new Date().toISOString() }
          : cert
      ));
    }

    // Open verification page
    window.open(certificate.verificationLink, '_blank');
  };

  const handleDownloadPDF = (certificate: StudentCertificate) => {
    // Generate PDF for student
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.certificateId}</title>
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
                  <h2 class="student-name">${certificate.studentName}</h2>
                  <p class="certificate-text">has successfully completed the course</p>
                  <h3 class="course-info">${certificate.courseName}</h3>
                  <p class="issuer-info">On behalf of ${certificate.issuer}</p>
                  <p class="date-info">Issued on ${new Date(certificate.issueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div class="qr-section">
                <div class="qr-code">
                  QR Code<br/>
                  Verification
                </div>
                <div class="certificate-id">
                  Certificate ID:<br/>
                  ${certificate.certificateId}
                </div>
              </div>
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

  const handleShare = (certificate: StudentCertificate) => {
    if (navigator.share) {
      navigator.share({
        title: 'My Certificate',
        text: `Check out my certificate for ${certificate.courseName}`,
        url: certificate.verificationLink
      });
    } else {
      navigator.clipboard.writeText(certificate.verificationLink).then(() => {
        alert('Certificate link copied to clipboard!');
      });
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'all') return true;
    if (filter === 'received') return cert.status === 'received';
    if (filter === 'viewed') return cert.status === 'viewed';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'viewed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'received':
        return <Mail className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'viewed':
        return 'Viewed';
      case 'received':
        return 'Received';
      default:
        return 'Pending';
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-600">Loading your certificates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-sm text-gray-600">Certificates sent to {currentUser?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Certificates' },
              { key: 'received', label: 'Received' },
              { key: 'viewed', label: 'Viewed' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates List */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div key={certificate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{certificate.courseName}</h3>
                      <p className="text-sm text-gray-600">{certificate.issuer}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(certificate.status)}
                    <span className="text-xs text-gray-600">{getStatusText(certificate.status)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{certificate.studentName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono text-xs">{certificate.certificateId}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewCertificate(certificate)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(certificate)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleShare(certificate)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't received any certificates yet."
                : `No ${filter} certificates found.`
              }
            </p>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
