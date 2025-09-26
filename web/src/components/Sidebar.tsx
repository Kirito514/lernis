import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  Building,
  Wallet,
  ChevronDown,
  ShoppingBag,
  Coins
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, userData, logout } = useAuth();

  // Rolga qarab menyu yaratish
  const getNavigationByRole = () => {
    const role = userData?.role || 'student';
    
    switch (role) {
      case 'student':
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
          },
          {
            name: 'My Certificates',
            href: '/dashboard/my-certificates',
            icon: FileText,
            current: location.pathname === '/dashboard/my-certificates'
          },
          {
            name: 'Courses',
            href: '/dashboard/courses',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard/courses'
          },
          {
            name: 'Wallet',
            href: '/dashboard/wallet',
            icon: Wallet,
            current: location.pathname === '/dashboard/wallet'
          },
          {
            name: 'Marketplace',
            href: '/dashboard/marketplace',
            icon: ShoppingBag,
            current: location.pathname === '/dashboard/marketplace'
          },
          {
            name: 'Buy Tokens',
            href: '/dashboard/buy-tokens',
            icon: Coins,
            current: location.pathname === '/dashboard/buy-tokens'
          },
          {
            name: 'Verification',
            href: '/dashboard/verification',
            icon: Shield,
            current: location.pathname === '/dashboard/verification'
          },
          {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: User,
            current: location.pathname === '/dashboard/profile'
          }
        ];

      case 'teacher':
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
          },
          {
            name: 'Students',
            href: '/dashboard/students',
            icon: Users,
            current: location.pathname === '/dashboard/students'
          },
          {
            name: 'Certificates',
            icon: FileText,
            current: location.pathname.startsWith('/dashboard/certificates'),
            children: [
              { name: 'Create Certificate', href: '/dashboard/certificates/create' },
              { name: 'My Certificates', href: '/dashboard/certificates' }
            ]
          },
          {
            name: 'Courses',
            href: '/dashboard/courses',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard/courses'
          },
          {
            name: 'Wallet',
            href: '/dashboard/wallet',
            icon: Wallet,
            current: location.pathname === '/dashboard/wallet'
          },
          {
            name: 'Marketplace',
            href: '/dashboard/marketplace',
            icon: ShoppingBag,
            current: location.pathname === '/dashboard/marketplace'
          },
          {
            name: 'Buy Tokens',
            href: '/dashboard/buy-tokens',
            icon: Coins,
            current: location.pathname === '/dashboard/buy-tokens'
          },
          {
            name: 'Verification',
            href: '/dashboard/verification',
            icon: Shield,
            current: location.pathname === '/dashboard/verification'
          },
          {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: User,
            current: location.pathname === '/dashboard/profile'
          }
        ];

      case 'organization':
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
          },
          {
            name: 'Certificates',
            icon: FileText,
            current: location.pathname.startsWith('/dashboard/certificates'),
            children: [
              { name: 'All Certificates', href: '/dashboard/certificates' },
              { name: 'Create New', href: '/dashboard/certificates/create' },
              { name: 'Certificate History', href: '/dashboard/certificate-history' },
              { name: 'Templates', href: '/dashboard/certificates/templates' },
              { name: 'Bulk Upload', href: '/dashboard/certificates/bulk' }
            ]
          },
          {
            name: 'Students',
            icon: Users,
            current: location.pathname.startsWith('/dashboard/students'),
            children: [
              { name: 'All Students', href: '/dashboard/students' },
              { name: 'Add Student', href: '/dashboard/students/add' },
              { name: 'Import CSV', href: '/dashboard/students/import' }
            ]
          },
          {
            name: 'Teachers',
            href: '/dashboard/teachers',
            icon: Users,
            current: location.pathname === '/dashboard/teachers'
          },
          {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: BarChart3,
            current: location.pathname === '/dashboard/analytics'
          },
          {
            name: 'Verification',
            icon: Shield,
            current: location.pathname.startsWith('/dashboard/verification'),
            children: [
              { name: 'Verify Certificate', href: '/dashboard/verification' },
              { name: 'Verification Log', href: '/dashboard/verification/log' }
            ]
          },
          {
            name: 'Organization',
            icon: Building,
            current: location.pathname.startsWith('/dashboard/organization'),
            children: [
              { name: 'Profile', href: '/dashboard/organization' },
              { name: 'Settings', href: '/dashboard/organization/settings' }
            ]
          },
          {
            name: 'Wallet',
            href: '/dashboard/wallet',
            icon: Wallet,
            current: location.pathname === '/dashboard/wallet'
          },
          {
            name: 'Marketplace',
            href: '/dashboard/marketplace',
            icon: ShoppingBag,
            current: location.pathname === '/dashboard/marketplace'
          },
          {
            name: 'Buy Tokens',
            href: '/dashboard/buy-tokens',
            icon: Coins,
            current: location.pathname === '/dashboard/buy-tokens'
          }
        ];

      case 'admin':
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
          },
          {
            name: 'Organizations',
            href: '/dashboard/organizations',
            icon: Building,
            current: location.pathname === '/dashboard/organizations'
          },
          {
            name: 'Users',
            icon: Users,
            current: location.pathname.startsWith('/dashboard/users'),
            children: [
              { name: 'All Users', href: '/dashboard/users' },
              { name: 'Students', href: '/dashboard/users/students' },
              { name: 'Teachers', href: '/dashboard/users/teachers' }
            ]
          },
          {
            name: 'Certificates',
            href: '/dashboard/certificates',
            icon: FileText,
            current: location.pathname === '/dashboard/certificates'
          },
          {
            name: 'Transactions',
            href: '/dashboard/transactions',
            icon: Wallet,
            current: location.pathname === '/dashboard/transactions'
          },
          {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: BarChart3,
            current: location.pathname === '/dashboard/analytics'
          },
          {
            name: 'Marketplace',
            href: '/dashboard/marketplace',
            icon: ShoppingBag,
            current: location.pathname === '/dashboard/marketplace'
          },
          {
            name: 'Buy Tokens',
            href: '/dashboard/buy-tokens',
            icon: Coins,
            current: location.pathname === '/dashboard/buy-tokens'
          },
          {
            name: 'Verification',
            href: '/dashboard/verification',
            icon: Shield,
            current: location.pathname === '/dashboard/verification'
          },
          {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
            current: location.pathname === '/dashboard/settings'
          }
        ];

      default:
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
            current: location.pathname === '/dashboard'
          }
        ];
    }
  };

  const navigation = getNavigationByRole();


  const handleSubmenuToggle = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  const isActive = (item: any) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    return item.current;
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-3xl font-black tracking-wider text-blue-600 drop-shadow-lg">Lernis</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              userData?.role === 'admin' ? 'bg-red-100 text-red-800' :
              userData?.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
              userData?.role === 'organization' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {userData?.role === 'admin' ? '👑 Admin' :
               userData?.role === 'teacher' ? '👨‍🏫 Teacher' :
               userData?.role === 'organization' ? '🏢 Organization' :
               '🎓 Student'}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700">
              ID: {userData?.userId || 'N/A'}
            </span>
          </div>
        </div>
      )}


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => handleSubmenuToggle(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                        activeSubmenu === item.name ? 'rotate-90' : ''
                      }`} />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {!collapsed && activeSubmenu === item.name && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            location.pathname === child.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href!}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="mt-4 pt-4 pb-4 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                  {userData?.displayName || currentUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">
                  {currentUser?.email || 'user@example.com'}
                </p>
              </div>
            )}
            {!collapsed && (
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            )}
          </button>
          
          {/* User Menu Dropdown */}
          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm z-50">
              <div className="py-1">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/dashboard/help"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
