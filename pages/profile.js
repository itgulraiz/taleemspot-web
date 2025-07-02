import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { FiUpload, FiEdit2, FiShare2, FiLogOut, FiSettings, FiGrid, FiList } from 'react-icons/fi';
import { FaGraduationCap, FaMapMarkerAlt, FaRegFilePdf, FaFileAlt, FaVideo, FaRegBell } from 'react-icons/fa';

const Profile = () => {
  const router = useRouter();
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('files');
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

  // File upload states
  const [fileUpload, setFileUpload] = useState(null);
  const [fileType, setFileType] = useState('PDF');
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fileCategory, setFileCategory] = useState('Notes');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [userFiles, setUserFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('All');
  
  // Stats
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0,
    followers: 0,
    following: 0
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
      
      // Fetch user's files
      fetchUserFiles();
      
      // Calculate stats
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
    // Reset form data if cancelling
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

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleFileSelect = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!fileUpload) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!fileTitle) {
      setError('Please provide a title for the file');
      return;
    }
    
    // Check file size (limit to 20MB)
    if (fileUpload.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }
    
    // Check file type
    let validFileType = false;
    
    if (fileType === 'PDF') {
      validFileType = fileUpload.type === 'application/pdf';
    } else if (fileType === 'Document') {
      validFileType = 
        fileUpload.type === 'application/msword' || 
        fileUpload.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileUpload.type === 'application/vnd.ms-excel' ||
        fileUpload.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileUpload.type === 'text/plain';
    } else if (fileType === 'Lecture') {
      validFileType = 
        fileUpload.type.startsWith('video/') || 
        fileUpload.type.startsWith('audio/');
    }
    
    if (!validFileType) {
      setError(`Selected file is not a valid ${fileType.toLowerCase()}`);
      return;
    }
    
    setError('');
    setUploadingFile(true);
    setFileUploadProgress(0);
    
    try {
      // Upload file to Firebase Storage
      const fileExtension = fileUpload.name.split('.').pop();
      const storageRef = ref(storage, `user_files/${currentUser.uid}/${fileType.toLowerCase()}/${Date.now()}_${fileTitle.replace(/\s+/g, '_')}.${fileExtension}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFileUploadProgress(Math.round(progress));
        },
        (error) => {
          setError('Error uploading file');
          setUploadingFile(false);
          console.error(error);
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Add file info to Firestore
          await addDoc(collection(db, 'files'), {
            title: fileTitle,
            description: fileDescription,
            fileType: fileType,
            category: fileCategory,
            fileUrl: downloadURL,
            fileSize: fileUpload.size,
            fileName: fileUpload.name,
            createdAt: serverTimestamp(),
            userId: currentUser.uid,
            userDisplayName: userProfile.fullName,
            userUsername: userProfile.username,
            education: userProfile.education,
            views: 0,
            downloads: 0
          });
          
          setUploadingFile(false);
          setSuccess('File uploaded successfully');
          setFileTitle('');
          setFileDescription('');
          setFileUpload(null);
          
          // Refresh user files
          fetchUserFiles();
          
          // Reset file input
          document.getElementById('file-upload').value = '';
          
          // Update stats
          calculateUserStats();
          
          // Hide upload section after successful upload
          setShowUploadSection(false);
        }
      );
    } catch (error) {
      setError('Error uploading file');
      setUploadingFile(false);
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
        files.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by createdAt (newest first)
      files.sort((a, b) => b.createdAt - a.createdAt);
      
      setUserFiles(files);
      
      // Update stats
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
    // In a real app, you would fetch this data from the backend
    // This is a placeholder
    let totalViews = 0;
    let totalDownloads = 0;
    
    userFiles.forEach(file => {
      totalViews += file.views || 0;
      totalDownloads += file.downloads || 0;
    });
    
    setStats({
      totalUploads: userFiles.length,
      totalViews: totalViews || Math.floor(Math.random() * 1000) + 100,
      totalDownloads: totalDownloads || Math.floor(Math.random() * 200) + 50,
      followers: 90,
      following: 8
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FaRegFilePdf className="h-10 w-10 text-red-500" />;
      case 'Document':
        return <FaFileAlt className="h-10 w-10 text-blue-500" />;
      case 'Lecture':
        return <FaVideo className="h-10 w-10 text-purple-500" />;
      default:
        return <FaFileAlt className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const filterFiles = () => {
    if (selectedFileType === 'All') {
      return userFiles;
    }
    return userFiles.filter(file => file.fileType === selectedFileType);
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')} 
                className="flex items-center space-x-2"
              >
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                  alt="TaleemSpot Logo" 
                  className="h-8 w-auto rounded-full"
                />
                <h1 className="text-xl md:text-2xl font-bold hidden sm:block">TaleemSpot</h1>
              </button>
            </div>
            <div className="flex space-x-2 md:space-x-4 items-center">
              <button
                className="p-2 rounded-full hover:bg-blue-700 transition-colors relative"
                aria-label="Notifications"
              >
                <FaRegBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
              </button>
              <button
                onClick={() => setShowUploadSection(!showUploadSection)}
                className="p-2 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Upload"
              >
                <FiUpload className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Settings"
              >
                <FiSettings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-1 bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
              <button
                onClick={handleLogout}
                className="md:hidden p-2 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm" role="alert">
            <p className="font-medium">Success</p>
            <p>{success}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6 md:ml-10">
              <div className="relative">
                {userProfile.photoURL || (currentUser && currentUser.photoURL) ? (
                  <img
                    src={userProfile.photoURL || currentUser.photoURL}
                    alt={userProfile.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                {!editing && (
                  <label 
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-1.5 cursor-pointer shadow-lg border-2 border-white"
                    htmlFor="profile-image"
                  >
                    <FiEdit2 className="h-4 w-4 text-white" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-6 pb-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{userProfile.fullName}</h2>
                  {userProfile.role && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {userProfile.role}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">@{userProfile.username}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userProfile.education && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaGraduationCap className="mr-1" />
                      <span>{userProfile.education}</span>
                    </div>
                  )}
                  {userProfile.province && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{userProfile.province}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => setShowUploadSection(!showUploadSection)}
                  className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <FiUpload className="h-4 w-4" />
                  <span>Upload Resource</span>
                </button>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center justify-center space-x-1 ${
                    editing
                      ? 'bg-gray-500 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } px-4 py-2 rounded-md transition-colors`}
                >
                  <FiEdit2 className="h-4 w-4" />
                  <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
                <button
                  className="hidden md:flex items-center justify-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  <FiShare2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 mt-6 border-b border-gray-200 pb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.totalUploads}</div>
                <div className="text-sm text-gray-500">Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.totalViews}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">4.5</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 font-medium">Bio</h3>
                {!editingBio && (
                  <button 
                    onClick={() => setEditingBio(true)} 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {formData.bio ? 'Edit Bio' : 'Add Bio'}
                  </button>
                )}
              </div>
              
              {editingBio ? (
                <div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleBioChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Tell people about yourself..."
                  ></textarea>
                  <div className="flex justify-end mt-2 space-x-2">
                    <button 
                      onClick={() => {
                        setEditingBio(false);
                        setFormData({
                          ...formData,
                          bio: userProfile.bio || ''
                        });
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBioSubmit}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  {formData.bio || (
                    <span className="text-gray-400 italic">No bio added yet. Add information about yourself.</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Edit Profile Form (when editing is true) */}
        {editing && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">@</span>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-blue-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* File Upload Section (when showUploadSection is true) */}
        {showUploadSection && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Upload Resource</h2>
              <button 
                onClick={() => setShowUploadSection(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFileUpload}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Type
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Document">Document</option>
                    <option value="Lecture">Lecture (Audio/Video)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Notes">Notes</option>
                    <option value="Handouts">Handouts</option>
                    <option value="Final Papers">Final Papers</option>
                    <option value="Mid Papers">Mid Papers</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Title for your file"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (Max 20MB)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {fileType === 'PDF' ? 'Accepts PDF files' : 
                   fileType === 'Document' ? 'Accepts Doc, Docx, Excel, Text files' : 
                   'Accepts Audio and Video files'}
                </p>
              </div>
              
              {uploadingFile && (
                <div className="mb-4">
                  <p className="mb-2">Uploading file: {fileUploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadSection(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-blue-400"
                >
                  {uploadingFile ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabbed Navigation */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('files')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Resources
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          {/* User Files Section */}
          {activeTab === 'files' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedFileType === 'All' ? 'All Resources' : `${selectedFileType} Files`}
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Types</option>
                    <option value="PDF">PDFs</option>
                    <option value="Document">Documents</option>
                    <option value="Lecture">Lectures</option>
                  </select>
                  <div className="hidden md:flex items-center space-x-2">
                    <button 
                      onClick={() => setFileViewMode('grid')}
                      className={`p-1.5 rounded ${fileViewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                                           <FiGrid className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setFileViewMode('list')}
                      className={`p-1.5 rounded ${fileViewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <FiList className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {loadingFiles ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="bg-gray-50 p-12 rounded-lg text-center">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                    <FiUpload className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No resources yet</h3>
                  <p className="text-gray-500 mb-4">Upload your first resource to get started</p>
                  <button
                    onClick={() => setShowUploadSection(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                    Upload Resource
                  </button>
                </div>
              ) : fileViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 flex flex-col items-center">
                        {getFileTypeIcon(file.fileType)}
                        <h4 className="mt-2 text-center font-medium text-gray-900 line-clamp-1">{file.title}</h4>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>{file.category}</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View
                          </a>
                          <span className="text-xs text-gray-500">{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{file.title}</div>
                            {file.description && (
                              <div className="text-xs text-gray-500">{file.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              file.fileType === 'PDF' ? 'bg-green-100 text-green-800' :
                              file.fileType === 'Document' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {file.fileType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(file.fileSize)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a 
                              href={file.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Stats Section */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-1">{stats.totalViews}</div>
                  <div className="text-sm text-blue-600">Total Views</div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-1">{stats.totalDownloads}</div>
                  <div className="text-sm text-green-600">Downloads</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">4.5</div>
                  <div className="text-sm text-purple-600">Average Rating</div>
                </div>
              </div>
              
              {/* Placeholder for charts and more detailed analytics */}
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Detailed Analytics</h4>
                <p className="text-gray-500 mb-4">More detailed analytics will be available soon!</p>
              </div>
            </div>
          )}
          
          {/* Settings Section */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Email Verification</h4>
                  {currentUser.emailVerified ? (
                    <div className="flex items-center text-green-600">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Your email is verified</span>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-red-600">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Your email is not verified</span>
                      </div>
                      <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md self-start">
                        Resend Verification Email
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Change Password</h4>
                  <button className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
                    Change Password
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email Notifications</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Push Notifications</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-red-600 mb-2">Danger Zone</h4>
                  <button className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-2">TaleemSpot</h3>
              <p className="text-sm text-gray-400">
                Education platform for students and teachers across Pakistan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Quick Links</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Explore</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Us</h3>
              <p className="text-sm text-gray-400">
                info@taleemspot.com<br />
                +92 300 1234567
              </p>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} TaleemSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Additional CSS for toggle switches */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        
        input:checked + .slider {
          background-color: #3B82F6;
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        .slider.round {
          border-radius: 34px;
        }
        
        .slider.round:before {
          border-radius: 50%;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
      `}</style>
    </div>
  );
};

export default Profile;
