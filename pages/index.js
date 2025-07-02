import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Search, Menu, X, Download, BookOpen, Users, ChevronDown, ExternalLink, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

// Helper function to extract Drive ID from URL
function extractDriveId(url) {
  try {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export async function getStaticProps() {
  try {
    // Get all collections
    const collections = [
      "Punjab9thPastPapers",
      "Punjab10thPastPapers",
      "Punjab11thPastPapers",
      "Punjab12thPastPapers",
      "PunjabECATPastPapers",
      "PunjabMDCATPastPapers"
    ];

    let allData = [];
    let classCategories = [];
    
    // Process each collection
    for (const collectionName of collections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);
        
        if (!snapshot.empty) {
          // Extract class info for categories
          const className = collectionName
            .replace("Punjab", "")
            .replace("PastPapers", "")
            .replace("ECAT", "ECAT ")
            .replace("MDCAT", "MDCAT ");
          
          const displayName = collectionName.includes("ECAT") || collectionName.includes("MDCAT") 
            ? className.trim() 
            : `${className.trim()} Class`;
            
          classCategories.push({
            id: collectionName,
            name: displayName,
            count: snapshot.size
          });
          
          // Process each document in the collection
          snapshot.forEach(doc => {
            const data = doc.data();
            
            // If this document has subjects array, process it
            if (data.subjects && Array.isArray(data.subjects)) {
              data.subjects.forEach((subject, index) => {
                if (subject.url && subject.board && subject.year) {
                  // Create a record for each subject
                  const driveId = extractDriveId(subject.url);
                  allData.push({
                    id: `${collectionName}-${doc.id}-${index}`,
                    title: `${displayName} ${doc.id} ${subject.year} - ${subject.board} Board`,
                    description: `Download ${displayName} ${doc.id} past paper from ${subject.board} Board for the year ${subject.year}`,
                    subject: doc.id,
                    class: className.trim(),
                    board: subject.board,
                    year: subject.year,
                    type: "Past Paper",
                    url: subject.url,
                    downloadUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
                    driveId: driveId,
                    collection: collectionName,
                    documentId: doc.id,
                    itemIndex: index,
                    path: `/${collectionName}/${doc.id}/${index}`
                  });
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
      }
    }

    // Generate board categories based on the data
    const boardsSet = new Set();
    allData.forEach(item => boardsSet.add(item.board));
    
    const boardCategories = Array.from(boardsSet).map((board, index) => ({
      id: index + 1,
      name: `${board} Board`,
      count: allData.filter(item => item.board === board).length
    }));

    // Generate subject categories based on the data
    const subjectsSet = new Set();
    allData.forEach(item => subjectsSet.add(item.subject));
    
    const subjectCategories = Array.from(subjectsSet).map((subject, index) => ({
      id: index + 1,
      name: subject,
      count: allData.filter(item => item.subject === subject).length,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    }));

    // Take only the most recent 20 items for the homepage
    const featuredData = allData
      .sort((a, b) => b.year - a.year)
      .slice(0, 20);

    return {
      props: {
        resources: featuredData,
        allResources: allData,
        classCategories,
        boardCategories,
        subjectCategories
      },
      // Revalidate every 24 hours
      revalidate: 86400
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        resources: [],
        allResources: [],
        classCategories: [],
        boardCategories: [],
        subjectCategories: []
      },
      revalidate: 3600 // Retry sooner if there was an error
    };
  }
}

// Memoized ResourceCard Component for optimized rendering
const ResourceCard = memo(({ resource }) => {
  return (
    <a 
      href={resource.path}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {resource.subject} • {resource.class} {resource.class.includes('ECAT') || resource.class.includes('MDCAT') ? '' : 'Class'}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
            {resource.year}
          </span>
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Open</span>
          </div>
        </div>
      </div>
    </a>
  );
});

ResourceCard.displayName = 'ResourceCard';

// Optimized AdSense Banner Component with lazy loading
const AdSenseBanner = memo(({ slot = "1234567890", format = "auto" }) => {
  const adRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          try {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          } catch (err) {
            console.log("AdSense error:", err);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (adRef.current) {
      observer.observe(adRef.current);
    }
    
    return () => {
      if (adRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="my-4" ref={adRef}>
      <ins 
        className="adsbygoogle"
        style={{display: 'block'}}
        data-ad-client="ca-pub-1926773803487692"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
});

AdSenseBanner.displayName = 'AdSenseBanner';

// Mobile Top Auth Links component
const MobileTopAuthLinks = memo(({ router }) => {
  return (
    <div className="flex items-center space-x-2">
      <Link href="/login" className="text-xs font-medium text-blue-700 dark:text-blue-400">
        Login
      </Link>
      <Link href="/register" className="text-xs font-medium text-green-700 dark:text-green-400">
        Register
      </Link>
      <Link href="/authors" className="text-xs font-medium text-purple-700 dark:text-purple-400">
        Authors
      </Link>
    </div>
  );
});

MobileTopAuthLinks.displayName = 'MobileTopAuthLinks';

const TaleemSpot = ({ resources, allResources, classCategories, boardCategories, subjectCategories }) => {
  const router = useRouter();
  const { currentUser, userProfile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filteredData, setFilteredData] = useState(resources || []);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [theme, setTheme] = useState('light');
  
  // Reference to the menu dropdown
  const dropdownRef = useRef(null);

  // Navigation menu structure with dropdowns - memoized to prevent unnecessary recreations
  const navMenus = useMemo(() => [
    { 
      name: 'Home',
      path: '/',
      dropdownItems: []
    },
    { 
      name: 'Past Papers',
      path: '#',
      dropdownItems: classCategories.map(cat => ({
        name: cat.name,
        path: `/${cat.id}`
      }))
    },
    { 
      name: 'Subjects',
      path: '#',
      dropdownItems: subjectCategories.slice(0, 8).map(subject => ({
        name: subject.name,
        path: `/subject/${subject.name}`
      }))
    },
    { 
      name: 'Boards',
      path: '#',
      dropdownItems: boardCategories.slice(0, 8).map(board => ({
        name: board.name,
        path: `/board/${board.name.replace(' Board', '')}`
      }))
    }
  ], [classCategories, subjectCategories, boardCategories]);

  // Handle search functionality with optimization
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredData(resources);
        setSearchSuggestions([]);
      } else {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        const filtered = allResources.filter(item => {
          return searchTerms.every(term => 
            item.title.toLowerCase().includes(term) || 
            item.description.toLowerCase().includes(term) ||
            item.subject.toLowerCase().includes(term) ||
            item.class.toLowerCase().includes(term) ||
            item.board.toLowerCase().includes(term) ||
            item.year.toString().includes(term)
          );
        });
        
        setFilteredData(filtered);
        
        if (searchTerm.length > 2) {
          const suggestions = [];
          
          // Add subject suggestions
          subjectCategories.forEach(subject => {
            if (subject.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: subject.name, type: 'subject' });
            }
          });
          
          // Add board suggestions
          boardCategories.forEach(board => {
            if (board.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: board.name, type: 'board' });
            }
          });
          
          // Add class suggestions
          classCategories.forEach(cls => {
            if (cls.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: cls.name, type: 'class' });
            }
          });
          
          // Add year suggestions
          const years = [...new Set(allResources.map(item => item.year))];
          years.forEach(year => {
            if (year.toString().includes(searchTerm)) {
              suggestions.push({ text: year.toString(), type: 'year' });
            }
          });
          
          // Add combined suggestions
          subjectCategories.slice(0, 5).forEach(subject => {
            classCategories.slice(0, 3).forEach(cls => {
              const combined = `${subject.name} ${cls.name}`;
              if (combined.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.push({ text: combined, type: 'combined' });
              }
            });
          });
          
          setSearchSuggestions(suggestions.slice(0, 10)); // Limit to 10 suggestions
        } else {
          setSearchSuggestions([]);
        }
      }
    }, 300); // Debouncing search to improve performance
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, resources, allResources, subjectCategories, boardCategories, classCategories]);

  // Toggle dropdown menu
  const toggleDropdown = (e, menuName) => {
    e.preventDefault();
    e.stopPropagation();
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Check for saved theme preference
  useEffect(() => {
    // Preload critical resources
    if (typeof window !== 'undefined') {
      // Preload fonts
      const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      if (fontLinks.length === 0) {
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        fontPreload.as = 'style';
        document.head.appendChild(fontPreload);
      }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Memoize featured content for better performance
  const featuredContent = useMemo(() => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 dark:text-black">
          Share your notes, past papers, and study materials with thousands of students and teachers across the country.
          Access your content anytime, anywhere — all in one place. Make learning easier. Make teaching smarter.
          Download the Taleem Spot app now on the Play Store!
        </p>
        <div className="mt-3 flex justify-center">
          <a 
            href="https://play.google.com/store/apps/details?id=com.taleemspot.notes"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 512 512">
              <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
            </svg>
            <span>Get it on Play Store</span>
          </a>
        </div>
      </div>
    </div>
  ), []);

  return (
    <>
      <Head>
        <title>TaleemSpot - Pakistan&apos;s #1 Education Resource Platform</title>
        <meta name="description" content="Access past papers, notes, and educational resources for 9th, 10th, 11th, 12th classes and entry tests from all Punjab boards." />
        <meta name="keywords" content="past papers, Punjab board, education, Pakistan, 9th class, 10th class, ECAT, MDCAT" />
        <meta property="og:title" content="TaleemSpot - Pakistan's #1 Education Resource Platform" />
        <meta property="og:description" content="Access past papers, notes, and educational resources for all Punjab boards." />
        <meta property="og:url" content="https://taleemspot.com" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="canonical" href="https://taleemspot.com" />
        {/* Preload important assets */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* Header with App Install Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm md:text-base font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2v-2a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
              </svg>
              <span className="hidden md:inline">Download</span> TaleemSpot App <span className="hidden md:inline"> - Access Anywhere!</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 512 512">
              <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
            </svg>
            Install App
          </a>
        </div>

        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center py-3">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                  alt="TaleemSpot Logo" 
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                  loading="eager"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                  }}
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">TaleemSpot</span>
              </Link>

              {/* Search Bar - Desktop */}
              <div className="flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Past Papers, Subjects, Boards..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  {/* Search suggestions */}
                  {searchTerm && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer"
                          onClick={() => setSearchTerm(suggestion.text)}
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="dark:text-white">{suggestion.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Auth Buttons - Desktop */}
              <div className="flex space-x-4">
                <button 
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                {currentUser ? (
                  <>
                    <button 
                      onClick={() => router.push('/profile')}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => router.push('/login')}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => router.push('/register')}
                      className="bg-white dark:bg-transparent text-blue-800 dark:text-blue-400 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-md"
                    >
                      Register
                    </button>
                    <button 
                      onClick={() => router.push('/authors')}
                      className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Authors
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Header - Improved with auth links on top */}
            <div className="md:hidden py-3">
              {/* Auth links & Search top row */}
              <div className="flex items-center justify-between mb-2">
                {/* Search Button */}
                <button 
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Search className="h-5 w-5 dark:text-white" />
                </button>
                
                {/* Mobile Auth Links */}
                {currentUser ? (
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push('/profile')}
                      className="p-1 mr-1 text-xs text-blue-600 dark:text-blue-400 font-medium"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-1 text-xs text-red-600 dark:text-red-400 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <MobileTopAuthLinks router={router} />
                )}
                
                {/* Theme toggle */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Logo & Menu button row */}
              <div className="flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                    alt="TaleemSpot" 
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                    loading="eager"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                    }}
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    TaleemSpot
                  </span>
                </Link>
                
                {/* Menu Button */}
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? 
                    <X className="h-6 w-6 dark:text-white" /> : 
                    <Menu className="h-6 w-6 dark:text-white" />
                  }
                </button>
              </div>
            </div>

            {/* Mobile Search Overlay with instant results */}
            {mobileSearchOpen && (
              <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex flex-col">
                <div className="bg-white dark:bg-gray-800 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium dark:text-white">Search</h3>
                    <button onClick={() => setMobileSearchOpen(false)}>
                      <X className="h-6 w-6 dark:text-white" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Past Papers, Subjects, Boards..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  {/* Search suggestions */}
                  {searchTerm && searchSuggestions.length > 0 && (
                    <div className="mt-2 bg-white dark:bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer"
                          onClick={() => {
                            setSearchTerm(suggestion.text);
                            setMobileSearchOpen(false);
                          }}
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="dark:text-white">{suggestion.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick search results */}
                  {searchTerm && filteredData.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Search Results:</h4>
                      <div className="max-h-96 overflow-y-auto">
                        {filteredData.slice(0, 5).map(item => (
                          <a 
                            key={item.id} 
                            href={item.path} 
                            className="block p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            onClick={() => setMobileSearchOpen(false)}
                          >
                            <h5 className="text-sm font-medium text-gray-800 dark:text-white">{item.title}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.subject} • {item.board}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Navigation Tabs with Dropdowns */}
        <div className="bg-green-600 dark:bg-green-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Navigation */}
            <div className="hidden md:flex" ref={dropdownRef}>
              {navMenus.map((menu) => (
                <div key={menu.name} className="relative group">
                  <button
                    onClick={(e) => toggleDropdown(e, menu.name)}
                    className={`px-6 py-4 flex items-center space-x-1 hover:bg-green-700 dark:hover:bg-green-900 transition-colors ${activeTab === menu.name ? 'bg-green-700 dark:bg-green-900' : ''}`}
                  >
                    <span>{menu.name}</span>
                    {menu.dropdownItems.length > 0 && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                    <div className="absolute top-full left-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg rounded-b-lg min-w-[200px] z-50 max-h-[400px] overflow-y-auto">
                      {menu.dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.path}
                          className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          {item.name}
                        </Link>
                      ))}
                      <Link 
                        href={menu.name === 'Past Papers' ? "/all-classes" : 
                              menu.name === 'Subjects' ? "/all-subjects" : 
                              menu.name === 'Boards' ? "/all-boards" : "#"}
                        className="block px-4 py-3 text-green-600 dark:text-green-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
                      >
                        View All {menu.name}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Navigation */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
              {/* First show cards directly below menu in mobile view */}
              {resources.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Featured Resources</h3>
                  <div className="space-y-2">
                    {resources.slice(0, 3).map((resource) => (
                      <Link href={resource.path} key={resource.id} className="block bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mr-3">
                            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{resource.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{resource.subject} • {resource.board}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            
              {navMenus.map((menu) => (
                <div key={menu.name}>
                  <button
                    onClick={(e) => toggleDropdown(e, menu.name)}
                    className={`w-full flex justify-between items-center px-4 py-3 border-b border-green-500 dark:border-green-700 ${openDropdown === menu.name ? 'bg-green-700 dark:bg-green-900' : ''}`}
                  >
                    <span>{menu.name}</span>
                    {menu.dropdownItems.length > 0 && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                    <div className="bg-green-800 dark:bg-green-900 max-h-[300px] overflow-y-auto">
                      {menu.dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.path}
                          className="block px-8 py-2 hover:bg-green-700 dark:hover:bg-green-800 border-b border-green-700 dark:border-green-800 last:border-0"
                        >
                          {item.name}
                        </Link>
                      ))}
                      <Link 
                        href={menu.name === 'Past Papers' ? "/all-classes" : 
                              menu.name === 'Subjects' ? "/all-subjects" : 
                              menu.name === 'Boards' ? "/all-boards" : "#"}
                        className="block px-8 py-2 text-white font-medium bg-green-700 dark:bg-green-800"
                      >
                        View All {menu.name}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Auth links for mobile */}
              {currentUser && (
                <div className="border-t border-green-500 dark:border-green-700">
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full text-left px-4 py-3 hover:bg-green-700 dark:hover:bg-green-900 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-green-700 dark:hover:bg-green-900 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mobile Content Order */}
            <div className="lg:hidden">
              {/* Featured Content First on Mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-1 rounded mr-2">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  Featured Resources
                </h2>
                
                {/* Featured text content with centered button */}
                {featuredContent}

                {/* Featured Card - Select resources */}
                {resources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resources.slice(0, 4).map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                )}
                
                {/* View All button for mobile */}
                {resources.length > 4 && (
                  <div className="mt-4 text-center">
                    <Link href="/all-resources" className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                      View All Resources
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Board Categories - Mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Boards
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {boardCategories.slice(0, 4).map((board) => (
                    <Link
                      href={`/board/${board.name.replace(' Board', '')}`}
                      key={board.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {board.name}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {board.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {/* View All Boards - Mobile */}
                {boardCategories.length > 4 && (
                  <Link href="/all-boards" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Boards
                  </Link>
                )}
              </div>
              
              {/* Class Categories - Mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Classes
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {classCategories.slice(0, 6).map((category) => (
                    <Link
                      href={`/${category.id}`}
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {/* View All Classes - Mobile */}
                {classCategories.length > 6 && (
                  <Link href="/all-classes" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Classes
                  </Link>
                )}
              </div>
              
              {/* Top AdSense Banner - Mobile */}
              <AdSenseBanner slot="mobile-banner-slot" format="horizontal" />
              
              {/* Subject Categories - Mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Subject Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {subjectCategories.slice(0, 6).map((category) => (
                    <Link
                      href={`/subject/${category.name}`}
                      key={category.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center mr-2">
                        <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                </div>
                {/* View All Subjects - Mobile */}
                {subjectCategories.length > 6 && (
                  <Link href="/all-subjects" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Subjects
                  </Link>
                )}
              </div>
            </div>

            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              {/* User Profile Card (only if logged in) */}
              {currentUser && userProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {userProfile.photoURL ? (
                      <img 
                        src={userProfile.photoURL}
                        alt={userProfile.fullName}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full">
                        <span className="text-green-600 dark:text-green-400 text-xl font-bold">
                          {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{userProfile.fullName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{userProfile.username}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/profile')}
                      className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-center font-medium w-full hover:from-green-500 hover:to-green-400 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg">
                    <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">TaleemSpot</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Education Portal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-center font-medium">
                    Latest Resources
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Resources</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{allResources.length}+</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm mt-2">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-600 dark:text-gray-400">Join 10,000+ Students</span>
                  </div>
                </div>
              </div>

              {/* Class Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Classes
                </h3>
                <div className="space-y-2">
                  {classCategories.slice(0, 4).map((category) => (
                    <Link
                      href={`/${category.id}`}
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {classCategories.length > 4 && (
                  <Link href="/all-classes" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Classes
                  </Link>
                )}
              </div>

              {/* Board Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Boards
                </h3>
                <div className="space-y-2">
                  {boardCategories.slice(0, 4).map((board) => (
                    <Link
                      href={`/board/${board.name.replace(' Board', '')}`}
                      key={board.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {board.name}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {board.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {boardCategories.length > 4 && (
                  <Link href="/all-boards" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Boards
                  </Link>
                )}
              </div>
            </div>

            {/* Main Content Area - Desktop */}
            <div className="hidden lg:block lg:col-span-2">
              {/* Top AdSense Banner - Lazy loaded */}
              <AdSenseBanner slot="top-banner-slot" format="horizontal" />

              {/* Featured Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-1 rounded mr-2">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  Featured Resources
                </h2>
                
                {/* Featured text content with centered button - Using memoized component */}
                {featuredContent}
              </div>

              {/* Search Results Label */}
              {searchTerm && (
                <div className="mb-4 text-gray-700 dark:text-gray-300">
                  Showing results for: <span className="font-medium text-green-600 dark:text-green-400">"{searchTerm}"</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({filteredData.length} items found)</span>
                </div>
              )}

              {/* Content Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(searchTerm ? filteredData : filteredData.slice(0, 6)).map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
                {!searchTerm && filteredData.length > 6 && (
                  <div className="col-span-full flex justify-center mt-4">
                    <button 
                      onClick={() => router.push('/all-resources')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      View All Resources
                    </button>
                  </div>
                )}
                {filteredData.length === 0 && (
                  <div className="col-span-2 text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No results found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Try using different keywords or browse categories</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom AdSense Banner - Lazy loaded */}
              <AdSenseBanner slot="bottom-banner-slot" format="horizontal" />

              {/* Pagination */}
              {searchTerm && filteredData.length > 10 && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex rounded-md shadow-sm">
                    <button className="py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                      Previous
                    </button>
                    <button className="py-2 px-4 bg-green-600 border border-green-600 text-sm font-medium text-white">
                      1
                    </button>
                    <button className="py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                      2
                    </button>
                    <button className="py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                      3
                    </button>
                    <button className="py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Right Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b dark:border-gray-700 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Subject Categories
                </h3>
                <div className="space-y-2">
                  {subjectCategories.slice(0, 6).map((category) => (
                    <Link
                      href={`/subject/${category.name}`}
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {subjectCategories.length > 6 && (
                  <Link href="/all-subjects" className="mt-3 w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 py-2 block">
                    View All Categories
                  </Link>
                )}
              </div>
              
              {/* Stats Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Our Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Notes</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{allResources.length}+</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Past Papers</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{allResources.length}+</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Students</span>
                    <span className="font-bold text-green-600 dark:text-green-400">10,000+</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Visitors</span>
                    <span className="font-bold text-green-600 dark:text-green-400">5,000+</span>
                  </div>
                </div>
              </div>

              {/* AdSense Banner - Lazy loaded */}
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
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/Punjab10thPastPapers" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> 10th Class Past Papers
                    </Link>
                  </li>
                  <li>
                    <Link href="/Punjab9thPastPapers" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> 9th Class Past Papers
                    </Link>
                  </li>
                  <li>
                    <Link href="/PunjabECATPastPapers" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> ECAT Past Papers
                    </Link>
                  </li>
                  <li>
                    <Link href="/PunjabMDCATPastPapers" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> MDCAT Past Papers
                    </Link>
                  </li>
                  <li>
                    <a href="https://play.google.com/store/apps/details?id=com.taleemspot.notes" className="text-gray-400 hover:text-white flex items-center">
                      <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Download App
                    </a>
                  </li>
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
                &copy; {new Date().getFullYear()} TaleemSpot. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="hover:text-white">
                  Terms of Service
                </Link>
                <Link href="/content-policy" className="hover:text-white">
                  Content Policy
                </Link>
                <Link href="/sitemap" className="hover:text-white">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TaleemSpot;
