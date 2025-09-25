import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  User,
  Shield,
  Globe,
  Database,
  Key,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [isReauthing, setIsReauthing] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });
  
  // Form data states
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    organization: '',
    role: 'student'
  });
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  });
  
  const { currentUser, userData } = useAuth();

  // Initialize form data when userData is available
  React.useEffect(() => {
    if (userData) {
      setProfileData({
        displayName: userData.displayName || '',
        email: currentUser?.email || '',
        organization: userData.organization || '',
        role: userData.role || 'student'
      });
    }
  }, [userData, currentUser]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Firebase'ga ma'lumotlarni saqlash
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          displayName: profileData.displayName,
          organization: profileData.organization,
          role: profileData.role,
          updatedAt: new Date().toISOString()
        });
        
        showNotification('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSecuritySave = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      // Password update logic here
      showNotification('Password updated successfully!', 'success');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securityData.twoFactorEnabled
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Failed to update password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationSave = async () => {
    setIsLoading(true);
    try {
      // Notification settings save logic here
      showNotification('Notification settings updated!', 'success');
    } catch (error) {
      console.error('Error updating notifications:', error);
      showNotification('Failed to update notification settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  const handleReauthenticate = async () => {
    if (!reauthPassword) {
      showNotification('Please enter your password', 'error');
      return;
    }

    setIsReauthing(true);
    try {
      const { reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');
      
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, reauthPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        showNotification('Re-authentication successful!', 'success');
        setShowReauthModal(false);
        setReauthPassword('');
        
        // Re-authentication muvaffaqiyatli bo'lgach, delete account'ni davom ettirish
        setTimeout(() => {
          handleDeleteAccount();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error re-authenticating:', error);
      if (error.code === 'auth/wrong-password') {
        showNotification('Incorrect password. Please try again.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showNotification('Too many failed attempts. Please try again later.', 'error');
      } else {
        showNotification('Re-authentication failed. Please try again.', 'error');
      }
    } finally {
      setIsReauthing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showNotification('Please type "DELETE" to confirm account deletion', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      // Firebase'da foydalanuvchi ma'lumotlarini o'chirish
          const { doc, deleteDoc, collection, getDocs } = await import('firebase/firestore');
      const { deleteUser } = await import('firebase/auth');
      const { db } = await import('../firebase/config');
      
      if (currentUser) {
        // 1. Foydalanuvchi subcollections'larini o'chirish
        const subcollections = ['certificates', 'achievements', 'transactions', 'wallet'];
        
        for (const subcollection of subcollections) {
          const subcollectionRef = collection(db, 'users', currentUser.uid, subcollection);
          const snapshot = await getDocs(subcollectionRef);
          
          for (const docSnapshot of snapshot.docs) {
            await deleteDoc(docSnapshot.ref);
          }
        }

        // 2. Foydalanuvchi asosiy ma'lumotlarini o'chirish
        const userDocRef = doc(db, 'users', currentUser.uid);
        await deleteDoc(userDocRef);

        // 3. Firebase Auth'dan foydalanuvchini o'chirish
        await deleteUser(currentUser);

        // 4. Muvaffaqiyatli xabar
        showNotification('Account deleted successfully!', 'success');
        
        // 5. Modal'ni yopish
        setShowDeleteModal(false);
        setDeleteConfirmation('');
        
        // 6. Sahifani yangilash (foydalanuvchi logout bo'ladi)
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Xatolik xabarlari
      if (error.code === 'auth/requires-recent-login') {
        showNotification('Please re-authenticate to delete your account', 'error');
        setShowReauthModal(true);
      } else if (error.code === 'auth/network-request-failed') {
        showNotification('Network error. Please check your connection and try again', 'error');
      } else {
        showNotification('Failed to delete account. Please try again', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'data', name: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>Manage your settings</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings..."
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                        <input
                          type="text"
                          value={profileData.organization}
                          onChange={(e) => setProfileData({...profileData, organization: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                          value={profileData.role}
                          onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="organization">Organization</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                    
                    <div className="space-y-6">
                      {/* Two-Factor Authentication */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityData.twoFactorEnabled}
                            onChange={(e) => setSecurityData({...securityData, twoFactorEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {/* Change Password */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <Key className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Change Password</p>
                            <p className="text-xs text-gray-600">Update your account password</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                              type="password"
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                              type="password"
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={handleSecuritySave}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Login Sessions</p>
                            <p className="text-xs text-gray-600">Manage active login sessions</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                          <p className="text-xs text-gray-600">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                          <p className="text-xs text-gray-600">Receive push notifications in browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-xs text-gray-600">Receive notifications via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                          <p className="text-xs text-gray-600">Receive promotional and marketing emails</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.marketingEmails}
                            onChange={(e) => setNotificationSettings({...notificationSettings, marketingEmails: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleNotificationSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {/* API Keys Tab */}
                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Production API Key</p>
                            <p className="text-xs text-gray-600">Use this key for production applications</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border font-mono text-sm">
                          {showApiKey ? 'sk_live_1234567890abcdef' : 'sk_live_••••••••••••••••'}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Test API Key</p>
                            <p className="text-xs text-gray-600">Use this key for testing and development</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border font-mono text-sm">
                          sk_test_1234567890abcdef
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data & Privacy Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Download className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Export Data</p>
                            <p className="text-xs text-gray-600">Download a copy of your data</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          Export
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Import Data</p>
                            <p className="text-xs text-gray-600">Import data from another platform</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                          Import
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <Trash2 className="h-5 w-5 text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Delete Account</p>
                            <p className="text-xs text-red-600">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification - Mobile Style */}
      {notification.show && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform ${
          notification.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        } ${
          notification.type === 'success' ? 'bg-green-500 text-white border-l-4 border-green-400' :
          notification.type === 'error' ? 'bg-red-500 text-white border-l-4 border-red-400' :
          'bg-blue-500 text-white border-l-4 border-blue-400'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-6 w-6" />}
              {notification.type === 'error' && <AlertCircle className="h-6 w-6" />}
              {notification.type === 'info' && <Bell className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'info' })}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete your account? This will permanently remove:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Your profile and personal information</li>
                  <li>• All certificates and achievements</li>
                  <li>• Transaction history</li>
                  <li>• Wallet data</li>
                </ul>
                <p className="text-sm text-gray-700 mb-4">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type DELETE to confirm"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-authentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Re-authentication Required</h3>
                  <p className="text-sm text-gray-600">Please enter your password to continue</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  For security reasons, you need to re-authenticate before deleting your account.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReauthModal(false);
                    setReauthPassword('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReauthenticate}
                  disabled={isReauthing || !reauthPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReauthing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
