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
    signature1: null as File | null,
    signature2: null as File | null,
    signatory1Name: '',
    signatory1Title: '',
    signatory2Name: '',
    signatory2Title: '',
    badge: '',
    certificateColor: 'yellow' // yellow, blue, green, purple
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
        userId: currentUser!.uid,
        // New fields for the enhanced certificate
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        grade: formData.grade,
        certificateId: formData.certificateId,
        badge: formData.badge,
        certificateColor: formData.certificateColor,
        signatory1Name: formData.signatory1Name,
        signatory1Title: formData.signatory1Title,
        signatory2Name: formData.signatory2Name,
        signatory2Title: formData.signatory2Title,
        duration: formData.duration,
        hours: formData.hours,
        specialization: formData.specialization
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
      signature1: null,
      signature2: null,
      signatory1Name: '',
      signatory1Title: '',
      signatory2Name: '',
      signatory2Title: '',
      badge: '',
      certificateColor: 'yellow'
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
    const getColorClasses = () => {
      switch (formData.certificateColor) {
        case 'blue':
          return {
            band: 'bg-blue-600',
            name: 'text-blue-600'
          };
        case 'green':
          return {
            band: 'bg-green-600',
            name: 'text-green-600'
          };
        case 'purple':
          return {
            band: 'bg-purple-600',
            name: 'text-purple-600'
          };
        default: // yellow
          return {
            band: 'bg-yellow-500',
            name: 'text-orange-600'
          };
      }
    };

    const colors = getColorClasses();

    return (
      <div className="w-full max-w-4xl mx-auto bg-white border-2 border-black shadow-2xl">
        {/* Certificate Layout */}
        <div className="flex min-h-[600px]">
          {/* Left Certificate Band */}
          <div className={`w-20 ${colors.band} flex items-center justify-center`}>
            <div className="transform -rotate-90 text-white font-bold text-lg tracking-wider">
              CERTIFICATE
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 20px)`
              }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-gray-600 text-sm mb-4">This is certify that</p>
                <h2 className={`text-4xl font-bold ${colors.name} mb-6`}>
                  {formData.studentName || 'MR. RAZIB FERGUSON'}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {formData.description || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore'}
                </p>
                <p className="text-gray-800 font-semibold text-lg mb-4">
                  On Behalf of {formData.issuer || 'Lorem Ipsum Ltd'}
                </p>
                <p className="text-gray-600 text-sm">
                  {formData.description || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt sed do eiusmod te sed do eiusmod te ut labore et dolore magna aliqua. Ut enim ad minim veniamaboris nisi, '}
                  <span className="font-semibold">{formData.issueDate || 'October 31, 2016'}</span>
                </p>
              </div>

              {/* Badge */}
              {formData.badge && (
                <div className="absolute top-4 right-4">
                  <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center relative">
                    <div className="text-black font-bold text-xs text-center">
                      {formData.badge}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="mt-16">
                <p className="text-gray-800 font-bold text-sm mb-6">VERIFIED BY</p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-gray-800 font-semibold text-sm">
                      {formData.signatory1Name || 'Papry Naznin'}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {formData.signatory1Title || 'President'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-gray-800 font-semibold text-sm">
                      {formData.signatory2Name || 'Die Erlan'}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {formData.signatory2Title || 'Director'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="absolute bottom-4 left-4">
              <div className="w-16 h-16 bg-white border border-gray-300 flex items-center justify-center">
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
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
                    onClick={() => window.location.href = '/dashboard/certificates'}
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

              <div className="p-6">
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

                    {/* Badge */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Award className="h-4 w-4 inline mr-1" />
                        Badge (e.g., "Best Developer")
                      </label>
                      <input
                        type="text"
                        name="badge"
                        value={formData.badge}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Best Developer, Top Performer"
                      />
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Palette className="h-4 w-4 inline mr-1" />
                        Certificate Color
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
                          { value: 'blue', label: 'Blue', color: 'bg-blue-600' },
                          { value: 'green', label: 'Green', color: 'bg-green-600' },
                          { value: 'purple', label: 'Purple', color: 'bg-purple-600' }
                        ].map((color) => (
                          <div
                            key={color.value}
                            onClick={() => setFormData(prev => ({ ...prev, certificateColor: color.value }))}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.certificateColor === color.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-8 ${color.color} rounded mb-2`}></div>
                            <p className="text-xs text-center text-gray-600">{color.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signatories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          Signatory 1 Name
                        </label>
                        <input
                          type="text"
                          name="signatory1Name"
                          value={formData.signatory1Name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Papry Naznin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Award className="h-4 w-4 inline mr-1" />
                          Signatory 1 Title
                        </label>
                        <input
                          type="text"
                          name="signatory1Title"
                          value={formData.signatory1Title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., President"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          Signatory 2 Name
                        </label>
                        <input
                          type="text"
                          name="signatory2Name"
                          value={formData.signatory2Name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Die Erlan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Award className="h-4 w-4 inline mr-1" />
                          Signatory 2 Title
                        </label>
                        <input
                          type="text"
                          name="signatory2Title"
                          value={formData.signatory2Title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Director"
                        />
                      </div>
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

                {/* Step 3: Finalize & Actions */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Step 3: Finalize & Actions</h3>
                      <p className="text-sm text-gray-600">Review certificate and choose actions</p>
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
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium capitalize">{formData.certificateColor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Badge:</span>
                          <span className="font-medium">{formData.badge || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            // Save draft to localStorage
                            const draftData = {
                              ...formData,
                              savedAt: new Date().toISOString(),
                              status: 'draft'
                            };
                            localStorage.setItem(`certificate_draft_${formData.certificateId}`, JSON.stringify(draftData));
                            alert('Draft saved successfully!');
                          } catch (error) {
                            console.error('Error saving draft:', error);
                            alert('Error saving draft. Please try again.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            // Simulate NFT minting process
                            const nftData = {
                              certificateId: formData.certificateId,
                              studentName: formData.studentName,
                              courseName: formData.courseName,
                              issuer: formData.issuer,
                              issueDate: formData.issueDate,
                              metadata: {
                                description: formData.description,
                                grade: formData.grade,
                                badge: formData.badge,
                                color: formData.certificateColor
                              }
                            };
                            
                            // Simulate blockchain transaction
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Save NFT data to localStorage
                            const nftTransactions = JSON.parse(localStorage.getItem('nft_transactions') || '[]');
                            nftTransactions.push({
                              id: `nft_${Date.now()}`,
                              type: 'mint',
                              certificateId: formData.certificateId,
                              amount: 1,
                              date: new Date().toISOString(),
                              status: 'completed',
                              hash: `0x${Math.random().toString(16).substr(2, 8)}`,
                              ...nftData
                            });
                            localStorage.setItem('nft_transactions', JSON.stringify(nftTransactions));
                            
                            alert(`NFT minted successfully!\nTransaction Hash: ${nftTransactions[nftTransactions.length - 1].hash}\nCertificate ID: ${formData.certificateId}`);
                          } catch (error) {
                            console.error('Error minting NFT:', error);
                            alert('Error minting NFT. Please try again.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Minting...
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4" />
                            Mint NFT
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            
                            // Create a new window for PDF generation
                            const printWindow = window.open('', '_blank');
                            if (!printWindow) {
                              alert('Please allow popups to generate PDF');
                              return;
                            }
                            
                            // Generate HTML content for PDF
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Certificate - ${formData.certificateId}</title>
                                  <style>
                                    body { 
                                      margin: 0; 
                                      padding: 20px; 
                                      font-family: Arial, sans-serif;
                                      background: white;
                                    }
                                    .certificate {
                                      width: 800px;
                                      height: 600px;
                                      border: 2px solid black;
                                      position: relative;
                                      background: white;
                                    }
                                    .certificate-band {
                                      width: 80px;
                                      height: 100%;
                                      background: ${formData.certificateColor === 'blue' ? '#2563eb' : 
                                                   formData.certificateColor === 'green' ? '#16a34a' : 
                                                   formData.certificateColor === 'purple' ? '#9333ea' : '#eab308'};
                                      position: absolute;
                                      left: 0;
                                      top: 0;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                    }
                                    .certificate-text {
                                      transform: rotate(-90deg);
                                      color: white;
                                      font-weight: bold;
                                      font-size: 18px;
                                      letter-spacing: 2px;
                                    }
                                    .certificate-content {
                                      margin-left: 80px;
                                      padding: 40px;
                                      height: 100%;
                                      position: relative;
                                    }
                                    .certificate-title {
                                      text-align: center;
                                      margin-bottom: 40px;
                                    }
                                    .student-name {
                                      font-size: 36px;
                                      font-weight: bold;
                                      color: ${formData.certificateColor === 'blue' ? '#2563eb' : 
                                              formData.certificateColor === 'green' ? '#16a34a' : 
                                              formData.certificateColor === 'purple' ? '#9333ea' : '#ea580c'};
                                      text-align: center;
                                      margin: 20px 0;
                                    }
                                    .course-info {
                                      text-align: center;
                                      margin: 20px 0;
                                    }
                                    .issuer-info {
                                      text-align: center;
                                      font-weight: bold;
                                      margin: 20px 0;
                                    }
                                    .signatures {
                                      position: absolute;
                                      bottom: 40px;
                                      left: 40px;
                                      right: 40px;
                                    }
                                    .signature-row {
                                      display: flex;
                                      justify-content: space-between;
                                    }
                                    .signature-item {
                                      text-align: center;
                                      width: 45%;
                                    }
                                    .signature-line {
                                      border-bottom: 2px solid #333;
                                      height: 40px;
                                      margin-bottom: 10px;
                                    }
                                    .qr-code {
                                      position: absolute;
                                      bottom: 20px;
                                      left: 20px;
                                      width: 60px;
                                      height: 60px;
                                      border: 1px solid #ccc;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      font-size: 10px;
                                      color: #666;
                                    }
                                    .badge {
                                      position: absolute;
                                      top: 20px;
                                      right: 20px;
                                      width: 80px;
                                      height: 80px;
                                      background: #fbbf24;
                                      border-radius: 50%;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      font-weight: bold;
                                      font-size: 12px;
                                      text-align: center;
                                    }
                                    @media print {
                                      body { margin: 0; }
                                      .certificate { 
                                        width: 100%; 
                                        height: 100vh; 
                                        border: none;
                                      }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="certificate">
                                    <div class="certificate-band">
                                      <div class="certificate-text">CERTIFICATE</div>
                                    </div>
                                    <div class="certificate-content">
                                      ${formData.badge ? `<div class="badge">${formData.badge}</div>` : ''}
                                      <div class="certificate-title">
                                        <p>This is certify that</p>
                                        <div class="student-name">${formData.studentName || 'Student Name'}</div>
                                        <p>has successfully completed</p>
                                        <div class="course-info">
                                          <strong>${formData.courseName || 'Course Name'}</strong>
                                        </div>
                                        <div class="issuer-info">
                                          On Behalf of ${formData.issuer || 'Institution Name'}
                                        </div>
                                        <p>${formData.description || 'Certificate of completion'}</p>
                                        <p><strong>Date: ${formData.issueDate || new Date().toLocaleDateString()}</strong></p>
                                      </div>
                                      <div class="signatures">
                                        <p style="font-weight: bold; margin-bottom: 20px;">VERIFIED BY</p>
                                        <div class="signature-row">
                                          <div class="signature-item">
                                            <div class="signature-line"></div>
                                            <p><strong>${formData.signatory1Name || 'Papry Naznin'}</strong></p>
                                            <p>${formData.signatory1Title || 'President'}</p>
                                          </div>
                                          <div class="signature-item">
                                            <div class="signature-line"></div>
                                            <p><strong>${formData.signatory2Name || 'Die Erlan'}</strong></p>
                                            <p>${formData.signatory2Title || 'Director'}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="qr-code">
                                        QR Code<br/>
                                        ${formData.certificateId}
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
                            
                            alert('PDF generation started! The print dialog will open shortly.');
                          } catch (error) {
                            console.error('Error generating PDF:', error);
                            alert('Error generating PDF. Please try again.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Download PDF
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            
                            // Validate required fields
                            if (!formData.studentEmail) {
                              alert('Please enter student email address first.');
                              return;
                            }
                            
                            // Simulate sending email
                            const emailData = {
                              to: formData.studentEmail,
                              subject: `Certificate of Completion - ${formData.courseName}`,
                              certificateId: formData.certificateId,
                              studentName: formData.studentName,
                              courseName: formData.courseName,
                              issuer: formData.issuer,
                              issueDate: formData.issueDate,
                              verificationLink: `${window.location.origin}/verify/${formData.certificateId}`
                            };
                            
                            // Simulate email sending process
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Save email record to localStorage
                            const emailRecords = JSON.parse(localStorage.getItem('email_records') || '[]');
                            emailRecords.push({
                              id: `email_${Date.now()}`,
                              type: 'certificate_sent',
                              ...emailData,
                              sentAt: new Date().toISOString(),
                              status: 'sent'
                            });
                            localStorage.setItem('email_records', JSON.stringify(emailRecords));
                            
                            alert(`Certificate sent successfully to ${formData.studentEmail}!\n\nStudent will receive:\n- Certificate PDF\n- Verification link\n- Certificate ID: ${formData.certificateId}`);
                          } catch (error) {
                            console.error('Error sending certificate:', error);
                            alert('Error sending certificate. Please try again.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading || !formData.studentEmail}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            Send to Student
                          </>
                        )}
                      </button>
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
                        type="button"
                        onClick={handleSubmit}
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
              </div>
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

