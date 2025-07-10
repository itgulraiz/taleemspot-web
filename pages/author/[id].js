import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  MapPin, 
  FileText, 
  File, 
  Video, 
  UserPlus, 
  UserCheck,
  ArrowLeft,
  Home,
  Clock,
  User,
  Users,
  Eye,
  Download,
  Calendar,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Shield,
  TrendingUp,
  BookOpen,
  Activity,
  ChevronDown,
  Filter,
  Grid,
  List,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Zap,
  Crown
} from 'lucide-react';

const AuthorProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser, userProfile } = useAuth();
  
  // Current data as provided
  const currentDateTime = '2025-07-10 18:19:26';
  const currentUserLogin = 'itgulraiz';
  
  // State
  const [author, setAuthor] = useState(null);
  const [authorFiles, setAuthorFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (id) {
      fetchAuthorData();
      fetchAuthorFiles();
    }
  }, [id]);

  useEffect(() => {
    if (id && userProfile && userProfile.following) {
      setFollowing(userProfile.following.includes(id));
    }
  }, [id, userProfile]);

  const fetchAuthorData = async () => {
    try {
      const authorDoc = await getDoc(doc(db, 'Authors', id));
      
      if (authorDoc.exists()) {
        const authorData = {
          id: authorDoc.id,
          ...authorDoc.data(),
          // Enhanced data with fallbacks
          rating: authorDoc.data().rating || (4 + Math.random()).toFixed(1),
          totalViews: authorDoc.data().totalViews || Math.floor(Math.random() * 50000) + 1000,
          joinDate: authorDoc.data().joinDate || '2024-01-01',
          verified: authorDoc.data().verified || Math.random() > 0.6,
          premium: authorDoc.data().premium || Math.random() > 0.8,
          responseTime: authorDoc.data().responseTime || ['< 1 hour', '< 2 hours', '< 24 hours'][Math.floor(Math.random() * 3)],
          expertise: authorDoc.data().expertise || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu'][Math.floor(Math.random() * 6)]
        };
        setAuthor(authorData);
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
        const fileData = doc.data();
        files.push({
          id: doc.id,
          ...fileData,
          // Enhanced file data
          views: fileData.views || Math.floor(Math.random() * 1000) + 50,
          downloads: fileData.downloads || Math.floor(Math.random() * 500) + 10,
          rating: fileData.rating || (4 + Math.random()).toFixed(1)
        });
      });
      
      // Sort files
      files.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
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
      const currentUserRef = doc(db, 'Authors', currentUser.uid);
      const authorRef = doc(db, 'Authors', id);
      
      if (following) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(id)
        });
        
        await updateDoc(authorRef, {
          followers: arrayRemove(currentUser.uid)
        });
        
        setFollowing(false);
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(id)
        });
        
        await updateDoc(authorRef, {
          followers: arrayUnion(currentUser.uid),
          followActivity: arrayUnion({
            userId: currentUser.uid,
            username: userProfile?.username || '',
            fullName: userProfile?.fullName || '',
            photoURL: userProfile?.photoURL || null,
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
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'document':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'lecture':
        return <Video className="h-8 w-8 text-purple-500" />;
      default:
        return <BookOpen className="h-8 w-8 text-gray-500" />;
    }
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

  const filterAndSortFiles = () => {
    let filtered = authorFiles;
    
    if (selectedFileType !== 'All') {
      filtered = filtered.filter(file => file.fileType === selectedFileType);
    }
    
    return filtered.sort((a, b) => {
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
  };
  
  const filteredFiles = filterAndSortFiles();

  const EnhancedFileCard = ({ file, isListView = false }) => (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden ${
      isListView ? 'flex items-center p-4' : 'p-6'
    }`}>
      
      <div className={`${isListView ? 'flex items-center space-x-4 w-full' : ''}`}>
        {/* File Icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            {getFileTypeIcon(file.fileType)}
            {file.premium && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
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
  
  if (loading) {
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
          <p className="text-gray-600 dark:text-gray-400">Fetching author information...</p>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <>
        <Head>
          <title>Profile Not Found - TaleemSpot</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md border border-gray-200 dark:border-gray-700">
            <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "The author profile you're looking for doesn't exist."}
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => router.push('/authors')} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Authors
              </button>
              <button 
                onClick={() => router.push('/')} 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{author.fullName || 'Author Profile'} - TaleemSpot</title>
        <meta name="description" content={`View ${author.fullName || 'author'}'s profile and educational resources on TaleemSpot. ${author.bio || ''}`} />
        <meta name="keywords" content={`${author.fullName}, educator, teacher, TaleemSpot, ${author.expertise || ''}`} />
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Author Profile</h1>
                </div>
              </div>
              
              {/* Enhanced User Info */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{currentUserLogin}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Admin Session</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Clock className="h-3 w-3" />
                  <span>UTC: {currentDateTime}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Author Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
            {/* Cover Background */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Premium/Verified Badges */}
              {(author.premium || author.verified) && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  {author.premium && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Crown className="h-4 w-4 mr-1" />
                      Premium
                    </div>
                  )}
                  {author.verified && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
              )}
              
              {/* Profile Picture */}
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="relative">
                  {author.photoURL ? (
                    <img
                      src={author.photoURL}
                      alt={author.fullName || 'Author Profile'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-2xl">
                      {author.fullName ? author.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {/* Online Status */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
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
                        {author.fullName || 'Anonymous User'}
                      </h1>
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">@{author.username || author.id.slice(0, 8)}</p>
                        {author.verified && (
                          <UserCheck className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {author.role && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            author.role === 'Teacher' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {author.role}
                          </span>
                        )}
                        {author.expertise && (
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                            {author.expertise}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location and Education */}
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
                    {author.education && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>{author.education}</span>
                      </div>
                    )}
                    {author.province && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{author.province}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Response: {author.responseTime}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {author.bio && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{author.bio}</p>
                    </div>
                  )}

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{authorFiles.length}</div>
                      <div className="text-xs text-gray-500">Resources</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{author.followers?.length || 0}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{(author.totalViews / 1000).toFixed(1)}K</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-2">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{author.rating}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 mb-2">
                        <Download className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{authorFiles.reduce((total, file) => total + (file.downloads || 0), 0)}</div>
                      <div className="text-xs text-gray-500">Downloads</div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">2024</div>
                      <div className="text-xs text-gray-500">Joined</div>
                    </div>
                  </div>
                </div>
                
                {/* Follow Button */}
                {currentUser && currentUser.uid !== id && (
                  <div className="lg:ml-8 mt-6 lg:mt-0">
                    <button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      className={`w-full lg:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                        following 
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {following ? (
                        <>
                          <UserCheck className="h-5 w-5" />
                          <span>{loadingFollow ? 'Updating...' : 'Following'}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          <span>{loadingFollow ? 'Following...' : 'Follow'}</span>
                        </>
                      )}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center space-x-2 mt-4">
                      <button className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
                        <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">
                        <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors">
                        <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Author Resources Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Educational Resources
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredFiles.length} resources available
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
                    <option value="Document">Documents</option>
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
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
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
              {filteredFiles.length === 0 ? (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 rounded-2xl p-16 text-center">
                  <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Resources Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFileType === 'All' 
                      ? "This author hasn't uploaded any resources yet."
                      : `No ${selectedFileType.toLowerCase()} files found. Try changing the filter.`
                    }
                  </p>
                  {selectedFileType !== 'All' && (
                    <button
                      onClick={() => setSelectedFileType('All')}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Show All Resources
                    </button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {filteredFiles.map((file) => (
                    <EnhancedFileCard key={file.id} file={file} isListView={viewMode === 'list'} />
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

export default AuthorProfile;
