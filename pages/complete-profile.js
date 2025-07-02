import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const CompleteProfile = () => {
  const router = useRouter();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    role: '',
    province: '',
    education: '',
    fullName: '',
    username: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Pre-fill the form with data from Google Auth if available
    if (currentUser && userProfile) {
      setFormData(prevState => ({
        ...prevState,
        fullName: userProfile.fullName || currentUser.displayName || '',
        username: userProfile.username || currentUser.email?.split('@')[0] || '',
        role: userProfile.role || '',
        province: userProfile.province || '',
        education: userProfile.education || ''
      }));
    }
  }, [currentUser, userProfile, router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers and underscore';
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setGeneralError('');
    setLoading(true);
    
    try {
      await updateUserProfile({
        fullName: formData.fullName,
        username: formData.username,
        role: formData.role,
        province: formData.province,
        education: formData.education,
        profileCompleted: true
      });
      
      router.push('/profile');
    } catch (error) {
      console.error(error);
      setGeneralError('Failed to update profile. Please try again.');
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

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to complete your profile
          </p>
        </div>
        
        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">@</span>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`block w-full pl-7 pr-3 py-2 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <select
                id="province"
                name="province"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.province ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                value={formData.province}
                onChange={handleChange}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="mt-2 text-sm text-red-600">{errors.province}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
                id="education"
                name="education"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.education ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                value={formData.education}
                onChange={handleChange}
              >
                <option value="">Select Education Level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.education && (
                <p className="mt-2 text-sm text-red-600">{errors.education}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Updating...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
