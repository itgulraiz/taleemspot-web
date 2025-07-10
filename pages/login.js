import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login, signInWithGoogle, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      router.push('/profile');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push('/profile');
    } catch (err) {
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : err.code === 'auth/too-many-requests'
          ? 'Too many failed login attempts. Please try again later.'
          : 'Failed to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/complete-profile');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - TaleemSpot | Pakistan's Premier Educational Platform</title>
        <meta name="description" content="Sign in to TaleemSpot to access premium educational resources, past papers, and study materials for Pakistani students." />
        <meta name="keywords" content="login, signin, TaleemSpot, education, Pakistan, student portal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Login - TaleemSpot" />
        <meta property="og:description" content="Access your TaleemSpot account to unlock premium educational content" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://taleemspot.com/login" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        <Header />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:py-16">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Side - Welcome Section */}
              <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Secure Login</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    Welcome back to
                    <span className="text-blue-600 dark:text-blue-400 block">TaleemSpot</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Access your personalized dashboard and continue your educational journey with Pakistan's most trusted learning platform.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {[
                    "Access to premium study materials",
                    "Personalized learning dashboard", 
                    "Download unlimited past papers",
                    "Track your academic progress"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">10K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Resources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                    
                    {/* Form Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign In
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter your credentials to access your account
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Remember me
                          </label>
                        </div>
                        <Link 
                          href="/forgot-password" 
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Sign In Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      {/* Google Sign In */}
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="mt-6 w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                      >
                        <Globe className="h-5 w-5 mr-3 text-red-500" />
                        Continue with Google
                      </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link 
                          href="/register" 
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          Create account
                        </Link>
                      </p>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="h-3 w-3 mr-2" />
                        Your data is protected with industry-standard encryption
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stats - Only visible on mobile */}
                  <div className="lg:hidden mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">10K+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Resources</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Login;
