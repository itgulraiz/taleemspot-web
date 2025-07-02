import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaMapMarkerAlt, FaRegFilePdf, FaFileAlt, FaVideo } from 'react-icons/fa';
import { HiOutlineDocumentText, HiOutlineHeart, HiHeart } from 'react-icons/hi';

const AuthorProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser, userProfile } = useAuth();
  
  // State
  const [author, setAuthor] = useState(null);
  const [authorFiles, setAuthorFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    // Fetch author data and files when id is available
    if (id) {
      fetchAuthorData();
      fetchAuthorFiles();
    }
  }, [id]);

  useEffect(() => {
    // Check if current user is following this author
    if (id && userProfile && userProfile.following) {
      setFollowing(userProfile.following.includes(id));
    }
  }, [id, userProfile]);

  const fetchAuthorData = async () => {
    try {
      const authorDoc = await getDoc(doc(db, 'users', id));
      
      if (authorDoc.exists()) {
        setAuthor(authorDoc.data());
      } else {
        setError('Author not found');
        router.push('/404');
      }
    } catch (err) {
      setError('Error fetching author data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorFiles = async () => {
    if (!id) return;
    
    try {
      const q = query(collection(db, 'files'), where('userId', '==', id));
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
      setAuthorFiles(files);
    } catch (err) {
      console.error('Error fetching author files:', err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setLoadingFollow(true);

    try {
      // Update current user's following list
      const currentUserRef = doc(db, 'users', currentUser.uid);
      
      // Update author's followers list
      const authorRef = doc(db, 'users', id);
      
      if (following) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(id)
        });
        
        await updateDoc(authorRef, {
          followers: arrayRemove(currentUser.uid)
        });
        
        setFollowing(false);
      } else {
        // Follow
        await updateDoc(currentUserRef, {
          following: arrayUnion(id)
        });
        
        await updateDoc(authorRef, {
          followers: arrayUnion(currentUser.uid),
          followActivity: arrayUnion({
            userId: currentUser.uid,
            username: userProfile.username,
            fullName: userProfile.fullName,
            photoURL: userProfile.photoURL || null,
            timestamp: serverTimestamp()
          })
        });
        
        setFollowing(true);
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FaRegFilePdf className="h-8 w-8 text-red-500" />;
      case 'Document':
        return <FaFileAlt className="h-8 w-8 text-blue-500" />;
      case 'Lecture':
        return <FaVideo className="h-8 w-8 text-purple-500" />;
      default:
        return <HiOutlineDocumentText className="h-8 w-8 text-gray-500" />;
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

  const filterFiles = () => {
    if (selectedFileType === 'All') {
      return authorFiles;
    }
    return authorFiles.filter(file => file.fileType === selectedFileType);
  };
  
  const filteredFiles = filterFiles();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Author not found</h1>
          <p className="text-gray-600 mt-2">The author profile you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md mr-2"
              >
                Back
              </button>
              {currentUser && (
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md"
                >
                  My Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Author Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6 md:ml-10">
              <div className="relative">
                {author.photoURL ? (
                  <img
                    src={author.photoURL}
                    alt={author.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {author.fullName ? author.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-6 pb-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{author.fullName}</h2>
                  {author.role && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {author.role}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">@{author.username}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {author.education && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaGraduationCap className="mr-1" />
                      <span>{author.education}</span>
                    </div>
                  )}
                  {author.province && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{author.province}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {currentUser && currentUser.uid !== id && (
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleFollow}
                    disabled={loadingFollow}
                    className={`flex items-center space-x-1 px-6 py-2 rounded-md font-medium ${
                      following 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {following ? (
                      <>
                        <HiHeart className="h-5 w-5 text-red-500" />
                        <span>{loadingFollow ? 'Processing...' : 'Following'}</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineHeart className="h-5 w-5" />
                        <span>{loadingFollow ? 'Processing...' : 'Follow'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 mt-6 border-b border-gray-200 pb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{authorFiles.length || 0}</div>
                <div className="text-sm text-gray-500">Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{author.following ? author.following.length : 0}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{author.followers ? author.followers.length : 0}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{authorFiles.reduce((total, file) => total + (file.views || 0), 0)}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">4.5</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>

            {/* Bio Section */}
            {author.bio && (
              <div className="mt-6">
                <h3 className="text-gray-700 font-medium mb-2">Bio</h3>
                <p className="text-gray-600">{author.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Author Files */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {author.fullName}'s Resources
              </h3>
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
            </div>
            
            {filteredFiles.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No resources found</h3>
                <p className="text-gray-500">This author hasn't uploaded any resources yet.</p>
              </div>
            ) : (
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
            )}
          </div>
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

export default AuthorProfile;
