import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Key,
  Clock,
  User
} from 'lucide-react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await sendPasswordResetEmail(auth, email);
      
      setMessage('Password reset instructions have been sent to your email');
      setEmailSent(true);
    } catch (error) {
      setError(
        error.code === 'auth/user-not-found'
          ? 'No account exists with this email address'
          : error.code === 'auth/too-many-requests'
          ? 'Too many reset attempts. Please try again later.'
          : 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      setLoading(true);
      setError('');
      
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email resent successfully');
    } catch (error) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - TaleemSpot | Recover Your Account</title>
        <meta name="description" content="Reset your TaleemSpot password securely. Enter your email to receive password reset instructions and regain access to your educational account." />
        <meta name="keywords" content="reset password, forgot password, TaleemSpot, account recovery, password recovery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Reset Password - TaleemSpot" />
        <meta property="og:description" content="Securely reset your TaleemSpot account password" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://taleemspot.com/forgot-password" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        <Header />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:py-16">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Side - Information Section */}
              <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Account Recovery</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    Forgot your
                    <span className="text-orange-600 dark:text-orange-400 block">password?</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Don't worry! Password recovery is quick and secure. We'll help you regain access to your TaleemSpot account in just a few steps.
                  </p>
                </div>

                {/* Recovery Steps */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How it works:</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        step: "1", 
                        title: "Enter your email", 
                        description: "Provide the email address associated with your account",
                        icon: Mail,
                        color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900"
                      },
                      { 
                        step: "2", 
                        title: "Check your inbox", 
                        description: "We'll send you secure reset instructions",
                        icon: CheckCircle,
                        color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
                      },
                      { 
                        step: "3", 
                        title: "Create new password", 
                        description: "Follow the link to set up a new secure password",
                        icon: Key,
                        color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900"
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Secure Process</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Your security is our priority. All password reset links expire after 1 hour for your protection.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Session Info */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      <span>Session: itgulraiz</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span>UTC: {getCurrentDateTime()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Reset Form */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                    
                    {!emailSent ? (
                      <>
                        {/* Form Header */}
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl mb-4">
                            <Lock className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Reset Password
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Enter your email address and we'll send you instructions to reset your password
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

                        {/* Success Message */}
                        {message && (
                          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-green-700 dark:text-green-400 text-sm">{message}</span>
                            </div>
                          </div>
                        )}

                        {/* Reset Form */}
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
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                placeholder="Enter your email address"
                              />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              We'll send reset instructions to this email address
                            </p>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Sending Reset Link...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Reset Link
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            )}
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        {/* Email Sent Success State */}
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-6">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Check Your Email
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We've sent password reset instructions to:
                          </p>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                            <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                          </div>
                          
                          {/* Instructions */}
                          <div className="text-left mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Next Steps:</h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                              <li>• Check your email inbox (and spam folder)</li>
                              <li>• Click the reset link in the email</li>
                              <li>• Create a new secure password</li>
                              <li>• Sign in with your new password</li>
                            </ul>
                          </div>

                          {/* Resend Email Button */}
                          <button
                            onClick={handleResendEmail}
                            disabled={loading}
                            className="w-full mb-4 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50"
                          >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Resending...' : 'Resend Email'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                      <Link 
                        href="/login" 
                        className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                      </Link>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Need help? Contact our support team
                        </p>
                        <Link 
                          href="/support" 
                          className="text-xs font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                        >
                          Get Support
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Session Info - Only visible on mobile */}
                  <div className="lg:hidden mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2" />
                          <span>Session: itgulraiz</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          <span>UTC: {getCurrentDateTime()}</span>
                        </div>
                      </div>
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

export default ForgotPassword;
