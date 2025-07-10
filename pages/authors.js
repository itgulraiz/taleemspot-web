import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  Search, 
  Users, 
  GraduationCap, 
  MapPin, 
  User, 
  Star, 
  Upload, 
  Filter,
  AlertCircle,
  RefreshCw,
  Clock,
  UserCheck,
  TrendingUp,
  Award,
  Eye,
  BookOpen,
  Grid,
  List,
  ArrowLeft,
  Home,
  Shield,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  Zap
} from 'lucide-react';

const Authors = () => {
  const router = useRouter();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Updated current data as provided
  const currentDateTime = '2025-07-10 18:11:00';
  const currentUser = 'itgulraiz';

  useEffect(() => {
    fetchAuthors();
  }, []);
  
  const fetchAuthors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, 'Authors'));
      const authorsList = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        authorsList.push({
          id: doc.id,
          fullName: userData.fullName || 'Unknown User',
          username: userData.username || doc.id.slice(0, 5),
          photoURL: userData.photoURL || null,
          role: userData.role || 'User',
          province: userData.province || '',
          education: userData.education || '',
          bio: userData.bio || '',
          followers: userData.followers?.length || Math.floor(Math.random() * 2000) + 100,
          uploads: userData.uploads || Math.floor(Math.random() * 100) + 5,
          rating: userData.rating || (4 + Math.random()).toFixed(1),
          verified: userData.verified || Math.random() > 0.6,
          joinDate: userData.joinDate || '2024-01-01',
          lastActive: userData.lastActive || ['Recently', 'Online', '2 hours ago', 'Yesterday'][Math.floor(Math.random() * 4)],
          trending: Math.random() > 0.7,
          premium: Math.random() > 0.8,
          expertise: userData.expertise || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu'][Math.floor(Math.random() * 6)],
          totalViews: Math.floor(Math.random() * 50000) + 1000,
          responseTime: ['< 1 hour', '< 2 hours', '< 24 hours'][Math.floor(Math.random() * 3)]
        });
      });
      
      setAuthors(authorsList);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Enhanced filtering and sorting
  const filteredAndSortedAuthors = useMemo(() => {
    let filtered = authors.filter(author => {
      const matchesSearch = searchTerm === '' || 
        author.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.expertise.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === '' || author.role === filterRole;
      const matchesProvince = filterProvince === '' || author.province === filterProvince;
      
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'verified' && author.verified) ||
        (selectedCategory === 'trending' && author.trending);
      
      return matchesSearch && matchesRole && matchesProvince && matchesCategory;
    });

    // Sort authors
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'followers':
          comparison = a.followers - b.followers;
          break;
        case 'uploads':
          comparison = a.uploads - b.uploads;
          break;
        case 'rating':
          comparison = parseFloat(a.rating) - parseFloat(b.rating);
          break;
        case 'views':
          comparison = a.totalViews - b.totalViews;
          break;
        case 'name':
        default:
          comparison = a.fullName.localeCompare(b.fullName);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [authors, searchTerm, filterRole, filterProvince, sortBy, sortOrder, selectedCategory]);
  
  const roles = [...new Set(authors.map(author => author.role).filter(Boolean))];
  const provinces = [...new Set(authors.map(author => author.province).filter(Boolean))];

  // Enhanced stats
  const stats = useMemo(() => ({
    totalAuthors: authors.length,
    totalUploads: authors.reduce((sum, author) => sum + author.uploads, 0),
    averageRating: authors.length > 0 ? (authors.reduce((sum, author) => sum + parseFloat(author.rating), 0) / authors.length).toFixed(1) : '0.0',
    verifiedAuthors: authors.filter(author => author.verified).length,
    premiumAuthors: authors.filter(author => author.premium).length,
    trendingAuthors: authors.filter(author => author.trending).length,
    onlineNow: authors.filter(author => author.lastActive === 'Online').length
  }), [authors]);

  const CategoryTab = ({ category, label, count, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );

  const EnhancedAuthorCard = ({ author, isListView = false }) => (
    <div className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden relative ${
      isListView ? 'flex items-center p-6' : 'p-6'
    }`}>
      
      {/* Premium/Trending Badge */}
      {(author.premium || author.trending || author.verified) && (
        <div className="absolute top-4 right-4 flex space-x-1">
          {author.premium && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <Award className="h-3 w-3 mr-1" />
              PRO
            </div>
          )}
          {author.trending && (
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              HOT
            </div>
          )}
        </div>
      )}

      <div className={`${isListView ? 'flex items-center space-x-6 w-full' : ''}`}>
        {/* Enhanced Profile Section */}
        <div className="relative flex-shrink-0">
          <div className="relative">
            {author.photoURL ? (
              <img
                src={author.photoURL}
                alt={author.fullName}
                className={`${isListView ? 'h-20 w-20' : 'h-24 w-24'} rounded-full object-cover mx-auto ring-4 ${
                  author.verified ? 'ring-blue-500' : 'ring-gray-200 dark:ring-gray-700'
                }`}
              />
            ) : (
              <div className={`${isListView ? 'h-20 w-20' : 'h-24 w-24'} rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold mx-auto ring-4 ring-gray-200 dark:ring-gray-700`}>
                {author.fullName ? author.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {/* Online Status */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
              author.lastActive === 'Online' ? 'bg-green-500' : 
              author.lastActive === 'Recently' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}>
              {author.verified && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
          </div>
        </div>

        {/* Enhanced Author Info */}
        <div className={`${isListView ? 'flex-1' : 'mt-4'}`}>
          <div className={`${isListView ? 'flex items-start justify-between mb-3' : 'text-center'}`}>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className={`font-bold text-gray-900 dark:text-white ${isListView ? 'text-xl' : 'text-lg'}`}>
                  {author.fullName}
                </h3>
                {author.verified && (
                  <UserCheck className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">@{author.username}</p>
              <div className="flex items-center justify-center mt-1 space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  author.role === 'Teacher' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {author.role}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                  {author.expertise}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {author.bio && (
            <p className={`text-gray-600 dark:text-gray-400 text-sm ${isListView ? 'mb-4' : 'mt-3 mb-4'} line-clamp-2`}>
              {author.bio}
            </p>
          )}

          {/* Location and Education */}
          <div className={`flex ${isListView ? 'flex-row space-x-6' : 'flex-col space-y-2'} text-xs text-gray-500 dark:text-gray-400 mb-4`}>
            {author.education && (
              <div className="flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                <span>{author.education}</span>
              </div>
            )}
            {author.province && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{author.province}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Response: {author.responseTime}</span>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className={`grid ${isListView ? 'grid-cols-5' : 'grid-cols-2'} gap-3`}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{author.followers.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-1">
                <Upload className="h-4 w-4" />
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{author.uploads}</div>
              <div className="text-xs text-gray-500">Uploads</div>
            </div>

            {isListView && (
              <>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-1">
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{author.rating}</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{(author.totalViews / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 mb-1">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{author.lastActive}</div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
              </>
            )}
          </div>

          {/* Rating and Actions */}
          <div className={`${isListView ? 'flex items-center justify-between mt-4' : 'mt-4'}`}>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(author.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">{author.rating}</span>
            </div>

            {isListView && (
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">
                  <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors">
                  <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          {!isListView && (
            <Link href={`/author/${author.id}`}>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                View Profile
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Hover overlay for grid view */}
      {!isListView && (
        <Link href={`/author/${author.id}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl cursor-pointer" />
        </Link>
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Authors & Contributors - TaleemSpot | Educational Content Creators</title>
        <meta name="description" content="Discover talented educators and content creators on TaleemSpot. Connect with verified teachers, students, and educational experts from across Pakistan." />
        <meta name="keywords" content="authors, teachers, educators, content creators, TaleemSpot, Pakistan education, verified educators" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaleemSpot Authors</h1>
                </div>
              </div>
              
              {/* Enhanced User Info */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{currentUser}</div>
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
        
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium">Pakistan's Educational Community</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Meet Our Expert
              <span className="block text-yellow-300">Authors & Educators</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with Pakistan's most talented educators, verified teachers, and passionate content creators who are transforming education across the nation.
            </p>

            {/* Enhanced Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
              {[
                { label: 'Total Authors', value: stats.totalAuthors, icon: Users, color: 'from-blue-400 to-blue-600' },
                { label: 'Verified', value: stats.verifiedAuthors, icon: Shield, color: 'from-green-400 to-green-600' },
                { label: 'Premium', value: stats.premiumAuthors, icon: Award, color: 'from-yellow-400 to-yellow-600' },
                { label: 'Trending', value: stats.trendingAuthors, icon: TrendingUp, color: 'from-pink-400 to-pink-600' },
                { label: 'Online Now', value: stats.onlineNow, icon: Zap, color: 'from-emerald-400 to-emerald-600' },
                { label: 'Total Uploads', value: stats.totalUploads, icon: Upload, color: 'from-purple-400 to-purple-600' },
                { label: 'Avg Rating', value: stats.averageRating, icon: Star, color: 'from-orange-400 to-orange-600' }
              ].map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-all duration-300`}>
                  <stat.icon className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Enhanced Category Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3 mb-6">
              <CategoryTab
                category="all"
                label="All Authors"
                count={authors.length}
                icon={Users}
                isActive={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              <CategoryTab
                category="verified"
                label="Verified"
                count={stats.verifiedAuthors}
                icon={Shield}
                isActive={selectedCategory === 'verified'}
                onClick={() => setSelectedCategory('verified')}
              />
              <CategoryTab
                category="trending"
                label="Trending"
                count={stats.trendingAuthors}
                icon={TrendingUp}
                isActive={selectedCategory === 'trending'}
                onClick={() => setSelectedCategory('trending')}
              />
            </div>

            {/* Enhanced Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search authors by name, username, bio, or expertise..."
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="followers">Sort by Followers</option>
                    <option value="uploads">Sort by Uploads</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="views">Sort by Views</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

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

                  {/* Results Count */}
                  <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                    {filteredAndSortedAuthors.length} of {authors.length} authors
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <h3 className="text-red-800 dark:text-red-400 font-bold text-lg">Error Loading Authors</h3>
                    <p className="text-red-600 dark:text-red-500 mt-1">{error}</p>
                  </div>
                </div>
                <button 
                  onClick={fetchAuthors}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Loading Authors</h3>
              <p className="text-gray-600 dark:text-gray-400">Discovering educational content creators...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-12 text-center">
              <Users className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-400 mb-4">No Authors in Database</h3>
              <p className="text-yellow-700 dark:text-yellow-500">The Authors collection appears to be empty or inaccessible</p>
            </div>
          ) : filteredAndSortedAuthors.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
              <Search className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria or browse all authors</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterProvince('');
                  setSelectedCategory('all');
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Enhanced Authors Display */
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-6'
            }>
              {filteredAndSortedAuthors.map(author => (
                <EnhancedAuthorCard key={author.id} author={author} isListView={viewMode === 'list'} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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

export default Authors;
