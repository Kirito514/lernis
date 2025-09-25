import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Search,
  Play,
  Clock,
  Star,
  Users,
  BookOpen,
  Award
} from 'lucide-react';

export default function Courses() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock courses data
  const courses = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      instructor: 'John Smith',
      duration: '12 weeks',
      students: 245,
      rating: 4.8,
      progress: 75,
      status: 'in-progress',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      instructor: 'Sarah Johnson',
      duration: '8 weeks',
      students: 189,
      rating: 4.9,
      progress: 100,
      status: 'completed',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Blockchain Development',
      instructor: 'Mike Chen',
      duration: '10 weeks',
      students: 156,
      rating: 4.7,
      progress: 0,
      status: 'not-started',
      image: '/api/placeholder/300/200'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

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
          {/* Courses grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userData?.displayName || 'User'}!</span>
                <span>•</span>
                <span>{courses.length} courses</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {courses.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {courses.filter(c => c.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Started</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {courses.filter(c => c.status === 'not-started').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {course.status === 'in-progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    {course.status === 'completed' ? (
                      <>
                        <Award className="h-4 w-4" />
                        View Certificate
                      </>
                    ) : course.status === 'in-progress' ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
