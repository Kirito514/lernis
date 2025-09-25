import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  HelpCircle,
  MessageCircle,
  Book,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Download
} from 'lucide-react';

export default function Help() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const { userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const faqs = [
    {
      id: 1,
      question: 'How do I create a certificate?',
      answer: 'To create a certificate, go to the Certificates section and click "Create New". Fill in the required information and submit for approval.',
      category: 'Certificates'
    },
    {
      id: 2,
      question: 'How do I verify a certificate?',
      answer: 'You can verify certificates by going to the Verification section and entering the certificate hash or scanning the QR code.',
      category: 'Verification'
    },
    {
      id: 3,
      question: 'How do I manage my wallet?',
      answer: 'Your wallet can be managed from the Wallet section where you can view your balance, transactions, and export your wallet.',
      category: 'Wallet'
    },
    {
      id: 4,
      question: 'How do I add students?',
      answer: 'Go to the Students section and click "Add Student" to manually add students or use the "Import CSV" feature for bulk import.',
      category: 'Students'
    }
  ];

  const supportCategories = [
    {
      name: 'General Support',
      icon: HelpCircle,
      description: 'General questions and help',
      color: 'bg-blue-500'
    },
    {
      name: 'Technical Issues',
      icon: MessageCircle,
      description: 'Technical problems and bugs',
      color: 'bg-red-500'
    },
    {
      name: 'Account Issues',
      icon: Book,
      description: 'Account and profile problems',
      color: 'bg-green-500'
    },
    {
      name: 'Billing Support',
      icon: Phone,
      description: 'Payment and billing questions',
      color: 'bg-purple-500'
    }
  ];

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide to using Lernis platform',
      type: 'PDF',
      icon: FileText,
      download: true
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video tutorials',
      type: 'Video',
      icon: Video,
      download: false
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      type: 'Web',
      icon: ExternalLink,
      download: false
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>Get help and support</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
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
          <div className="max-w-6xl mx-auto">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {supportCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'faq', name: 'FAQ', count: faqs.length },
                    { id: 'contact', name: 'Contact Support', count: null },
                    { id: 'resources', name: 'Resources', count: resources.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                      {tab.count && (
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {faq.category}
                              </span>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h4>
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact Support Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Support</p>
                            <p className="text-sm text-gray-600">support@lernis.com</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Phone Support</p>
                            <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Response Times</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Email: Within 24 hours</li>
                            <li>• Phone: 9 AM - 5 PM EST</li>
                            <li>• Live Chat: 8 AM - 8 PM EST</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Send us a message</h4>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          ></textarea>
                        </div>
                        <button className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          Send Message
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Helpful Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resources.map((resource, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <resource.icon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">{resource.title}</h4>
                              <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{resource.type}</span>
                                {resource.download ? (
                                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200">
                                    <Download className="h-3 w-3" />
                                    Download
                                  </button>
                                ) : (
                                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200">
                                    <ExternalLink className="h-3 w-3" />
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
