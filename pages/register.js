import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  MapPin, 
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = () => {
  const router = useRouter();
  const { register, currentUser, signInWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    province: '',
    education: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.push('/profile');
    }
  }, [currentUser, router]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2) newErrors.fullName = 'Name is too short';
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers and underscore';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.role) newErrors.role = 'Please select a role';
    if (!formData.province) newErrors.province = 'Please select a province';
    if (!formData.education) newErrors.education = 'Please select an education level';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) return;
    
    setGeneralError('');
    setLoading(true);
    
    try {
      await register(formData.email, formData.password, {
        fullName: formData.fullName,
        username: formData.username,
        role: formData.role,
        province: formData.province,
        education: formData.education
      });
      
      router.push('/verification-sent');
    } catch (error) {
      console.error(error);
      setGeneralError(
        error.code === 'auth/email-already-in-use'
          ? 'Email is already in use. Please use another email or login.'
          : 'Failed to create an account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/complete-profile');
    } catch (err) {
      setGeneralError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const provinces = [
    'Balochistan',
    'Khyber Pakhtunkhwa',
    'Punjab',
    'Sindh',
    'Azad Jammu and Kashmir',
    'Federal',
    'Gilgit-Baltistan'
  ];

  const educationLevels = [
    'O Level',
    'Matric (9th)',
    'Matric (10th)',
    'A Level',
    'Inter (11th)',
    'Inter (12th)',
    'Entry Test (MDCAT)',
    'Entry Test (ECAT)',
    'Entry Test (NUMS)',
    'Entry Test (AMC)',
    'Entry Test (PMA)',
    'University Entry Test',
    'Virtual University',
    'Allama Iqbal Open University',
    'MBBS',
    'BDS',
    'Other University',
    'Competition Exam (PPSC)',
    'Competition Exam (FPSC)',
    'Competition Exam (KPSC)',
    'Competition Exam (BPSC)',
    'Competition Exam (NTS)',
    'Competition Exam (SPSC)',
    'Competition Exam (CSS)',
    'Competition Exam (AJKPSC)',
    'Competition Exam (PMS)'
  ];

  return (
    <>
      <Head>
        <title>Register - TaleemSpot | Create Your Educational Account</title>
        <meta name="description" content="Join TaleemSpot - Pakistan's premier educational platform. Create your free account to access premium study materials, past papers, and resources." />
        <meta name="keywords" content="register, signup, TaleemSpot, education Pakistan, student account, teacher registration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Register - TaleemSpot" />
        <meta property="og:description" content="Create your TaleemSpot account and unlock premium educational resources" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://taleemspot.com/register" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        <Header />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:py-16">
          <div className="flex items-center justify-center min-h-[85vh]">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Side - Welcome Section */}
              <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Join TaleemSpot</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                    Start your
                    <span className="text-green-600 dark:text-green-400 block">learning journey</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Join thousands of Pakistani students and educators in accessing premium educational resources and building a brighter future.
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-4">
                  {[
                    { icon: BookOpen, text: "Access to 10,000+ study materials" },
                    { icon: Users, text: "Connect with 50,000+ students" },
                    { icon: Award, text: "Premium educational resources" },
                    { icon: Shield, text: "Secure and trusted platform" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <benefit.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Resources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.5K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Teachers</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                    
                    {/* Form Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Account
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Step {step} of 2 - {step === 1 ? 'Personal Details' : 'Profile Information'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{step * 50}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step * 50}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {generalError && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-red-700 dark:text-red-400 text-sm">{generalError}</span>
                        </div>
                      </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {step === 1 ? (
                        <div className="space-y-6">
                          {/* Full Name */}
                          <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Full Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border ${
                                  errors.fullName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                                placeholder="Enter your full name"
                              />
                            </div>
                            {errors.fullName && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.fullName}
                              </p>
                            )}
                          </div>

                          {/* Email */}
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
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border ${
                                  errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                                placeholder="Enter your email"
                              />
                            </div>
                            {errors.email && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.email}
                              </p>
                            )}
                          </div>

                          {/* Username */}
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Username
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm">@</span>
                              </div>
                              <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className={`block w-full pl-8 pr-3 py-3 border ${
                                  errors.username ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                                placeholder="Choose a username"
                              />
                            </div>
                            {errors.username && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.username}
                              </p>
                            )}
                          </div>

                          {/* Password */}
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
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-10 py-3 border ${
                                  errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                                placeholder="Create a password"
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
                            {errors.password && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.password}
                              </p>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-10 py-3 border ${
                                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                                placeholder="Confirm your password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                )}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>

                          {/* Next Button */}
                          <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            <div className="flex items-center">
                              Continue
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Role */}
                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Your Role
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                id="role"
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border ${
                                  errors.role ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                              >
                                <option value="">Select your role</option>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                              </select>
                            </div>
                            {errors.role && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.role}
                              </p>
                            )}
                          </div>

                          {/* Province */}
                          <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Province
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                id="province"
                                name="province"
                                required
                                value={formData.province}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border ${
                                  errors.province ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                              >
                                <option value="">Select your province</option>
                                {provinces.map((province) => (
                                  <option key={province} value={province}>
                                    {province}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {errors.province && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.province}
                              </p>
                            )}
                          </div>

                          {/* Education Level */}
                          <div>
                            <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Education Level
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <GraduationCap className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                id="education"
                                name="education"
                                required
                                value={formData.education}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-3 border ${
                                  errors.education ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                              >
                                <option value="">Select education level</option>
                                {educationLevels.map((level) => (
                                  <option key={level} value={level}>
                                    {level}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {errors.education && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.education}
                              </p>
                            )}
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="w-1/2 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-1/2 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              {loading ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                  Creating...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Create Account
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </form>

                    {/* Divider - Only show on step 1 */}
                    {step === 1 && (
                      <>
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
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="mt-6 w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                          >
                            <Globe className="h-5 w-5 mr-3 text-red-500" />
                            Continue with Google
                          </button>
                        </div>
                      </>
                    )}

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link 
                          href="/login" 
                          className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="h-3 w-3 mr-2" />
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stats - Only visible on mobile */}
                  <div className="lg:hidden mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">50K+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Resources</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">2.5K+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Teachers</div>
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

export default Register;
