import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Download, BookOpen, Users, ChevronDown, ExternalLink, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TaleemSpot = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Static data for demonstration - expanded with more fields
  const staticData = [
    {
      id: 1,
      title: "9th Class Biology Chapter 1 - Introduction to Biology",
      description: "Complete notes covering the fundamental concepts of biology, cell structure, and basic biological processes.",
      subject: "Biology",
      class: "9th",
      board: "Punjab",
      year: "2024",
      type: "Notes",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    },
    {
      id: 2,
      title: "9th Class Physics Chapter 2 - Kinematics",
      description: "Detailed notes on motion, velocity, acceleration, and equations of motion with solved examples.",
      subject: "Physics", 
      class: "9th",
      board: "Punjab",
      year: "2024",
      type: "Notes",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    },
    {
      id: 3,
      title: "9th Class Chemistry Chapter 1 - Fundamentals of Chemistry",
      description: "Basic concepts of chemistry, atomic structure, and chemical bonding explained in simple language.",
      subject: "Chemistry",
      class: "9th",
      board: "Punjab", 
      year: "2024",
      type: "Notes",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    },
    {
      id: 4,
      title: "10th Class Mathematics Chapter 3 - Quadratic Equations",
      description: "Comprehensive guide to solving quadratic equations with step-by-step examples and practice problems.",
      subject: "Mathematics",
      class: "10th",
      board: "Federal",
      year: "2024",
      type: "Notes",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    },
    {
      id: 5,
      title: "9th Class Biology Past Paper 2023 - Lahore Board",
      description: "Complete solved past paper for 9th class Biology from Lahore Board examination 2023.",
      subject: "Biology",
      class: "9th",
      board: "Lahore",
      year: "2023",
      type: "Past Paper",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    },
    {
      id: 6,
      title: "10th Class Physics Test Paper - First Term",
      description: "Comprehensive test paper for 10th class Physics covering the first term syllabus with solutions.",
      subject: "Physics",
      class: "10th",
      board: "Punjab",
      year: "2024",
      type: "Test Paper",
      url: "#",
      thumbnail: "/drawbles/logo.png" 
    }
  ];

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
      icon: "/drawbles/logo.png" 
    },
    {
      id: 2,
      name: "Physics",
      count: 18,
      icon: "/drawbles/logo.png" 
    },
    {
      id: 3,
      name: "Chemistry",
      count: 15,
      icon: "/drawbles/logo.png" 
    },
    {
      id: 4,
      name: "Mathematics",
      count: 22,
      icon: "/drawbles/logo.png" 
    },
    {
      id: 5,
      name: "English",
      count: 16,
      icon: "/drawbles/logo.png" 
    },
    {
      id: 6,
      name: "Urdu",
      count: 14,
      icon: "/drawbles/logo.png" 
    }
  ];

  // Board categories
  const boardCategories = [
    {
      id: 1,
      name: "Punjab Board",
      count: 45,
    },
    {
      id: 2,
      name: "Lahore Board",
      count: 32,
    },
    {
      id: 3,
      name: "Federal Board",
      count: 28,
    },
    {
      id: 4,
      name: "Faisalabad Board",
      count: 22,
    }
  ];

  // Class categories
  const classCategories = [
    {
      id: 1,
      name: "9th Class",
      count: 56,
    },
    {
      id: 2,
      name: "10th Class",
      count: 49,
    },
    {
      id: 3,
      name: "11th Class",
      count: 38,
    },
    {
      id: 4,
      name: "12th Class",
      count: 42,
    }
  ];

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(staticData);
    } else {
      const filtered = staticData.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm]);

  // Initialize filtered data on component mount
  useEffect(() => {
    setFilteredData(staticData);
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (menuName) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // ResourceCard Component
  const ResourceCard = ({ resource }) => {
    return (
      <a 
        href={`/resource/${resource.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {resource.subject} • {resource.class} Class
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {resource.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              {resource.type || "Notes"}
            </span>
            <div className="flex items-center text-blue-600 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>Open</span>
            </div>
          </div>
        </div>
      </a>
    );
  };

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
      <div className="my-4 p-2 border border-gray-300 rounded-lg bg-gray-50 text-center">
        <div className="text-red-600 font-bold text-lg mb-2">AdSense Banner Ads</div>
        <div className="text-sm text-gray-600">
          Ad Slot: {slot} | Format: {format}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {/* Replace with actual AdSense code */}
          <ins 
            className="adsbygoogle"
            style={{display: 'block'}}
            data-ad-client="ca-pub-1926773803487692"
            data-ad-slot="6001475521"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with App Install Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white py-3 px-4 flex justify-between items-center">
        <span className="text-sm font-medium">Install TaleemSpot App From the Play Store</span>
        <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Install Our APP
        </button>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/drawbles/logo.png" 
                alt="TaleemSpot Logo" 
                className="h-12 w-12 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                }}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">TaleemSpot</span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Past Paper, Notes, and other type here"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Past Paper, Notes, and other type here"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-lg">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">TaleemSpot</h3>
                  <p className="text-sm text-gray-600">Education Portal</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-center font-medium">
                  Latest Resources
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Resources</span>
                  <span className="font-bold text-green-600">100+</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm mt-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Join 10,000+ Students</span>
                </div>
              </div>
            </div>

            {/* Class Categories */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Class
              </h3>
              <div className="space-y-2">
                {classCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Board Categories */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Boards
              </h3>
              <div className="space-y-2">
                {boardCategories.map((board) => (
                  <div key={board.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      {board.name}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {board.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Top AdSense Banner */}
            <AdSenseBanner slot="top-banner-slot" format="horizontal" />

            {/* Featured Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-700 p-1 rounded mr-2">
                  <BookOpen className="h-5 w-5" />
                </span>
                Featured Resources
              </h2>
              
              {/* Featured Card - Large */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      9th Class Complete Notes Package
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive notes for all subjects of 9th class, including Biology, Physics, Chemistry, and Mathematics.
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        All Subjects
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        9th Class
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Punjab Board
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <Link 
                      href="/resource/featured"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results Label */}
            {searchTerm && (
              <div className="mb-4 text-gray-700">
                Showing results for: <span className="font-medium text-green-600">"{searchTerm}"</span>
                <span className="ml-2 text-sm text-gray-500">({filteredData.length} items found)</span>
              </div>
            )}

            {/* Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No results found</h3>
                    <p className="text-gray-500 mt-2">Try using different keywords or browse categories</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom AdSense Banner */}
            <AdSenseBanner slot="bottom-banner-slot" format="horizontal" />

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm">
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-l-md text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </a>
                <a href="#" className="py-2 px-4 bg-green-600 border border-green-600 text-sm font-medium text-white">
                  1
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-r-md text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </a>
              </nav>
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
              <button className="mt-3 w-full text-center text-sm text-green-600 hover:text-green-800 py-2">
                View All Categories
              </button>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Our Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Notes</span>
                  <span className="font-bold text-green-600">1,000+</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Past Papers</span>
                  <span className="font-bold text-green-600">500+</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Students</span>
                  <span className="font-bold text-green-600">10,000+</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Daily Visitors</span>
                  <span className="font-bold text-green-600">5,000+</span>
                </div>
              </div>
            </div>

            {/* AdSense Banner */}
            <AdSenseBanner slot="sidebar-banner-slot" format="vertical" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xl font-bold">TaleemSpot</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your ultimate destination for educational resources, past papers, and notes. We're dedicated to helping students achieve academic excellence.
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Past Papers
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Notes
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Test Papers
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Download App
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> FAQ
                </a></li>
                <li><a href="#" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> About Us
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <div className="space-y-3 text-sm">
                <p className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@taleemspot.com
                </p>
                <p className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Faisalabad, Punjab, Pakistan
                </p>
                <p className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +92 300 1234567
                </p>
              </div>
              <div className="mt-4">
                <h5 className="font-medium mb-2">Subscribe to our newsletter</h5>
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="py-2 px-3 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-green-500 w-full text-sm"
                  />
                  <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-r-lg text-sm transition-colors">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-2 md:mb-0">
              &copy; 2025 TaleemSpot. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaleemSpot;
