import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { certificateService } from '../services/firebaseService';
import {
  // Bell,
  // Search,
  Save,
  // Upload,
  X,
  Plus,
  FileText,
  User,
  Calendar,
  Award,
  QrCode,
  Eye,
  // Download,
  Palette,
  // Image,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Hash,
  Building,
  GraduationCap
} from 'lucide-react';

export default function CreateCertificate() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    courseName: '',
    issuer: '',
    issueDate: '',
    grade: '',
    description: '',
    duration: '',
    hours: '',
    specialization: '',
    certificateId: '',
    logo: null as File | null,
    signature: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { userData, currentUser } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading if user is not loaded yet
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generate unique certificate ID
  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  };

  // Initialize certificate ID
  React.useEffect(() => {
    if (!formData.certificateId) {
      setFormData(prev => ({
        ...prev,
        certificateId: generateCertificateId()
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Current user:', currentUser);
      console.log('User data:', userData);

      // Create certificate data for Firebase
      const certificateData = {
        name: formData.courseName,
        issuer: formData.issuer,
        description: formData.description || `${formData.courseName} completion certificate`,
        date: formData.issueDate,
        type: 'certificate' as const,
        image: '/api/placeholder/200/150', // Placeholder image
        verified: true, // Auto-verify for now
        hash: `0x${Math.random().toString(16).substr(2, 8)}`, // Simulated blockchain hash
        userId: currentUser!.uid
      };

      console.log('Certificate data:', certificateData);

      // Save to Firebase
      const certificateId = await certificateService.addCertificate(certificateData);
      
      if (certificateId) {
        console.log('Certificate created successfully:', certificateId);
        
        // Show success state
        setIsSuccess(true);
      } else {
        throw new Error('Failed to create certificate');
      }
      
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Error creating certificate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      // Step validation
      if (currentStep === 1) {
        // Check required fields for step 1
        if (!formData.studentName || !formData.studentEmail || !formData.courseName || !formData.issuer || !formData.issueDate) {
          alert('Please fill in all required fields before proceeding to the next step.');
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createAnother = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    setFormData({
      studentName: '',
      studentEmail: '',
      courseName: '',
      issuer: '',
      issueDate: '',
      grade: '',
      description: '',
      duration: '',
      hours: '',
      specialization: '',
      certificateId: generateCertificateId(),
      logo: null,
      signature: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Template options
  const templates = [
    { id: 'classic', name: 'Classic', description: 'Traditional design with elegant borders' },
    { id: 'modern', name: 'Modern', description: 'Clean and minimalist design' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and focused layout' },
    { id: 'gold', name: 'Gold Border', description: 'Premium design with gold accents' }
  ];

  // Certificate Preview Component
  const CertificatePreview = () => {
    const getTemplateStyle = () => {
      switch (selectedTemplate) {
        case 'modern':
          return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200';
        case 'minimal':
          return 'bg-white border border-gray-300';
        case 'gold':
          return 'bg-gradient-to-br from-yellow-50 to-amber-100 border-4 border-yellow-400';
        default:
          return 'bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-300';
      }
    };

    return (
      <div className={`w-full max-w-md mx-auto p-8 rounded-lg shadow-lg ${getTemplateStyle()}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Certificate of Completion</h1>
          </div>
          <div className="h-px bg-gray-300 mb-4"></div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">This is to certify that</p>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
            {formData.studentName || 'Student Name'}
          </h2>
          <p className="text-gray-600 mb-2">has successfully completed</p>
          <h3 className="text-xl font-semibold text-blue-600 mb-4">
            {formData.courseName || 'Course Name'}
          </h3>
          {formData.grade && (
            <p className="text-lg text-gray-700 mb-4">Grade: <span className="font-bold">{formData.grade}</span></p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Issued by:</p>
              <p className="font-semibold">{formData.issuer || 'Institution Name'}</p>
            </div>
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-semibold">{formData.issueDate || 'YYYY-MM-DD'}</p>
            </div>
          </div>
          
          {/* Certificate ID */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Certificate ID: {formData.certificateId}</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Create Certificate</h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-4">
                  {[
                    { step: 1, name: 'Basic Info' },
                    { step: 2, name: 'Details' },
                    { step: 3, name: 'Template' }
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= item.step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {item.name}
                      </span>
                      {index < 2 && (
                        <div className={`w-8 h-px mx-4 ${
                          currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isSuccess ? (
            /* Success State */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Created Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Your certificate has been created and minted on the blockchain. 
                  The student will receive it in their wallet.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Certificate Details</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Student:</strong> {formData.studentName}</p>
                    <p><strong>Course:</strong> {formData.courseName}</p>
                    <p><strong>Certificate ID:</strong> {formData.certificateId}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={createAnother}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Create Another Certificate
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard/my-certificates'}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    View All Certificates
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Form Section */
            <div className={`max-w-7xl mx-auto ${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Certificate Information</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new certificate</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Step 1: Basic Information</h3>
                      <p className="text-sm text-gray-600">Enter student and course details</p>
                    </div>

                    {/* Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          Student Name *
                        </label>
                        <input
                          type="text"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter student's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          Student Email *
                        </label>
                        <input
                          type="email"
                          name="studentEmail"
                          value={formData.studentEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="student@email.com"
                        />
                      </div>
                    </div>

                    {/* Course Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Course Name *
                        </label>
                        <input
                          type="text"
                          name="courseName"
                          value={formData.courseName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Web Development Bootcamp"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Award className="h-4 w-4 inline mr-1" />
                          Grade
                        </label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Grade</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                    </div>

                    {/* Issuer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Building className="h-4 w-4 inline mr-1" />
                          Issuer *
                        </label>
                        <input
                          type="text"
                          name="issuer"
                          value={formData.issuer}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Tech University"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Issue Date *
                        </label>
                        <input
                          type="date"
                          name="issueDate"
                          value={formData.issueDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Additional Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Step 2: Additional Details</h3>
                      <p className="text-sm text-gray-600">Add more information about the certificate</p>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 3 months"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Hours
                        </label>
                        <input
                          type="text"
                          name="hours"
                          value={formData.hours}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 120 hours"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Award className="h-4 w-4 inline mr-1" />
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Frontend Development"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional details about the certificate..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Template & Finalize */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Step 3: Template & Finalize</h3>
                      <p className="text-sm text-gray-600">Choose template and review certificate</p>
                    </div>

                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        <Palette className="h-4 w-4 inline mr-1" />
                        Choose Template
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTemplate(template.id);
                            }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTemplate === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certificate ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Hash className="h-4 w-4 inline mr-1" />
                        Certificate ID
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={formData.certificateId}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, certificateId: generateCertificateId() }));
                          }}
                          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Certificate Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student:</span>
                          <span className="font-medium">{formData.studentName || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Course:</span>
                          <span className="font-medium">{formData.courseName || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issuer:</span>
                          <span className="font-medium">{formData.issuer || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Template:</span>
                          <span className="font-medium">{templates.find(t => t.id === selectedTemplate)?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Create Certificate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Live</span>
                  </div>
                </div>
                <CertificatePreview />
              </div>
            )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

