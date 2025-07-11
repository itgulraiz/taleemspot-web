import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  Edit2, 
  Share2, 
  LogOut, 
  Grid, 
  List,
  User,
  GraduationCap,
  MapPin,
  FileText,
  File,
  Video,
  Clock,
  Eye,
  Download,
  Star,
  Users,
  Calendar,
  Award,
  Activity,
  Camera,
  X,
  ExternalLink,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ArrowLeft,
  Home,
  Upload
} from 'lucide-react';

const Profile = () => {
  const router = useRouter();
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  
  // Current data as provided
  const currentDateTime = '2025-07-11 00:58:48';
  const currentUserLogin = 'itgulraiz';
  
  // Show badge for everyone now - rules will be set later
  const showBadge = true;
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileViewMode, setFileViewMode] = useState('grid');
  
  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    role: '',
    province: '',
    education: ''
  });

  // File states
  const [userFiles, setUserFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Enhanced stats with demo data
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: Math.floor(Math.random() * 5000) + 1000,
    totalDownloads: Math.floor(Math.random() * 2000) + 500,
    followers: 127,
    following: 43,
    rating: (4 + Math.random()).toFixed(1),
    rank: Math.floor(Math.random() * 100) + 1,
    streakDays: Math.floor(Math.random() * 30) + 5
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        role: userProfile.role || '',
        province: userProfile.province || '',
        education: userProfile.education || ''
      });
      
      fetchUserFiles();
      calculateUserStats();
    }
  }, [currentUser, userProfile, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleBioChange = (e) => {
    setFormData({
      ...formData,
      bio: e.target.value
    });
  };
  
  const handleBioSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await updateUserProfile({ bio: formData.bio });
      setSuccess('Bio updated successfully');
      setEditingBio(false);
    } catch (error) {
      setError('Failed to update bio');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing && userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        role: userProfile.role || '',
        province: userProfile.province || '',
        education: userProfile.education || ''
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    setError('');

    try {
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          setError('Error uploading image');
          setUploadingImage(false);
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateUserProfile({ photoURL: downloadURL });
          setUploadingImage(false);
          setSuccess('Profile image updated');
        }
      );
    } catch (error) {
      setError('Error uploading image');
      setUploadingImage(false);
    }
  };

  const fetchUserFiles = async () => {
    if (!currentUser) return;
    
    setLoadingFiles(true);
    
    try {
      const q = query(collection(db, 'files'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const files = [];
      querySnapshot.forEach(doc => {
        const fileData = doc.data();
        files.push({
          id: doc.id,
          ...fileData,
          views: fileData.views || Math.floor(Math.random() * 500) + 50,
          downloads: fileData.downloads || Math.floor(Math.random() * 200) + 10,
          rating: fileData.rating || (4 + Math.random()).toFixed(1)
        });
      });
      
      files.sort((a, b) => {
        switch (sortBy) {
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'downloads':
            return (b.downloads || 0) - (a.downloads || 0);
          case 'rating':
            return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
          case 'oldest':
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
          case 'newest':
          default:
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
      });
      
      setUserFiles(files);
      
      setStats(prevStats => ({
        ...prevStats,
        totalUploads: files.length
      }));
      
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };
  
  const calculateUserStats = () => {
    let totalViews = 0;
    let totalDownloads = 0;
    
    userFiles.forEach(file => {
      totalViews += file.views || 0;
      totalDownloads += file.downloads || 0;
    });
    
    setStats(prevStats => ({
      ...prevStats,
      totalUploads: userFiles.length,
      totalViews: totalViews || prevStats.totalViews,
      totalDownloads: totalDownloads || prevStats.totalDownloads
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'N/A';
    }
  };
  
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'Lecture':
        return <Video className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const filterFiles = () => {
    if (selectedFileType === 'All') {
      return userFiles;
    }
    return userFiles.filter(file => file.fileType === selectedFileType);
  };

  // Fixed Blue-filled Verification Badge Component
  const VerificationBadge = ({ className }) => (
    <div className="relative group">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="20px" 
        viewBox="0 -960 960 960" 
        width="20px" 
        className={`${className} cursor-help transform hover:scale-110 transition-transform duration-200`}
      >
        {/* Outer Badge Circle with Blue Fill */}
        <path 
          d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Z" 
          fill="#3B82F6"
          stroke="#1E40AF"
          strokeWidth="2"
        />
        {/* Inner Checkmark with White Fill */}
        <path 
          d="m438-338 226-226-56-58-170 170-86-84-56 56 142 142Z" 
          fill="white"
        />
      </svg>
      
      {/* Enhanced Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <div className="bg-blue-600 text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap shadow-lg border border-blue-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Verified Account</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const EnhancedFileCard = ({ file, isListView = false }) => (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden ${
      isListView ? 'flex items-center p-4' : 'p-6'
    }`}>
      
      <div className={`${isListView ? 'flex items-center space-x-4 w-full' : ''}`}>
        {/* File Icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            {getFileTypeIcon(file.fileType)}
          </div>
        </div>

        {/* File Info */}
        <div className={`${isListView ? 'flex-1' : 'mt-4'}`}>
          <h4 className={`font-bold text-gray-900 dark:text-white ${isListView ? 'text-lg' : 'text-base'} line-clamp-2`}>
            {file.title || 'Untitled Document'}
          </h4>
          
          {file.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
              {file.description}
            </p>
          )}

          {/* File Stats */}
          <div className={`flex ${isListView ? 'flex-row space-x-6 mt-2' : 'flex-col space-y-1 mt-3'} text-xs text-gray-500 dark:text-gray-400`}>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{file.views || 0} views</span>
            </div>
            <div className="flex items-center">
              <Download className="h-3 w-3 mr-1" />
              <span>{file.downloads || 0} downloads</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(file.createdAt)}</span>
            </div>
          </div>

          {/* File Actions */}
          <div className={`${isListView ? 'flex items-center justify-between mt-3' : 'mt-4'}`}>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(file.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{file.rating}</span>
            </div>

            {isListView && (
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                  {formatFileSize(file.fileSize)}
                </span>
                <a 
                  href={file.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </a>
              </div>
            )}
          </div>

          {/* Grid View Actions */}
          {!isListView && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                {file.category || 'General'}
              </span>
              <a 
                href={file.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Loading Profile</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load your profile...</p>
        </div>
      </div>
    );
  }

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
  
  const filteredFiles = filterFiles();

  return (
    <>
      <Head>
        <title>My Profile - TaleemSpot | {userProfile.fullName || 'User Profile'}</title>
        <meta name="description" content={`${userProfile.fullName || 'User'}'s profile on TaleemSpot. Manage your educational resources and account settings.`} />
        <meta name="keywords" content="profile, TaleemSpot, educational resources, user dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        
        {/* Enhanced Navigation Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </button>
                <div className="hidden sm:flex items-center space-x-3">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                    alt="TaleemSpot" 
                    className="h-8 w-8 rounded-full"
                  />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                </div>
              </div>
              
              {/* Enhanced Navigation with Upload Button */}
              <div className="flex items-center space-x-4">
                {/* Upload Button */}
                <button
                  onClick={() => router.push('/upload')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-5 w-5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Clock className="h-3 w-3" />
                  <span>UTC: {currentDateTime}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-green-700 dark:text-green-400">{success}</span>
              </div>
            </div>
          )}

          {/* Enhanced Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
            {/* Cover Background */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Profile Picture */}
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="relative">
                  {userProfile.photoURL || (currentUser && currentUser.photoURL) ? (
                    <img
                      src={userProfile.photoURL || currentUser.photoURL}
                      alt={userProfile.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-2xl">
                      {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {/* Camera Icon for Image Upload */}
                  {!editing && (
                    <label 
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 cursor-pointer shadow-lg border-2 border-white dark:border-gray-800 transition-colors"
                      htmlFor="profile-image"
                    >
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  
                  {/* Upload Progress */}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="text-white text-sm font-medium">{uploadProgress}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Name and Role */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {userProfile.fullName}
                      </h1>
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">@{userProfile.username}</p>
                        {/* Fixed Blue Verification Badge */}
                        {showBadge && <VerificationBadge />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.role && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userProfile.role === 'Teacher' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {userProfile.role}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          Rank #{stats.rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location and Education */}
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
                    {userProfile.education && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>{userProfile.education}</span>
                      </div>
                    )}
                    {userProfile.province && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{userProfile.province}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>{stats.streakDays} day streak</span>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalUploads}</div>
                      <div className="text-xs text-gray-500">Resources</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                        <Download className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Downloads</div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-2">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.rating}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 mb-2">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.following}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About</h3>
                      {!editingBio && (
                        <button 
                          onClick={() => setEditingBio(true)} 
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          {formData.bio ? 'Edit' : 'Add Bio'}
                        </button>
                      )}
                    </div>
                    
                    {editingBio ? (
                      <div>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleBioChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="3"
                          placeholder="Tell people about yourself..."
                        ></textarea>
                        <div className="flex justify-end mt-3 space-x-3">
                          <button 
                            onClick={() => {
                              setEditingBio(false);
                              setFormData({
                                ...formData,
                                bio: userProfile.bio || ''
                              });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleBioSubmit}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {formData.bio || (
                          <span className="text-gray-400 italic">No bio added yet. Share something about yourself!</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="lg:ml-8 mt-6 lg:mt-0 space-y-3">
                  <button
                    onClick={handleEditToggle}
                    className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Edit2 className="h-5 w-5" />
                    <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                  
                  <button className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200">
                    <Share2 className="h-5 w-5" />
                    <span>Share Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Form */}
          {editing && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Edit2 className="h-6 w-6 mr-3" />
                Edit Profile Information
              </h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500">@</span>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Role</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education Level
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Education Level</option>
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Resources Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <FileText className="h-6 w-6 mr-3" />
                    My Resources
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredFiles.length} resources uploaded
                  </p>
                </div>

                {/* Enhanced Filters */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                  {/* File Type Filter */}
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Types</option>
                    <option value="PDF">PDFs</option>
                    <option value="Lecture">Lectures</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="views">Most Viewed</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setFileViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        fileViewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setFileViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        fileViewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Resources Display */}
              {loadingFiles ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">Loading Resources</h3>
                  <p className="text-gray-600 dark:text-gray-400">Fetching your uploaded files...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 rounded-2xl p-16 text-center">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6">
                    <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Resources Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {selectedFileType === 'All' 
                      ? "You haven't uploaded any resources yet. Start sharing your knowledge!"
                      : `No ${selectedFileType.toLowerCase()} files found. Try changing the filter.`
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push('/upload')}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Upload Resources
                    </button>
                    {selectedFileType !== 'All' && (
                      <button
                        onClick={() => setSelectedFileType('All')}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-colors"
                      >
                        Show All Resources
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={
                  fileViewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {filteredFiles.map((file) => (
                    <EnhancedFileCard key={file.id} file={file} isListView={fileViewMode === 'list'} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </>
  );
};

export default Profile;
