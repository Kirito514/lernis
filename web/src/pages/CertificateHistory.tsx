import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { certificateService, type Certificate } from '../services/firebaseService';
import {
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Hash,
  ExternalLink
} from 'lucide-react';

interface EmailRecord {
  id: string;
  type: string;
  to: string;
  subject: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issuer: string;
  issueDate: string;
  verificationLink: string;
  sentAt: string;
  status: string;
}

interface NFTTransaction {
  id: string;
  type: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issuer: string;
  issueDate: string;
  amount: number;
  date: string;
  status: string;
  hash: string;
}

export default function CertificateHistory() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [emailRecords, setEmailRecords] = useState<EmailRecord[]>([]);
  const [nftTransactions, setNftTransactions] = useState<NFTTransaction[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'emails' | 'nfts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { currentUser, userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load certificates from Firebase
        const certs = await certificateService.getCertificates(currentUser.uid);
        setCertificates(certs);

        // Load email records from localStorage
        const emailData = JSON.parse(localStorage.getItem('email_records') || '[]');
        setEmailRecords(emailData);

        // Load NFT transactions from localStorage
        const nftData = JSON.parse(localStorage.getItem('nft_transactions') || '[]');
        setNftTransactions(nftData);

        console.log('Loaded certificate history:', { certs, emailData, nftData });
      } catch (error) {
        console.error('Error loading certificate history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = () => {
    let data: any[] = [];
    
    if (selectedTab === 'all') {
      data = [
        ...certificates.map(cert => ({ ...cert, type: 'certificate' })),
        ...emailRecords.map(email => ({ ...email, type: 'email' })),
        ...nftTransactions.map(nft => ({ ...nft, type: 'nft' }))
      ];
    } else if (selectedTab === 'emails') {
      data = emailRecords.map(email => ({ ...email, type: 'email' }));
    } else if (selectedTab === 'nfts') {
      data = nftTransactions.map(nft => ({ ...nft, type: 'nft' }));
    }

    if (searchTerm) {
      data = data.filter(item => 
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      const dateA = new Date(a.date || a.sentAt || a.issueDate);
      const dateB = new Date(b.date || b.sentAt || b.issueDate);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
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
              <h1 className="text-2xl font-bold text-gray-900">Certificate History</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>Track all certificate activities</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{emailRecords.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NFTs Minted</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{nftTransactions.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {certificates.length + emailRecords.length + nftTransactions.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'all', name: 'All Activities', count: certificates.length + emailRecords.length + nftTransactions.length },
                  { id: 'emails', name: 'Email History', count: emailRecords.length },
                  { id: 'nfts', name: 'NFT Transactions', count: nftTransactions.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {filteredData().length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start creating certificates to see activity history.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData().map((item, index) => (
                    <div key={`${item.type}-${item.id || index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'certificate' ? 'bg-blue-100' :
                            item.type === 'email' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            {item.type === 'certificate' ? (
                              <FileText className="h-5 w-5 text-blue-600" />
                            ) : item.type === 'email' ? (
                              <Mail className="h-5 w-5 text-green-600" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.type === 'certificate' ? 'Certificate Created' :
                               item.type === 'email' ? 'Email Sent' :
                               'NFT Minted'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.studentName} - {item.courseName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                <Hash className="h-3 w-3 inline mr-1" />
                                {item.certificateId}
                              </span>
                              <span className="text-xs text-gray-500">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {formatDate(item.date || item.sentAt || item.issueDate)}
                              </span>
                              {item.type === 'email' && (
                                <span className="text-xs text-gray-500">
                                  <User className="h-3 w-3 inline mr-1" />
                                  {item.to}
                                </span>
                              )}
                              {item.type === 'nft' && (
                                <span className="text-xs text-gray-500">
                                  <ExternalLink className="h-3 w-3 inline mr-1" />
                                  {item.hash}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status || 'completed')}`}>
                            {getStatusIcon(item.status || 'completed')}
                            {item.status || 'Completed'}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            {item.type === 'email' && (
                              <button className="text-green-600 hover:text-green-900 transition-colors duration-200">
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                alert('PDF download feature for certificate history coming soon!');
                              }}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
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
