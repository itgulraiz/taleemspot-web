import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const Profile = () => {
  const router = useRouter();
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
    }
  }, [currentUser, userProfile, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
      const uploadTask = uploadBytesResumable(storageRef, fileUpload);
      
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
            education: userProfile.education
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
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setLoadingFiles(false);
    }
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

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">TaleemSpot</h1>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => router.push('/')}
                className="text-white hover:text-blue-200"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center">
              <div className="relative">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                {!editing && (
                  <label 
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-1 cursor-pointer"
                    htmlFor="profile-image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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
              
              <div className="ml-4">
                <h2 className="text-xl font-bold">{userProfile.fullName}</h2>
                <p className="text-gray-600">@{userProfile.username}</p>
                {userProfile.role && (
                  <p className="text-blue-600 font-medium">{userProfile.role}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleEditToggle}
              className={`mt-4 md:mt-0 ${
                editing
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded-md`}
            >
              {editing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          {uploadingImage && (
            <div className="mb-4">
              <p className="mb-2">Uploading image: {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {editing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
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
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{userProfile.email}</p>
                </div>
                
                {userProfile.province && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Province</h3>
                    <p>{userProfile.province}</p>
                  </div>
                )}
                
                {userProfile.education && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Education Level</h3>
                    <p>{userProfile.education}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <p>
                    {currentUser.emailVerified ? (
                      <span className="text-green-600 font-medium">Email Verified</span>
                    ) : (
                      <span className="text-red-600 font-medium">Email Not Verified</span>
                    )}
                  </p>
                </div>
              </div>
              
              {userProfile.bio && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                  <p className="text-gray-800">{userProfile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Resources</h2>
          
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
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${fileUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={uploadingFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:bg-blue-400"
            >
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>

        {/* User Files Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Uploaded Files</h2>
          
          {loadingFiles ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userFiles.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-500">You haven't uploaded any files yet.</p>
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
                  {userFiles.map((file) => (
                    <tr key={file.id}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>© {new Date().getFullYear()} TaleemSpot. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-400">
              Education platform for students and teachers across Pakistan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
