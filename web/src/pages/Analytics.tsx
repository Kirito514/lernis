import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

export default function Analytics() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>Coming Soon</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
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
          {/* Coming Soon Section */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <div className="relative">
                <BarChart3 className="h-24 w-24 text-blue-500 mx-auto mb-4" />
                <div className="absolute -top-2 -right-2">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Comprehensive analytics and insights are coming soon. We're working on bringing you detailed performance metrics, 
              student progress tracking, and advanced reporting features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                <p className="text-sm text-gray-600">
                  Track student progress, completion rates, and course performance with detailed analytics.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Time-based Analysis</h3>
                <p className="text-sm text-gray-600">
                  View trends over time with monthly, weekly, and daily breakdowns of key metrics.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Reports</h3>
                <p className="text-sm text-gray-600">
                  Interactive charts and graphs to visualize data and identify patterns and trends.
                </p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">What to Expect</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Real-time student enrollment and progress tracking</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Course completion rates and performance analytics</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Teacher performance and engagement metrics</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Department-wise statistics and comparisons</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Certificate issuance trends and patterns</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-blue-800">Exportable reports and data visualization</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}