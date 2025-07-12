import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Home as HomeIcon, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Adjust the path as necessary

// Helper function to extract Drive ID from URL
const extractDriveId = (url) => {
  try {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

const ResourceDetail = () => {
  const router = useRouter();
  const { board, class: classParam, type, documentId } = router.query;
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Navigation menu structure with dropdowns
  const navMenus = [
    { 
      name: 'Home',
      path: '/',
      dropdownItems: []
    },
    { 
      name: 'Past Papers',
      path: '/past-papers',
      dropdownItems: [
        { name: '9th Class', path: '/past-papers/9th' },
        { name: '10th Class', path: '/past-papers/10th' },
        { name: 'Lahore Board', path: '/past-papers/lahore' },
        { name: 'Federal Board', path: '/past-papers/federal' },
      ]
    },
    { 
      name: 'Notes',
      path: '/notes',
      dropdownItems: [
        { name: 'Biology', path: '/notes/biology' },
        { name: 'Physics', path: '/notes/physics' },
        { name: 'Chemistry', path: '/notes/chemistry' },
        { name: 'Mathematics', path: '/notes/math' },
      ]
    },
    { 
      name: 'Test Papers',
      path: '/test-papers',
      dropdownItems: [
        { name: '9th Class', path: '/test-papers/9th' },
        { name: '10th Class', path: '/test-papers/10th' },
        { name: 'First Term', path: '/test-papers/first-term' },
        { name: 'Final Term', path: '/test-papers/final-term' },
      ]
    }
  ];

  // Categories data
  const categoriesData = [
    {
      id: 1,
      name: "Biology",
      count: 24,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    },
    {
      id: 2,
      name: "Physics",
      count: 18,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    },
    {
      id: 3,
      name: "Chemistry",
      count: 15,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    },
    {
      id: 4,
      name: "Mathematics",
      count: 22,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    }
  ];

  // Toggle dropdown menu
  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  useEffect(() => {
    if (board && classParam && type && documentId) {
      setLoading(true);
      let collectionName;
      if (board !== 'general') {
        collectionName = `${board}${classParam}${type.charAt(0).toUpperCase() + type.slice(1)}`;
      } else {
        collectionName = `${classParam}${type.charAt(0).toUpperCase() + type.slice(1)}`;
      }
      const docRef = doc(db, collectionName, documentId);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const resourceData = {
            id: docSnap.id,
            title: data.content?.title || `Resource ${documentId}`,
            description: data.content?.description || `Details for resource ${documentId}`,
            subject: data.academicInfo?.subject || 'General',
            class: classParam,
            board: board === 'general' ? 'N/A' : board,
            year: data.academicInfo?.year || 'N/A',
            type: type.charAt(0).toUpperCase() + type.slice(1),
            url: data.content?.fileUrl || '#',
            driveId: extractDriveId(data.content?.fileUrl) || null,
            thumbnail: data.thumbnail || "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9",
          };
          setResource(resourceData);

          // Fetch related resources
          const fetchRelatedResources = async () => {
            const allResources = [];
            const collRef = collection(db, collectionName);
            const snapshot = await getDocs(collRef);
            snapshot.forEach((docSnap) => {
              if (docSnap.id !== documentId) {
                const docData = docSnap.data();
                const relatedDriveId = docData.content?.fileUrl ? extractDriveId(docData.content.fileUrl) : null;
                allResources.push({
                  id: docSnap.id,
                  title: docData.content?.title || `Related Resource ${docSnap.id}`,
                  description: docData.content?.description || `Related details for ${docSnap.id}`,
                  subject: docData.academicInfo?.subject || 'General',
                  class: classParam,
                  board: board === 'general' ? 'N/A' : board,
                  year: docData.academicInfo?.year || 'N/A',
                  type: type.charAt(0).toUpperCase() + type.slice(1),
                  url: docData.content?.fileUrl || '#',
                  driveId: relatedDriveId,
                  thumbnail: docData.thumbnail || "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9",
                });
              }
            });
            setRelatedResources(allResources.slice(0, 4));
          };
          fetchRelatedResources();
        } else {
          setResource(null);
        }
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching document:", error);
        setResource(null);
        setLoading(false);
      });
    }
  }, [board, classParam, type, documentId]);

  // AdSense Banner Component
  const AdSenseBanner = ({ slot = "1234567890", format = "auto" }) => {
    useEffect(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.log("AdSense error:", err);
      }
    }, []);

    return (
      <div className="my-4">
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1926773803487692"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-green-400 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-green-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-green-400 rounded"></div>
              <div className="h-4 bg-green-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Resource not found</h1>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with App Install Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm md:text-base font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2v-2a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
            </svg>
            <span className="hidden md:inline">Download</span> TaleemSpot App <span className="hidden md:inline">- Access Anywhere!</span>
          </span>
          <div className="hidden md:flex ml-2 items-center">
            <span className="bg-yellow-500 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
          </div>
        </div>
        <a 
          href="https://play.google.com/store/apps/details?id=com.taleemspot.notes"
          target="_blank"
          rel="noopener noreferrer" 
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 512 512">
            <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
          </svg>
          Install App
        </a>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                alt="TaleemSpot Logo" 
                className="h-12 w-12 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                }}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">TaleemSpot</span>
            </div>

            {/* Back to Home Button */}
            <Link 
              href="/"
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs with Dropdowns */}
      <div className="bg-green-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            {navMenus.map((menu) => (
              <div key={menu.name} className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(menu.name);
                  }}
                  className={`px-6 py-4 flex items-center space-x-1 hover:bg-green-700 transition-colors ${activeTab === menu.name ? 'bg-green-700' : ''}`}
                >
                  <span>{menu.name}</span>
                  {menu.dropdownItems.length > 0 && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                  )}
                </button>
                
                {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                  <div className="absolute top-full left-0 bg-white text-gray-800 shadow-lg rounded-b-lg min-w-[200px] z-50">
                    {menu.dropdownItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile Navigation */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            {navMenus.map((menu) => (
              <div key={menu.name}>
                <button
                  onClick={() => toggleDropdown(menu.name)}
                  className={`w-full flex justify-between items-center px-4 py-3 border-b border-green-500 ${openDropdown === menu.name ? 'bg-green-700' : ''}`}
                >
                  <span>{menu.name}</span>
                  {menu.dropdownItems.length > 0 && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                  )}
                </button>
                
                {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                  <div className="bg-green-800">
                    {menu.dropdownItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="block px-8 py-2 hover:bg-green-700 border-b border-green-700 last:border-0"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {/* Resource Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{resource.title}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {resource.subject}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {resource.class} Class
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {resource.board === 'N/A' ? 'General' : resource.board}
                      </span>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {resource.year}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-4">{resource.description}</p>
              </div>

              {/* AdSense Banner */}
              <AdSenseBanner slot="resource-top-banner" format="horizontal" />

              {/* Google Drive Embed */}
              {resource.driveId && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Preview Document</h2>
                  <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                    <iframe 
                      src={`https://drive.google.com/file/d/${resource.driveId}/preview`}
                      width="100%" 
                      height="600" 
                      allow="autoplay"
                      className="w-full"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Download Button */}
              {resource.url && (
                <div className="mb-8">
                  <a 
                    href={resource.url} 
                    download
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              )}

              {/* AdSense Banner */}
              <AdSenseBanner slot="resource-bottom-banner" format="horizontal" />

              {/* Related Resources */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {relatedResources.map(item => (
                    item.id ? (
                      <Link 
                        key={item.id} 
                        href={`/resource/${item.board === 'N/A' ? 'general' : item.board}/${item.class}/${item.type.toLowerCase()}/${item.id}`}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{item.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.subject} • {item.class} Class
                        </p>
                      </Link>
                    ) : null
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Subject Categories
              </h3>
              <div className="space-y-2">
                {categoriesData.map((category) => (
                  <div key={category.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AdSense Sidebar Banner */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <AdSenseBanner slot="sidebar-banner" format="vertical" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold mb-4">About TaleemSpot</h3>
              <p className="text-sm text-gray-300">
                TaleemSpot is your one-stop platform for educational resources, providing high-quality notes, past papers, and test papers for students across various boards and classes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navMenus.map((menu) => (
                  <li key={menu.name}>
                    <Link href={menu.path} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {menu.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-sm text-gray-300">
                Email: support@taleemspot.com
                <br />
                Phone: +92 123 456 7890
                <br />
                Address: 123 Education Lane, Lahore, Pakistan
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-4 text-center">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} TaleemSpot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResourceDetail;
