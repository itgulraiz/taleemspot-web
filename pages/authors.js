import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FaGraduationCap, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const Authors = () => {
  const router = useRouter();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  
  useEffect(() => {
    fetchAuthors();
  }, []);
  
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      // Query users who have at least one uploaded file (teachers/contributors)
      // You can adjust this query based on your needs
      const q = query(
        collection(db, 'users'),
        // Optional: where('role', '==', 'Teacher'), // If you want only teachers
        orderBy('fullName'),
        limit(100) // Limit for performance
      );
      
      const querySnapshot = await getDocs(q);
      const authorsList = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        authorsList.push({
          id: doc.id,
          fullName: userData.fullName,
          username: userData.username,
          photoURL: userData.photoURL,
          role: userData.role,
          province: userData.province,
          education: userData.education,
          bio: userData.bio,
          followers: userData.followers?.length || 0,
          uploads: userData.uploads || 0
        });
      });
      
      setAuthors(authorsList);
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter authors based on search term and filters
  const filteredAuthors = authors.filter(author => {
    const matchesSearch = searchTerm === '' || 
      author.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author.education && author.education.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === '' || author.role === filterRole;
    const matchesProvince = filterProvince === '' || author.province === filterProvince;
    
    return matchesSearch && matchesRole && matchesProvince;
  });
  
  // Get unique roles and provinces for filters
  const roles = [...new Set(authors.map(author => author.role).filter(Boolean))];
  const provinces = [...new Set(authors.map(author => author.province).filter(Boolean))];

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
            <div className="flex space-x-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 rounded-md"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Authors & Contributors</h1>
            
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search authors..."
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Provinces</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No authors found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuthors.map(author => (
                  <Link 
                    href={`/author/${author.id}`} 
                    key={author.id}
                  >
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          {author.photoURL ? (
                            <img
                              src={author.photoURL}
                              alt={author.fullName}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                              {author.fullName ? author.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900">{author.fullName}</h3>
                              {author.role && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  {author.role}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">@{author.username}</p>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              {author.education && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <FaGraduationCap className="mr-1" />
                                  <span>{author.education}</span>
                                </div>
                              )}
                              {author.province && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <FaMapMarkerAlt className="mr-1" />
                                  <span>{author.province}</span>
                                </div>
                              )}
                            </div>
                            
                            {author.bio && (
                              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{author.bio}</p>
                            )}
                            
                            <div className="mt-3 flex space-x-4 text-sm">
                              <div className="text-gray-700">
                                <span className="font-bold">{author.followers}</span> followers
                              </div>
                              <div className="text-gray-700">
                                <span className="font-bold">{author.uploads}</span> uploads
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>© {new Date().getFullYear()} TaleemSpot. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-400">
              Education platform for students and teachers across Pakistan.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default Authors;
