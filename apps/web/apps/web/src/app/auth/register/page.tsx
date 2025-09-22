'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { useFirebaseAuth } from '@/lib/useFirebaseAuth';
import toast from 'react-hot-toast';

// const registerSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   role: z.string().min(1, 'Please select your role'),
// });

// type RegisterFormData = z.infer<typeof registerSchema>;

type RegisterFormData = {
  email: string;
  password: string;
  role: string;
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser, loginWithGoogle } = useFirebaseAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Basic validation
    if (!data.email) {
      toast.error('Email is required');
      return;
    }
    if (!data.password) {
      toast.error('Password is required');
      return;
    }
    if (!data.role) {
      toast.error('Please select your role');
      return;
    }
    if (!data.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerUser(data.email, data.password, data.role);
      // Success message will be shown by the hook
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // Success message will be shown by the hook
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setValue('role', role);
  };
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-purple-50/60" />
        
        {/* Floating orbs with animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-400/18 to-blue-300/18 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
        <div className="absolute bottom-40 right-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400/6 to-teal-300/6 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-amber-400/10 to-orange-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-blue-50/20" />
      </div>

      {/* Soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 sm:-top-40 sm:-left-32 w-[200px] h-[200px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-br from-blue-400/25 to-purple-400/25 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 sm:-bottom-40 sm:-right-32 w-[250px] h-[250px] sm:w-[520px] sm:h-[520px] rounded-full bg-gradient-to-br from-amber-300/20 to-blue-400/20 blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 right-8 flex justify-start items-center">
          <Link 
            href="/" 
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white transition-all duration-200 font-medium border border-white/20 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
        </div>

        {/* Center Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join EduNFT and start your blockchain journey</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                {...register('email')}
                type="email" 
                className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input 
                {...register('password')}
                type="password" 
                className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Who are you?</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('STUDENT')}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${
                    selectedRole === 'STUDENT' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'STUDENT' 
                        ? 'bg-blue-200' 
                        : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Student</p>
                      <p className="text-xs text-gray-500">I want to receive certificates</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('UNIVERSITY')}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${
                    selectedRole === 'UNIVERSITY' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'UNIVERSITY' 
                        ? 'bg-green-200' 
                        : 'bg-green-100 group-hover:bg-green-200'
                    }`}>
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">University</p>
                      <p className="text-xs text-gray-500">I want to issue certificates</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('TRAINING_CENTER')}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${
                    selectedRole === 'TRAINING_CENTER' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'TRAINING_CENTER' 
                        ? 'bg-purple-200' 
                        : 'bg-purple-100 group-hover:bg-purple-200'
                    }`}>
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Training Center</p>
                      <p className="text-xs text-gray-500">I provide courses</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleRoleSelect('COMPANY')}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${
                    selectedRole === 'COMPANY' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'COMPANY' 
                        ? 'bg-orange-200' 
                        : 'bg-orange-100 group-hover:bg-orange-200'
                    }`}>
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Company</p>
                      <p className="text-xs text-gray-500">I want to verify certificates</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            {errors.role && (
              <p className="text-sm text-red-600 text-center">{errors.role.message}</p>
            )}
          </form>
          
          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>
          
          {/* Social Buttons */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white/50 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-white/70 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">G</span>
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>
          
          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              By signing up, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">Terms & Privacy Policy</a>.
              Unauthorized use is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}