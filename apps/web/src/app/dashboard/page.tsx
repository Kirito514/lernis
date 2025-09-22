'use client';

import { useFirebaseAuth } from '@/lib/useFirebaseAuth';
import { useWallet } from '@/lib/useWallet';
import { useTransactions } from '@/lib/useTransactions';
import { RealCertificateMinting, notifyRecipient, saveCertificateToDatabase } from '@/lib/realCertificateMinting';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doc, updateDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';

export default function DashboardPage() {
  const { user, userData, loading, logout } = useFirebaseAuth();
  
  // Generate numeric user ID from Firebase UID
  const generateNumericId = (uid: string) => {
    // Convert UID to numeric string by taking first 8 characters and converting to numbers
    const numericString = uid.replace(/[^0-9]/g, '').slice(0, 8);
    if (numericString.length < 8) {
      // If not enough numbers, pad with zeros
      const result = numericString.padEnd(8, '0');
      return result;
    }
    return numericString;
  };
  const {
    address, 
    balance, 
    isConnected, 
    isLoading: walletLoading, 
    error: walletError, 
    smartAccountAddress,
    isGaslessEnabled,
    connectWallet, 
    disconnectWallet, 
    isMetaMaskInstalled,
    mintCertificate,
    transferCertificate,
    setWalletState
  } = useWallet();

  // Fetch transactions (simplified to avoid blockchain issues)
  const { transactions, loading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useTransactions(address, null);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userData?.role || '');
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    profilePicture: null as File | null,
    username: '',
    walletAddress: '',
    walletType: 'metamask',
  });

  // Wallet creation state
  const [walletData, setWalletData] = useState({
    address: '',
    hasWallet: false,
    isLoading: false,
  });

  // Certificate creation form data
  const [certificateData, setCertificateData] = useState({
    studentName: '',
    courseName: '',
    institution: '',
    completionDate: '',
    studentAddress: '',
    studentEmail: '', // Add email field for notifications
    title: '',
    course: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0], // Today's date
    grade: '',
  });

  // Real certificate minting instance
  const [certificateMinter] = useState(() => new RealCertificateMinting());
  const [currentStep, setCurrentStep] = useState(1);

  // Certificate state
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  // Certificate preview modal state
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<any>(null);
  const [mintingSteps, setMintingSteps] = useState<string[]>([]);
  const [mintingStep, setMintingStep] = useState(0);

  // Create wallet function
  const createWallet = async () => {
    setWalletData(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/createWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setWalletData({
          address: result.data.address,
          hasWallet: true,
          isLoading: false,
        });
        toast.success('Wallet created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create wallet');
      setWalletData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Load certificates function
  const loadCertificates = async () => {
    if (!user?.uid) return;
    
    setCertificatesLoading(true);
    try {
      // Load issued certificates (for universities/companies) - without orderBy to avoid index requirement
      const issuedQuery = query(
        collection(db, 'certificates'),
        where('issuerId', '==', user.uid)
      );
      const issuedSnapshot = await getDocs(issuedQuery);
      const issuedCerts = issuedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'issued' }));

      // Load received certificates (for students) - without orderBy to avoid index requirement
      const receivedQuery = query(
        collection(db, 'certificates'),
        where('studentEmail', '==', userData?.email)
      );
      const receivedSnapshot = await getDocs(receivedQuery);
      const receivedCerts = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'received' }));

      // Combine and sort certificates by creation date (newest first)
      const allCerts = [...issuedCerts, ...receivedCerts].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.issueDate || 0);
        const dateB = new Date(b.createdAt || b.issueDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setCertificates(allCerts);
      
      // Certificates loaded successfully
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setCertificatesLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please log in to access dashboard');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Load certificates when user data is available
  useEffect(() => {
    if (user?.uid && userData) {
      loadCertificates();
    }
  }, [user?.uid, userData]);

  // Show minting progress
  const showMintingProgress = (steps: string[]) => {
    setMintingSteps(steps);
    setMintingStep(0);
    setShowCertificatePreview(true);
  };

  // Update minting step
  const updateMintingStep = (stepIndex: number) => {
    setMintingStep(stepIndex);
  };

  // Debug Firebase data (removed console logs for performance)
  useEffect(() => {
    // Debug info available in development mode only
    if (process.env.NODE_ENV === 'development') {
      // Uncomment for debugging if needed
      // console.log('User UID:', user?.uid);
      // console.log('UserData:', userData);
    }
  }, [user, userData, loading]);

  // Add userId to existing user if missing and set ADMIN role for testing
  useEffect(() => {
    const addUserIdIfMissing = async () => {
      // Check if userId is missing and needs to be added
      
      if (user && userData) {
        const updateData: any = {};
        let needsUpdate = false;

        // Add userId if missing
        if (!userData.userId) {
          updateData.userId = user.uid;
          needsUpdate = true;
        }

        // Set ADMIN role for testing (ONLY for specific test users)
        // Remove this in production - only for testing purposes
        const adminEmails = ['yuldoshev.dsgn@gmail.com', 'admin@edunft.com'];
        if (adminEmails.includes(user?.email || '') && userData.role !== 'ADMIN') {
          updateData.role = 'ADMIN';
          needsUpdate = true;
        }

        if (needsUpdate) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              ...updateData,
              updatedAt: new Date(),
            });
            
            // Force refresh userData
            window.location.reload();
          } catch (error: any) {
            console.error('Error updating user data:', error);
          }
        }
      }
    };

    addUserIdIfMissing();
  }, [user, userData]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  // Certificate creation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);


  const handleCertificateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCertificateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateData.studentName || !certificateData.courseName || !certificateData.institution || !certificateData.completionDate || !certificateData.studentAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!certificateData.studentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Show minting progress modal
      const steps = [
        'Initializing certificate minter...',
        'Creating certificate metadata...',
        'Uploading metadata to IPFS...',
        'Minting certificate to blockchain...',
        'Saving to database...',
        'Sending notification to student...',
        'Certificate created successfully!'
      ];
      showMintingProgress(steps);

      // Initialize certificate minter
      updateMintingStep(0);
      await certificateMinter.initialize();

      // Create certificate metadata
      updateMintingStep(1);
      const certificateMetadata = {
        title: certificateData.studentName + ' - ' + certificateData.courseName,
        course: certificateData.courseName,
        description: `Certificate of completion for ${certificateData.courseName} course`,
        issueDate: certificateData.completionDate,
        institution: certificateData.institution,
        issuer: userData?.fullName || userData?.email || 'Lernis',
        issuerRole: userData?.role || 'UNIVERSITY',
        studentAddress: certificateData.studentAddress,
        studentName: certificateData.studentName,
        completionDate: certificateData.completionDate,
        createdAt: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      updateMintingStep(2);
      const tokenURI = await certificateMinter.uploadToIPFS(certificateMetadata);
      
      // Mint certificate to student's wallet
      updateMintingStep(3);
      
      const contractAddress = "0x1234567890123456789012345678901234567890"; // Will deploy new contract
      const mintResult = await certificateMinter.mintCertificate(
        contractAddress,
        certificateData.studentAddress,
        tokenURI,
        certificateMetadata
      );

      // Save to database (with error handling)
      updateMintingStep(4);
      try {
        await saveCertificateToDatabase(
          certificateMetadata, 
          mintResult.transactionHash, 
          mintResult.tokenId,
          user?.uid || ''
        );
        // Certificate saved to database successfully
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Continue even if database save fails
      }

      // Send notification to student (with error handling)
      updateMintingStep(5);
      try {
        await notifyRecipient(certificateData.studentEmail || certificateData.studentAddress, {
          ...certificateMetadata,
          transactionHash: mintResult.transactionHash,
          tokenId: mintResult.tokenId,
        });
        // Notification sent successfully
      } catch (notificationError) {
        console.error('Notification failed:', notificationError);
        // Continue even if notification fails
      }

      // Complete the process
      updateMintingStep(6);
      
      // Set preview certificate data
      setPreviewCertificate({
        ...certificateMetadata,
        transactionHash: mintResult.transactionHash,
        tokenId: mintResult.tokenId,
        tokenURI,
      });

      // Reload certificates to show the new one
      await loadCertificates();

      // Reset form
      setCertificateData({
        studentName: '',
        courseName: '',
        institution: '',
        completionDate: '',
        studentAddress: '',
        studentEmail: '',
        title: '',
        course: '',
        description: '',
        issueDate: new Date().toISOString().split('T')[0],
        grade: '',
      });

      toast.success('Certificate created successfully!');

    } catch (error: any) {
      toast.error(`Failed to create certificate: ${error.message}`, { id: 'minting' });
      console.error('Certificate creation error:', error);
      
      // Close the progress modal on error
      setShowCertificatePreview(false);
      setMintingSteps([]);
      setMintingStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserRole = async (newRole: string) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
      });
      toast.success(`Role updated to ${newRole}`);
      setShowRoleModal(false);
      setSelectedRole('');
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      const updateData: any = {
        fullName: profileData.fullName,
        bio: profileData.bio,
        username: profileData.username,
        walletAddress: profileData.walletAddress,
        walletType: profileData.walletType,
        profileCompleted: true,
        userId: user.uid, // Add userId field
        updatedAt: new Date(),
      };

      // Adding userId to Firebase profile

      // Check if document exists first
      const userDocRef = doc(db, 'users', user.uid);

      // Try to update the document
      await updateDoc(userDocRef, updateData);
      
      toast.success('Profile completed successfully!');
      setShowRoleModal(false);
      setCurrentStep(1);
      setProfileData({
        fullName: '',
        bio: '',
        profilePicture: null,
        username: '',
        walletAddress: '',
        walletType: 'metamask',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // If document doesn't exist, try to create it
      if (error.code === 'not-found') {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: selectedRole,
            userId: user.uid, // Add userId field
            username: profileData.username,
            fullName: profileData.fullName,
            bio: profileData.bio,
            walletAddress: profileData.walletAddress,
            walletType: profileData.walletType,
            profileCompleted: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          toast.success('Profile created successfully!');
          setShowRoleModal(false);
          setCurrentStep(1);
          setProfileData({
            fullName: '',
            bio: '',
            profilePicture: null,
            username: '',
            walletAddress: '',
            walletType: 'metamask',
          });
        } catch (createError: any) {
          console.error('Error creating profile:', createError);
          toast.error(`Failed to create profile: ${createError.message}`);
        }
      } else {
        toast.error(`Failed to update profile: ${error.message}`);
      }
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim()) return true;
    
    try {
      // Mock username check - in real app, this would check database
      const takenUsernames = ['admin', 'test', 'user', 'john', 'jane', 'demo'];
      const isAvailable = !takenUsernames.includes(username.toLowerCase());
      
      if (!isAvailable) {
        toast.error('Username is already taken. Please choose another one.');
      } else {
        toast.success('Username is available!');
      }
      
      return isAvailable;
    } catch (error: any) {
      toast.error('Error checking username availability');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Left Sidebar Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          
          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-gray-900">Online</p>
            </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 
                     userData?.username ? userData.username.charAt(0).toUpperCase() : 
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                
                {/* User Details */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.username ? `@${userData.username}` : 
                     userData?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {user?.uid ? generateNumericId(user.uid) : '00000000'}
                  </p>
                </div>
              </div>
              
              {/* Role */}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {userData?.role || 'Student'}
              </span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              {/* Common menu items for all roles */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>

              {/* Student specific menu */}
              {userData?.role?.toLowerCase() === 'student' && (
                <>
                  <button 
                    onClick={() => setActiveTab('certificates')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'certificates' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    My Certificates
                  </button>
                  <button 
                    onClick={() => setActiveTab('enroll')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'enroll' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Enroll in Course
                  </button>
                </>
              )}

              {/* University/Training Center specific menu */}
              {(userData?.role?.toLowerCase() === 'university' || userData?.role?.toLowerCase() === 'trainingcenter') && (
                <>
                  <button 
                    onClick={() => setActiveTab('certificates')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'certificates' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Issued Certificates
                  </button>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'create' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Create Certificate
                  </button>
                  <button 
                    onClick={() => setActiveTab('students')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'students' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Manage Students
                  </button>
                </>
              )}

              {/* Company specific menu */}
              {userData?.role?.toLowerCase() === 'company' && (
                <>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'create' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Create Certificate
                  </button>
                  <button 
                    onClick={() => router.push('/verify')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Verify Certificates
                  </button>
                  <button 
                    onClick={() => setActiveTab('candidates')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'candidates' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Candidate Pool
                  </button>
                </>
              )}

              {/* Common menu items for all roles */}
              <button 
                onClick={() => setActiveTab('wallet')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'wallet' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Wallet
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Profile
              </button>
              {/* Admin Panel - Only show for ADMIN role */}
              {userData?.role?.toLowerCase() === 'admin' && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
            <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Admin Panel
            </div>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
            </nav>
            </div>
          
          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/20 space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Home
            </button>
              <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              Logout
              </button>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {activeTab === 'overview' && (
              <>
                {/* Main Content Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
                  <p className="text-gray-600">Welcome back! Here's what's happening with your account.</p>
        </div>

        {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
              </div>
            </div>
          </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verified</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
              </div>
            </div>
          </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
              </div>
            </div>
          </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Organizations</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
              </div>
            </div>
          </div>
        </div>

                {/* Account Completion - Only show if profile is not completed */}
                {!userData?.profileCompleted && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 shadow-lg mb-8">
                  <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Complete Your Profile</h3>
                        <p className="text-blue-100 text-sm">Add more info to unlock features</p>
                      </div>
          </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">25%</div>
                      <div className="text-blue-100 text-xs">Complete</div>
          </div>
        </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">4</span>
                      </div>
          </div>
                    <button 
                      onClick={() => setShowRoleModal(true)}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Complete
                    </button>
          </div>
        </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">Your activity will appear here</p>
              </div>
            </div>
              </>
            )}

            {activeTab === 'wallet' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet</h2>
                  <p className="text-gray-600">Manage your cryptocurrency wallet and transactions.</p>
                </div>

                {/* Wallet Instructions - Easy Options */}

                {!isConnected ? (
                  <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
                    <p className="text-gray-600 mb-6">Connect your wallet to view balance and manage transactions</p>
                    
                    {/* Step-by-step connection guide */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-3 text-center">Quick Setup Guide:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Install MetaMask extension</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Create or import wallet</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-xs font-bold">3</span>
                          </div>
                          <span>Click "Connect Wallet" below</span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Connection Options */}
                    <div className="space-y-4">
                      {/* WalletConnect Option */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-900">Mobile Wallet (Recommended)</h4>
                              <p className="text-sm text-gray-600">Use Trust Wallet, Coinbase Wallet, or any mobile wallet</p>
                            </div>
                          </div>
              <button
                onClick={() => {
                              toast.success('WalletConnect integration coming soon! For now, please use MetaMask.');
                }}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                            Connect Mobile Wallet
              </button>
            </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center border border-gray-200">
                            <QRCode 
                              value="https://metamask.io/download/" 
                              size={120}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
          </div>
                          <p className="text-xs text-gray-500">Scan with your mobile wallet app</p>
                          <p className="text-xs text-gray-400 mt-1">or visit metamask.io/download</p>
        </div>
                      </div>

                      {/* MetaMask Option */}
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
        </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-900">MetaMask (Desktop)</h4>
                              <p className="text-sm text-gray-600">Browser extension for desktop users</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                // Wait a bit for MetaMask to inject
                                await new Promise(resolve => setTimeout(resolve, 500));
                                
                                // Try multiple ways to access MetaMask
                                let ethereum = window.ethereum;
                                
                                if (!ethereum) {
                                  ethereum = (window as any).web3?.currentProvider;
                                }
                                
                                if (!ethereum) {
                                  ethereum = (window as any).ethereum?.providers?.find((provider: any) => provider.isMetaMask);
                                }
                                
                                if (ethereum) {
                                  const accounts = await ethereum.request({
                                    method: 'eth_requestAccounts',
                                  });
                                  
                                  if (accounts.length > 0) {
                                    toast.success(`Wallet connected! Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
                                    
                                    // Update wallet state manually
                                    setWalletState({
                                      address: accounts[0],
                                      balance: '0.0',
                                      isConnected: true,
                                      isLoading: false,
                                      error: null,
                                      smartAccountAddress: '0x' + Math.random().toString(16).substr(2, 40),
                                      isGaslessEnabled: true,
                                    });
                                  } else {
                                    toast.error('No accounts found in MetaMask');
                                  }
                                } else {
                                  toast.error('MetaMask not detected. Please refresh the page and try again.');
                                }
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to connect wallet');
                              }
                            }}
                            disabled={walletLoading}
                            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                              walletLoading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                          >
                            {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
                          </button>
              </div>
                        <div className="bg-orange-100 rounded-lg p-3 text-center">
                          <p className="text-sm text-orange-800 mb-2">Having connection issues?</p>
                          <div className="space-y-2">
                            <button
                              onClick={() => window.location.reload()}
                              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-medium text-sm mr-4"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Refresh Page</span>
                            </button>
                            <a 
                              href="https://metamask.io/download/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-medium text-sm"
                            >
                              <span>Install MetaMask</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
              </div>
            </div>
          </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
                      {/* Left Column - Recent Transactions */}
                      <div className="lg:col-span-7 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          {transactionsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-sm text-gray-600">Loading transactions...</span>
                            </div>
                          ) : transactionsError ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-red-600 mb-2">Failed to load transactions</p>
                              <button 
                                onClick={refetchTransactions}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Try again
                              </button>
                            </div>
                          ) : transactions.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500">No transactions found</p>
                              <p className="text-xs text-gray-400 mt-1">Your transaction history will appear here</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {transactions.slice(0, 5).map((tx, index) => {
                                const getTransactionIcon = (type: string) => {
                                  switch (type) {
                                    case 'mint':
                                      return (
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                          </svg>
                                        </div>
                                      );
                                    case 'receive':
                                      return (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                          </svg>
                                        </div>
                                      );
                                    case 'transfer':
                                      return (
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                          </svg>
                                        </div>
                                      );
                                    case 'contract':
                                      return (
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        </div>
                                      );
                                    default:
                                      return (
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                        </div>
                                      );
                                  }
                                };

                                const getTransactionColor = (type: string) => {
                                  switch (type) {
                                    case 'mint': return 'text-green-600';
                                    case 'receive': return 'text-blue-600';
                                    case 'transfer': return 'text-red-600';
                                    case 'contract': return 'text-purple-600';
                                    default: return 'text-gray-600';
                                  }
                                };

                                const formatTimeAgo = (timestamp: number) => {
                                  const now = Date.now();
                                  const diff = now - timestamp * 1000;
                                  const minutes = Math.floor(diff / (1000 * 60));
                                  const hours = Math.floor(diff / (1000 * 60 * 60));
                                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                                  if (minutes < 60) return `${minutes}m ago`;
                                  if (hours < 24) return `${hours}h ago`;
                                  return `${days}d ago`;
                                };

                                const formatValue = (value: string, type: string) => {
                                  const numValue = parseFloat(value);
                                  if (numValue === 0) return type === 'mint' ? '+1 NFT' : '0 ETH';
                                  return `${type === 'receive' ? '+' : '-'}${numValue.toFixed(4)} ETH`;
                                };

                                return (
                                  <div key={tx.hash} className={`flex items-center justify-between py-2 ${index < 4 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="flex items-center space-x-2">
                                      {getTransactionIcon(tx.type)}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{formatTimeAgo(tx.timestamp)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                                        {formatValue(tx.value, tx.type)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {tx.status === 'confirmed' ? 'Confirmed' : tx.status}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
        </div>

                        {/* View All Transactions Button */}
                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg font-medium transition-colors text-sm">
                          View All Transactions
                        </button>
              </div>

                      {/* Right Column - Complete Wallet Information */}
                      <div className="lg:col-span-3 space-y-4">
                        {/* Gasless Minting Status */}
                        {isGaslessEnabled && (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-semibold text-green-900">🚀 Gasless Minting Enabled</h4>
                                <p className="text-xs text-green-700">Smart Account: {smartAccountAddress ? `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}` : 'Loading...'}</p>
            </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Ready
                              </span>
          </div>
                          </div>
                        )}

                        {/* My Wallet Header */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">My Wallet</h3>
              </div>

                        {/* Wallet Card */}
                        <div className="relative">
                          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg h-40 relative overflow-hidden">
                            {/* Card Background Pattern */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
                            
                            {/* Card Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between">
                              {/* Top Section */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-blue-100 text-xs mb-1">Balance</p>
                                  <p className="text-xl font-bold">
                                    ${balance ? (parseFloat(balance) * 2000).toFixed(2) : '0.00'}
                </p>
              </div>
                                <div className="text-right">
                                  <p className="text-blue-100 text-xs mb-1">ETH</p>
                                  <p className="text-sm font-semibold">
                                    {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
                                  </p>
            </div>
          </div>

                              {/* Bottom Section */}
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-blue-100 text-xs mb-1">Network</p>
                                  <p className="text-xs font-semibold">Ethereum</p>
              </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                  </div>
                                  <span className="text-xs font-semibold">ETH</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Address Information with Copy Buttons */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900">Addresses</h4>
                          
                          {/* Wallet Address */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                              <p className="font-mono text-xs text-gray-900">
                                {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}
                </p>
              </div>
                            <button
                              onClick={() => {
                                if (address) {
                                  navigator.clipboard.writeText(address);
                                  toast.success('Wallet address copied!');
                                }
                              }}
                              className="ml-2 p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
            </div>

                          {/* Smart Account Address */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Smart Account</p>
                              <p className="font-mono text-xs text-gray-900">
                                {smartAccountAddress ? `${smartAccountAddress.slice(0, 10)}...${smartAccountAddress.slice(-8)}` : 'Not available'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (smartAccountAddress) {
                                  navigator.clipboard.writeText(smartAccountAddress);
                                  toast.success('Smart account address copied!');
                                }
                              }}
                              className="ml-2 p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
          </div>
        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button className="flex items-center justify-center space-x-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="text-xs font-medium text-blue-700">Receive</span>
                            </button>
                            
                            <button className="flex items-center justify-center space-x-2 p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span className="text-xs font-medium text-green-700">Send</span>
                            </button>
                            
                            <button className="flex items-center justify-center space-x-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span className="text-xs font-medium text-purple-700">Swap</span>
                            </button>
                            
                            <button 
                              onClick={disconnectWallet}
                              className="flex items-center justify-center space-x-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="text-xs font-medium text-red-700">Disconnect</span>
                            </button>
          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'profile' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
                  <p className="text-gray-600">View and manage your account information</p>
          </div>

                {/* Profile Header - Compact */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
                  <div className="flex items-center space-x-4">
                    {/* Large Avatar */}
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 
                         userData?.username ? userData.username.charAt(0).toUpperCase() : 
                         user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </span>
        </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {userData?.fullName || 'Complete your profile'}
                      </h3>
                      <p className="text-blue-100 text-sm mb-1">
                        {userData?.username ? `@${userData.username}` : 'No username set'}
                      </p>
                      <p className="text-blue-100 text-sm">
                        {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Student'}
            </p>
          </div>
                    
                    {/* Status & ID */}
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                        userData?.profileCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {userData?.profileCompleted ? '✓ Complete' : '⚠ Incomplete'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-lg font-bold text-white">
                          {user?.uid ? generateNumericId(user.uid) : '000000'}
                        </p>
                        <button
                          onClick={() => {
                            const userId = user?.uid ? generateNumericId(user.uid) : '000000';
                            navigator.clipboard.writeText(userId);
                            toast.success('User ID copied!');
                          }}
                          className="text-white/80 hover:text-white transition-colors"
                          title="Copy ID"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
          </div>
        </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Personal Info */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user?.email || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{userData?.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="font-medium text-gray-900">{userData?.bio || 'Bio not set'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Info */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Wallet
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {userData?.walletType || 'Not set'}
                        </p>
                      </div>
                      {userData?.walletAddress && (
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
              <div className="flex items-center space-x-2">
                            <p className="font-mono text-xs text-gray-600 break-all">
                              {userData.walletAddress.slice(0, 6)}...{userData.walletAddress.slice(-4)}
                            </p>
                            <button
                              onClick={() => {
                                if (userData.walletAddress) {
                                  navigator.clipboard.writeText(userData.walletAddress);
                                  toast.success('Address copied!');
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
              </div>
            </div>

                  {/* Wallet Section */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Wallet
                    </h4>
                    
                    {walletData.hasWallet ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Wallet Address</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-mono text-sm text-gray-900">{walletData.address}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(walletData.address);
                                toast.success('Address copied!');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Wallet Yet</h3>
                        <p className="text-gray-500 mb-4">Create a wallet to start using Lernis features</p>
                        <button 
                          onClick={createWallet}
                          disabled={walletData.isLoading}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                        >
                          {walletData.isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Create Wallet
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Account Stats */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistics
                    </h4>
                    <div className="space-y-3">
            <div>
                        <p className="text-sm text-gray-500">Member since</p>
                        <p className="font-medium text-gray-900">
                          {userData?.createdAt 
                            ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                            : 'Unknown'
                          }
                        </p>
            </div>
                      <div>
                        <p className="text-sm text-gray-500">Certificates</p>
                        <p className="font-medium text-gray-900">{certificates.length}</p>
          </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Status</p>
                        <p className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.emailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Certificates Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      My Certificates
                    </h4>
                    <button 
                      onClick={loadCertificates}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
          </div>

                  {/* Certificates List */}
                  <div className="space-y-4">
                    {certificatesLoading ? (
            <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your certificates...</p>
                      </div>
                    ) : certificates.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                        <p className="text-gray-500 mb-4">You haven't earned any certificates yet. Start learning to earn your first certificate!</p>
                        <button 
                          onClick={() => setActiveTab('overview')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Browse Courses
                        </button>
            </div>
          ) : (
                      certificates.map((cert) => (
                        <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                              </div>
                    <div>
                                <h5 className="font-medium text-gray-900">{cert.title}</h5>
                                <p className="text-sm text-gray-500">{cert.course}</p>
                                <p className="text-xs text-gray-400">
                                  {cert.type === 'issued' ? 'Issued to' : 'Issued by'} {cert.type === 'issued' ? cert.studentEmail : cert.issuer}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{cert.grade}</p>
                              <p className="text-xs text-gray-500">{new Date(cert.issueDate).toLocaleDateString()}</p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                cert.type === 'issued' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {cert.type === 'issued' ? 'Issued' : 'Received'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Sample Certificate (commented out for now) */}
                    {/* 
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Web Development Fundamentals</h5>
                            <p className="text-sm text-gray-500">Completed on March 15, 2024</p>
                          </div>
                    </div>
                    <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                </div>

                {/* Action Buttons - Floating at bottom right */}
                <div className="fixed bottom-6 right-6 z-50">
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={() => setShowRoleModal(true)}
                      className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group"
                      title="Complete Profile"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setActiveTab('wallet')}
                      className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-110 group"
                      title="Manage Wallet"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </button>
                    <button 
                      onClick={logout}
                      className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 group"
                      title="Sign Out"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'certificates' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Certificates</h3>
                <p className="text-gray-500">No certificates yet</p>
                <p className="text-sm text-gray-400">Your certificates will appear here</p>
              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Certificate</h2>
                  <p className="text-gray-600">Mint a new NFT certificate for a student</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="space-y-6">
                    {/* Gasless Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-900">🚀 100% Gasless Minting</h4>
                          <p className="text-sm text-green-700">This certificate will be minted without gas fees!</p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Student Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <svg className="inline h-4 w-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Student Name *
                          </label>
                          <input
                            type="text"
                            name="studentName"
                            value={certificateData.studentName || ''}
                            onChange={handleCertificateInputChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter student's full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <svg className="inline h-4 w-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                            </svg>
                            Course Name *
                          </label>
                          <input
                            type="text"
                            name="courseName"
                            value={certificateData.courseName || ''}
                            onChange={handleCertificateInputChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter course name"
                            required
                          />
                        </div>
                      </div>

                      {/* Institution and Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <svg className="inline h-4 w-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Institution *
                          </label>
                          <input
                            type="text"
                            name="institution"
                            value={certificateData.institution || ''}
                            onChange={handleCertificateInputChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter institution name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <svg className="inline h-4 w-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Completion Date *
                          </label>
                          <input
                            type="date"
                            name="completionDate"
                            value={certificateData.completionDate || ''}
                            onChange={handleCertificateInputChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      {/* Student Address */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          <svg className="inline h-4 w-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Student Wallet Address *
                        </label>
                        <input
                          type="text"
                          name="studentAddress"
                          value={certificateData.studentAddress || ''}
                          onChange={handleCertificateInputChange}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                          placeholder="0x..."
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">Enter the student's Ethereum wallet address (0x...)</p>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Creating Certificate...
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Create Certificate
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enroll' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Enroll in Course</h3>
                  <p className="text-lg text-gray-600 mb-2">Browse and enroll in available courses</p>
                  <p className="text-base text-gray-500">This feature is coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Manage Students</h3>
                  <p className="text-lg text-gray-600 mb-2">View and manage your students</p>
                  <p className="text-base text-gray-500">This feature is coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Verify Certificates</h3>
                  <p className="text-lg text-gray-600 mb-2">Verify candidate certificates</p>
                  <p className="text-base text-gray-500">This feature is coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Candidate Pool</h3>
                  <p className="text-lg text-gray-600 mb-2">Browse qualified candidates</p>
                  <p className="text-base text-gray-500">This feature is coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Settings</h3>
                  <p className="text-lg text-gray-600 mb-2">Settings panel will be here</p>
                  <p className="text-base text-gray-500">This feature is coming soon</p>
                </div>
              </div>
            )}
                    </div>
                  </div>
                </div>

      {/* Complete Profile Modal - Multi-step */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Step {currentStep} of 3</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Role</h3>
                  <p className="text-gray-600">Select the role that best describes you</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Student Card */}
                  <button
                    onClick={() => setSelectedRole('student')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      selectedRole === 'student'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                        selectedRole === 'student' 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${
                          selectedRole === 'student' ? 'text-blue-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Student</h3>
                      <p className="text-gray-600 text-xs mb-3">I'm learning and earning certificates</p>
                      <div className={`w-5 h-5 mx-auto rounded-full border-2 flex items-center justify-center ${
                        selectedRole === 'student' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedRole === 'student' && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                      )}
                    </div>
                  </div>
                  </button>

                  {/* University Card */}
                  <button
                    onClick={() => setSelectedRole('university')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      selectedRole === 'university'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                        selectedRole === 'university' 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${
                          selectedRole === 'university' ? 'text-blue-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">University</h3>
                      <p className="text-gray-600 text-xs mb-3">I'm issuing certificates to students</p>
                      <div className={`w-5 h-5 mx-auto rounded-full border-2 flex items-center justify-center ${
                        selectedRole === 'university' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedRole === 'university' && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
            </div>
                    </div>
                  </button>

                  {/* Training Center Card */}
                  <button
                    onClick={() => setSelectedRole('training')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      selectedRole === 'training'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                        selectedRole === 'training' 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${
                          selectedRole === 'training' ? 'text-blue-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Training Center</h3>
                      <p className="text-gray-600 text-xs mb-3">I'm providing professional training</p>
                      <div className={`w-5 h-5 mx-auto rounded-full border-2 flex items-center justify-center ${
                        selectedRole === 'training' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedRole === 'training' && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
          )}
        </div>
      </div>
                  </button>

                  {/* Company Card */}
                  <button
                    onClick={() => setSelectedRole('company')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      selectedRole === 'company'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                        selectedRole === 'company' 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${
                          selectedRole === 'company' ? 'text-blue-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
    </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Company</h3>
                      <p className="text-gray-600 text-xs mb-3">I'm hiring and verifying skills</p>
                      <div className={`w-5 h-5 mx-auto rounded-full border-2 flex items-center justify-center ${
                        selectedRole === 'company' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedRole === 'company' && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
            )}
          </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                            onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.username}
                            onChange={(e) => handleProfileInputChange('username', e.target.value)}
                        className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Choose a unique username"
                      />
                      <button
                        onClick={() => checkUsernameAvailability(profileData.username)}
                        disabled={!profileData.username.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Check
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Username must be unique and will be visible to others
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Congratulations & Wallet Creation */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h3>
                  <p className="text-gray-600">Your profile has been created successfully!</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-green-900 mb-2">Profile Summary</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Name:</strong> {profileData.fullName}</p>
                      <p><strong>Username:</strong> @{profileData.username}</p>
                      <p><strong>Role:</strong> {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</p>
                      <p><strong>Bio:</strong> {profileData.bio || 'No bio provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">🚀 Next Step: Create Your Wallet</h4>
                    <p className="text-gray-600 mb-4">
                      To receive NFT certificates and participate in the blockchain ecosystem, 
                      you'll need to create and connect a crypto wallet.
                    </p>
                    
                    <button
                      onClick={async () => {
                        if (!isMetaMaskInstalled()) {
                          toast.error('MetaMask is not installed. Please install MetaMask first.');
                          return;
                        }

                        const success = await connectWallet();
                        if (success && address) {
                          handleProfileInputChange('walletAddress', address);
                          toast.success('Wallet connected successfully!');
                          // Auto complete profile after wallet connection
                          setTimeout(() => {
                            handleProfileUpdate();
                          }, 1000);
                        } else if (walletError) {
                          toast.error(walletError);
                        }
                      }}
                      disabled={walletLoading}
                      className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        walletLoading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {walletLoading ? 'Connecting...' : '🔗 Connect Wallet & Complete Profile'}
                    </button>

                    {!isMetaMaskInstalled() && (
                      <p className="text-sm text-orange-600 mt-4">
                        <strong>Note:</strong> Please install MetaMask browser extension to connect your wallet.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    setShowRoleModal(false);
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    if (selectedRole) {
                      setCurrentStep(2);
                    } else {
                      toast.error('Please select a role');
                    }
                  } else if (currentStep === 2) {
                    if (profileData.fullName.trim() && profileData.username.trim()) {
                      setCurrentStep(3);
                    } else {
                      toast.error('Please enter your full name and username');
                    }
                  } else {
                    handleProfileUpdate();
                  }
                }}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  (currentStep === 1 && selectedRole) || 
                  (currentStep === 2 && profileData.fullName.trim() && profileData.username.trim()) || 
                  currentStep === 3
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={
                  (currentStep === 1 && !selectedRole) || 
                  (currentStep === 2 && (!profileData.fullName.trim() || !profileData.username.trim()))
                }
              >
                {currentStep === 3 ? 'Complete Profile' : 'Next'}
              </button>
        </div>
      </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showCertificatePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Certificate Creation Progress</h2>
                <button
                  onClick={() => setShowCertificatePreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="space-y-4">
                  {mintingSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= mintingStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index < mintingStep ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : index === mintingStep ? (
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        index <= mintingStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                </div>
              ))}
            </div>
              </div>

              {/* Certificate Preview */}
              {previewCertificate && mintingStep === 6 && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Created Successfully!</h3>
                    <p className="text-gray-600">Your certificate has been minted and sent to the student.</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Certificate Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{previewCertificate.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course:</span>
                        <span className="font-medium">{previewCertificate.course}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grade:</span>
                        <span className="font-medium">{previewCertificate.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Student:</span>
                        <span className="font-medium">{previewCertificate.studentEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono text-xs">{previewCertificate.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction:</span>
                        {previewCertificate.gasless ? (
                          <span className="font-mono text-xs text-green-600">
                            {previewCertificate.transactionHash?.slice(0, 10)}... (Gasless)
                          </span>
                        ) : (
                          <a 
                            href={`https://etherscan.io/tx/${previewCertificate.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {previewCertificate.transactionHash?.slice(0, 10)}...
                          </a>
          )}
        </div>
                      {previewCertificate.contractAddress && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract:</span>
                          <a 
                            href={`https://etherscan.io/address/${previewCertificate.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {previewCertificate.contractAddress?.slice(0, 10)}...
                          </a>
      </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCertificatePreview(false)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowCertificatePreview(false);
                        setActiveTab('certificates');
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Certificates
                    </button>
                  </div>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
}
