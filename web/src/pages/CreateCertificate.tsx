import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { certificateService } from '../services/firebaseService';
import { lernisTokenService } from '../services/lernisTokenService';
import QRCode from 'qrcode';
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
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Hash,
  Building
} from 'lucide-react';

export default function CreateCertificate() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0.00');
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  
  const { userData, currentUser } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Load token balance and check if user has enough tokens
  useEffect(() => {
    const loadTokenBalance = async () => {
      if (!currentUser) return;
      
      try {
        const balance = await lernisTokenService.getLernisTokenBalance(currentUser.uid);
        setTokenBalance(balance.balance);
        
        const hasEnough = await lernisTokenService.hasEnoughTokensForCertificate(currentUser.uid);
        setHasEnoughTokens(hasEnough);
      } catch (error) {
        console.error('Error loading token balance:', error);
      }
    };

    loadTokenBalance();
  }, [currentUser]);

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

  // Initialize certificate ID and generate QR code
  React.useEffect(() => {
    if (!formData.certificateId) {
      const newId = generateCertificateId();
      setFormData(prev => ({
        ...prev,
        certificateId: newId
      }));
    }
  }, []);

  // Generate QR code when certificate ID changes
  React.useEffect(() => {
    if (formData.certificateId) {
      const verificationUrl = `${window.location.origin}/verify/${formData.certificateId}`;
      QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [formData.certificateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Current user:', currentUser);
      console.log('User data:', userData);

      // Check if user has enough tokens
      if (!hasEnoughTokens) {
        alert(`Insufficient tokens! You need ${lernisTokenService.CERTIFICATE_CREATION_COST} EDU tokens to create a certificate. You currently have ${tokenBalance} EDU tokens.`);
        return;
      }

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
        
        // Also save to localStorage for verification purposes
        const localCertificate = {
          ...certificateData,
          id: certificateId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store in localStorage for verification
        const existingCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
        existingCertificates.push(localCertificate);
        localStorage.setItem('certificates', JSON.stringify(existingCertificates));
        
        // Deduct tokens for certificate creation
        const tokenResult = await lernisTokenService.deductTokensForCertificate(
          currentUser!.uid,
          certificateId,
          formData.studentName
        );

        if (tokenResult.success) {
          // Update local token balance
          const newBalance = (parseFloat(tokenBalance) - lernisTokenService.CERTIFICATE_CREATION_COST).toFixed(2);
          setTokenBalance(newBalance);
          setHasEnoughTokens(parseFloat(newBalance) >= lernisTokenService.CERTIFICATE_CREATION_COST);
          
          // Show success state
          setIsSuccess(true);
        } else {
          throw new Error(tokenResult.error || 'Failed to process token deduction');
        }
      } else {
        throw new Error('Failed to create certificate');
      }
      
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert(`Error creating certificate: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
    
    // Reload token balance to reflect the updated balance
    if (currentUser) {
      lernisTokenService.getLernisTokenBalance(currentUser.uid).then(balance => {
        setTokenBalance(balance.balance);
        setHasEnoughTokens(parseFloat(balance.balance) >= lernisTokenService.CERTIFICATE_CREATION_COST);
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


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
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-14 h-14" />
                ) : (
                  <QrCode className="h-12 w-12 text-gray-400" />
                )}
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
          {/* Token Cost Information */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Certificate Creation Cost</h3>
                      <p className="text-sm text-gray-600">Token required to create a certificate</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{lernisTokenService.CERTIFICATE_CREATION_COST} EDU</div>
                    <div className="text-sm text-gray-600">Required</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${hasEnoughTokens ? 'text-green-600' : 'text-red-600'}`}>
                      {tokenBalance} EDU
                    </div>
                    <div className="text-sm text-gray-600">Your Balance</div>
                  </div>
                  <div className="flex items-center">
                    {hasEnoughTokens ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Sufficient Balance</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-600">
                        <X className="h-5 w-5" />
                        <span className="font-medium">Insufficient Balance</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!hasEnoughTokens && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    You need {lernisTokenService.CERTIFICATE_CREATION_COST - parseFloat(tokenBalance)} more EDU tokens to create a certificate. 
                    <a href="/dashboard/buy-tokens" className="font-medium underline ml-1">Buy tokens here</a>
                  </p>
                </div>
              )}
            </div>
          </div>

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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">
                      {lernisTokenService.CERTIFICATE_CREATION_COST} EDU tokens deducted from your balance
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1 text-center">
                    Remaining balance: {tokenBalance} EDU tokens
                  </p>
                </div>
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
                            const newId = generateCertificateId();
                            setFormData(prev => ({ ...prev, certificateId: newId }));
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
                            
                            // Generate beautiful HTML content for PDF
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Certificate - ${formData.certificateId}</title>
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
                                      border: 2px solid ${formData.certificateColor === 'blue' ? '#3b82f6' : 
                                                       formData.certificateColor === 'green' ? '#10b981' : 
                                                       formData.certificateColor === 'purple' ? '#8b5cf6' : '#f59e0b'};
                                      border-radius: 15px;
                                      background: white;
                                    }
                                    
                                    .certificate-header {
                                      position: absolute;
                                      top: 0;
                                      left: 0;
                                      right: 0;
                                      height: 80px;
                                      background: linear-gradient(135deg, ${formData.certificateColor === 'blue' ? '#3b82f6' : 
                                                                           formData.certificateColor === 'green' ? '#10b981' : 
                                                                           formData.certificateColor === 'purple' ? '#8b5cf6' : '#f59e0b'} 0%, 
                                                                           ${formData.certificateColor === 'blue' ? '#1d4ed8' : 
                                                                           formData.certificateColor === 'green' ? '#059669' : 
                                                                           formData.certificateColor === 'purple' ? '#7c3aed' : '#d97706'} 100%);
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
                                      color: ${formData.certificateColor === 'blue' ? '#1e40af' : 
                                              formData.certificateColor === 'green' ? '#047857' : 
                                              formData.certificateColor === 'purple' ? '#6d28d9' : '#b45309'};
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
                                    
                                    .description {
                                      font-size: 16px;
                                      color: #6b7280;
                                      line-height: 1.6;
                                      margin: 20px 0;
                                      max-width: 600px;
                                      margin-left: auto;
                                      margin-right: auto;
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
                                    
                                    .badge {
                                      position: absolute;
                                      top: 30px;
                                      right: 30px;
                                      width: 100px;
                                      height: 100px;
                                      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                                      border-radius: 50%;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      font-weight: 700;
                                      font-size: 14px;
                                      text-align: center;
                                      color: #92400e;
                                      box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
                                      border: 3px solid #f59e0b;
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
                                      background: ${formData.certificateColor === 'blue' ? '#3b82f6' : 
                                                   formData.certificateColor === 'green' ? '#10b981' : 
                                                   formData.certificateColor === 'purple' ? '#8b5cf6' : '#f59e0b'};
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
                                      
                                      ${formData.badge ? `<div class="badge">${formData.badge}</div>` : ''}
                                      
                                      <div class="certificate-content">
                                        <div class="main-content">
                                          <p class="certificate-text">This is to certify that</p>
                                          <h2 class="student-name">${formData.studentName || 'Student Name'}</h2>
                                          <p class="certificate-text">has successfully completed the course</p>
                                          <h3 class="course-info">${formData.courseName || 'Course Name'}</h3>
                                          <p class="issuer-info">On behalf of ${formData.issuer || 'Institution Name'}</p>
                                          ${formData.description ? `<p class="description">${formData.description}</p>` : ''}
                                          <p class="date-info">Issued on ${formData.issueDate || new Date().toLocaleDateString()}</p>
                                        </div>
                                        
                                        <div class="signatures-section">
                                          <p class="verified-by">VERIFIED BY</p>
                                          <div class="signatures">
                                            <div class="signature-item">
                                              <div class="signature-line"></div>
                                              <p class="signature-name">${formData.signatory1Name || 'Papry Naznin'}</p>
                                              <p class="signature-title">${formData.signatory1Title || 'President'}</p>
                                            </div>
                                            <div class="signature-item">
                                              <div class="signature-line"></div>
                                              <p class="signature-name">${formData.signatory2Name || 'Die Erlan'}</p>
                                              <p class="signature-title">${formData.signatory2Title || 'Director'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div class="qr-section">
                                        <div class="qr-code">
                                          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;" />` : 'QR Code<br/>Verification'}
                                        </div>
                                        <div class="certificate-id">
                                          Certificate ID:<br/>
                                          ${formData.certificateId}
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
                        disabled={isLoading || !hasEnoughTokens}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasEnoughTokens 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : !hasEnoughTokens ? (
                          <>
                            <X className="h-4 w-4" />
                            Insufficient Tokens
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

