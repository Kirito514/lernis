import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  User,
  Mail,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    bio: '',
    userId: '',
    nickname: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });
  
  const { currentUser, userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
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
          <div className="max-w-4xl mx-auto">
            {/* Profile header skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Profile details skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      firstName: userData?.displayName?.split(' ')[0] || '',
      lastName: userData?.displayName?.split(' ')[1] || '',
      email: currentUser?.email || '',
      organization: userData?.organization || '',
      role: userData?.role || '',
      bio: userData?.bio || 'Passionate learner and blockchain enthusiast.',
      userId: userData?.userId || currentUser?.uid || '',
      nickname: userData?.nickname || ''
    });
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
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          organization: formData.organization,
          bio: formData.bio,
          nickname: formData.nickname,
          updatedAt: new Date().toISOString()
          // userId o'zgartirilmaydi - u unique va o'zgarmas
        });
        
        // Success notification
        showNotification('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'teacher':
        return '👨‍🏫';
      case 'organization':
        return '🏢';
      default:
        return '🎓';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'organization':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>Manage your account</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
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

        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
              {notification.type === 'info' && <Bell className="h-5 w-5" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {userData?.displayName || 'User Name'}
                      </h2>
                      <p className="text-gray-600 mb-2">{currentUser?.email}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userData?.role || 'student')}`}>
                          {getRoleIcon(userData?.role || 'student')} {userData?.role || 'student'}
                        </span>
                        {userData?.organization && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <Building className="h-4 w-4 mr-1" />
                            {userData.organization}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({...formData, organization: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                       <textarea
                         value={formData.bio}
                         onChange={(e) => setFormData({...formData, bio: e.target.value})}
                         rows={3}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                         <input
                           type="text"
                           value={formData.userId}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                           placeholder="12345678"
                           readOnly
                           disabled
                         />
                         <p className="text-xs text-gray-500 mt-1">User ID o'zgartirib bo'lmaydi</p>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                         <input
                           type="text"
                           value={formData.nickname}
                           onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Your nickname"
                         />
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                        <p className="text-sm text-gray-600">{userData?.displayName || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{currentUser?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Organization</p>
                        <p className="text-sm text-gray-600">{userData?.organization || 'Not provided'}</p>
                      </div>
                    </div>
                    
                     <div className="flex items-center space-x-3">
                       <Calendar className="h-5 w-5 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Member Since</p>
                         <p className="text-sm text-gray-600">
                           {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                         </p>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <User className="h-5 w-5 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">User ID</p>
                         <p className="text-sm text-gray-600 font-mono">{userData?.userId || currentUser?.uid || 'Not provided'}</p>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <User className="h-5 w-5 text-gray-400" />
                       <div>
                         <p className="text-sm font-medium text-gray-900">Nickname</p>
                         <p className="text-sm text-gray-600">{userData?.nickname || 'Not provided'}</p>
                       </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-600">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      Enable
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Privacy Settings</p>
                        <p className="text-xs text-gray-600">Control your data visibility</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      Manage
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-xs text-gray-600">Manage notification preferences</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
