import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { certificateService, type Certificate } from '../services/firebaseService';
import {
  Bell,
  Search,
  Eye,
  Share2,
  Filter,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function MyCertificates() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  const { currentUser, userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const loadCertificates = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const certs = await certificateService.getCertificates(currentUser.uid);
        setCertificates(certs);
        console.log('Loaded certificates:', certs);
      } catch (error) {
        console.error('Error loading certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
    
    // Set up real-time listener for new certificates
    const unsubscribe = () => {
      // Real-time updates would go here
      // For now, we'll just reload every 5 seconds
      const interval = setInterval(() => {
        if (currentUser) {
          certificateService.getCertificates(currentUser.uid).then(certs => {
            setCertificates(certs);
          });
        }
      }, 5000);
      
      return () => clearInterval(interval);
    };

    const cleanup = unsubscribe();
    return cleanup;
  }, [currentUser]);

  const getStatusIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    );
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const handleViewCertificate = (cert: Certificate) => {
    console.log('View certificate:', cert);
    // TODO: Implement certificate viewing modal or page
    alert(`Viewing certificate: ${cert.name}`);
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Certificates grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }


  const handleShareCertificate = (certificate: Certificate) => {
    // Copy certificate link to clipboard
    const certificateUrl = `${window.location.origin}/verify/${certificate.id}`;
    navigator.clipboard.writeText(certificateUrl).then(() => {
      alert('Certificate link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>{certificates.length} certificates</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{certificates.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {certificates.filter(c => c.verified).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {certificates.filter(c => !c.verified).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">My Certificates</h3>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-500">Your certificates will appear here once you receive them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{cert.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                      {cert.studentName && (
                        <p className="text-xs text-gray-500 mb-2">Student: {cert.studentName}</p>
                      )}
                      {cert.certificateId && (
                        <p className="text-xs text-gray-500 mb-2">ID: {cert.certificateId}</p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">{cert.date}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.verified)}`}>
                          {getStatusIcon(cert.verified)}
                          {cert.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      {cert.badge && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {cert.badge}
                          </span>
                        </div>
                      )}
                      {cert.grade && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Grade: <span className="font-medium">{cert.grade}</span></span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewCertificate(cert)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button 
                          onClick={() => handleShareCertificate(cert)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
