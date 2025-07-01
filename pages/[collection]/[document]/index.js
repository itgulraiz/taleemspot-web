import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Download, BookOpen, Users, ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '../../../firebaseConfig';
import Head from 'next/head';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  try {
    const { collection: collectionName, document: documentId } = params;
    
    // Fetch the specific document
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        notFound: true
      };
    }
    
    const data = docSnap.data();
    
    // Get class info from collection name
    const className = collectionName
      .replace("Punjab", "")
      .replace("PastPapers", "")
      .replace("ECAT", "ECAT ")
      .replace("MDCAT", "MDCAT ");
      
    const displayName = collectionName.includes("ECAT") || collectionName.includes("MDCAT") 
      ? className.trim() 
      : `${className.trim()} Class`;

    // Process subjects data
    const papers = [];
    if (data.subjects && Array.isArray(data.subjects)) {
      data.subjects.forEach((subject, index) => {
        const driveId = extractDriveId(subject.url);
        papers.push({
          id: `${collectionName}-${documentId}-${index}`,
          title: `${displayName} ${documentId} ${subject.year} - ${subject.board} Board`,
          description: `Download ${displayName} ${documentId} past paper from ${subject.board} Board for the year ${subject.year}`,
          subject: documentId,
          class: className.trim(),
          board: subject.board,
          year: subject.year,
          type: "Past Paper",
          url: subject.url,
          downloadUrl: subject.url.replace('view?usp=drive_link', 'export?format=pdf'),
          driveId: driveId,
          collection: collectionName,
          documentId: documentId,
          itemIndex: index,
          path: `/${collectionName}/${documentId}/${index}`
        });
      });
    }

    // Get all collections for navigation
    const collections = [
      "Punjab9thPastPapers",
      "Punjab10thPastPapers",
      "Punjab11thPastPapers", 
      "Punjab12thPastPapers",
      "PunjabECATPastPapers",
      "PunjabMDCATPastPapers"
    ];

    // Get other subjects from this collection
    const collRef = collection(db, collectionName);
    const snapshot = await getDocs(collRef);
    
    const subjects = [];
    snapshot.forEach(doc => {
      if (doc.id !== documentId) {
        subjects.push({
          id: doc.id,
          name: doc.id,
          count: doc.data().subjects?.length || 0
        });
      }
    });

    return {
      props: {
        collectionName,
        documentId,
        displayName,
        subject: documentId,
        papers,
        papersByYear: groupByYear(papers),
        papersByBoard: groupByBoard(papers),
        subjects,
        collections: collections.map(coll => ({
          id: coll,
          name: coll
            .replace("Punjab", "")
            .replace("PastPapers", " Class")
            .replace("ECAT Class", "ECAT")
            .replace("MDCAT Class", "MDCAT")
            .trim()
        }))
      },
      revalidate: 86400
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      notFound: true
    };
  }
}

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

// Group papers by year
function groupByYear(papers) {
  const result = {};
  papers.forEach(paper => {
    if (!result[paper.year]) {
      result[paper.year] = [];
    }
    result[paper.year].push(paper);
  });
  
  // Sort years in descending order
  return Object.keys(result)
    .sort((a, b) => b - a)
    .reduce((obj, key) => {
      obj[key] = result[key];
      return obj;
    }, {});
}

// Group papers by board
function groupByBoard(papers) {
  const result = {};
  papers.forEach(paper => {
    if (!result[paper.board]) {
      result[paper.board] = [];
    }
    result[paper.board].push(paper);
  });
  
  // Sort boards alphabetically
  return Object.keys(result)
    .sort()
    .reduce((obj, key) => {
      obj[key] = result[key];
      return obj;
    }, {});
}

const DocumentPage = ({ 
  collectionName,
  documentId,
  displayName,
  subject,
  papers,
  papersByYear,
  papersByBoard,
  subjects,
  collections
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('By Year');
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
      path: '#',
      dropdownItems: collections.map(coll => ({
        name: coll.name,
        path: `/${coll.id}`
      }))
    },
    { 
      name: 'Subjects',
      path: '#',
      dropdownItems: subjects.slice(0, 10).map(subject => ({
        name: subject.name,
        path: `/${collectionName}/${subject.name}`
      }))
    }
  ];

  // Toggle dropdown menu
  const toggleDropdown = (e, menuName) => {
    e.stopPropagation();
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
          style={{display: 'block'}}
          data-ad-client="ca-pub-1926773803487692"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  if (router.isFallback) {
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

  return (
    <>
      <Head>
        <title>{displayName} {subject} Past Papers - TaleemSpot</title>
        <meta name="description" content={`Download ${displayName} ${subject} past papers from all Punjab boards for all years.`} />
        <meta name="keywords" content={`past papers, ${subject}, ${displayName}, Punjab board, education, Pakistan`} />
        <meta property="og:title" content={`${displayName} ${subject} Past Papers - TaleemSpot`} />
        <meta property="og:description" content={`Download ${displayName} ${subject} past papers from all Punjab boards for all years.`} />
        <meta property="og:url" content={`https://taleemspot.com/${collectionName}/${documentId}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://taleemspot.com/${collectionName}/${documentId}`} />
      </Head>
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

              {/* Back to Collection Button */}
              <Link 
                href={`/${collectionName}`}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ChevronDown className="h-4 w-4 transform -rotate-90" />
                <span>Back to {displayName}</span>
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
                    onClick={(e) => toggleDropdown(e, menu.name)}
                    className={`px-6 py-4 flex items-center space-x-1 hover:bg-green-700 transition-colors ${activeTab === menu.name ? 'bg-green-700' : ''}`}
                  >
                    <span>{menu.name}</span>
                    {menu.dropdownItems.length > 0 && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                    <div className="absolute top-full left-0 bg-white text-gray-800 shadow-lg rounded-b-lg min-w-[200px] z-50 max-h-[400px] overflow-y-auto">
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
                    onClick={(e) => toggleDropdown(e, menu.name)}
                    className={`w-full flex justify-between items-center px-4 py-3 border-b border-green-500 ${openDropdown === menu.name ? 'bg-green-700' : ''}`}
                  >
                    <span>{menu.name}</span>
                    {menu.dropdownItems.length > 0 && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === menu.name ? 'transform rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {menu.dropdownItems.length > 0 && openDropdown === menu.name && (
                    <div className="bg-green-800 max-h-[300px] overflow-y-auto">
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
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{displayName} {subject} Past Papers</h1>
              <p className="text-lg text-gray-600">Find and download past papers for all years and boards</p>
            </div>

            {/* AdSense Banner */}
            <AdSenseBanner slot="document-top-banner" format="horizontal" />

            {/* View Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('By Year')}
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'By Year' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sort By Year
              </button>
              <button
                onClick={() => setActiveTab('By Board')}
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'By Board' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sort By Board
              </button>
            </div>

            {/* Papers Listed by Year */}
            {activeTab === 'By Year' && (
              <div>
                {Object.entries(papersByYear).map(([year, yearPapers]) => (
                  <div key={year} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-green-100 text-green-700 p-1 rounded mr-2">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      {year} Past Papers
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {yearPapers.map(paper => (
                        <Link 
                          key={paper.id}
                          href={paper.path}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 p-4"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium text-gray-800 text-sm">
                              {paper.board} Board
                            </h3>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {year}
                            </span>
                            <div className="flex items-center text-blue-600 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span>View</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Papers Listed by Board */}
            {activeTab === 'By Board' && (
              <div>
                {Object.entries(papersByBoard).map(([board, boardPapers]) => (
                  <div key={board} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-blue-100 text-blue-700 p-1 rounded mr-2">
                        <Users className="h-5 w-5" />
                      </span>
                      {board} Board
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {boardPapers.map(paper => (
                        <Link 
                          key={paper.id}
                          href={paper.path}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 p-4"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium text-gray-800 text-sm">
                              {paper.year} Past Paper
                            </h3>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {paper.year}
                            </span>
                            <div className="flex items-center text-blue-600 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span>View</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AdSense Banner */}
            <div className="mt-8">
              <AdSenseBanner slot="document-bottom-banner" format="horizontal" />
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
                  <li><Link href="/" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Home
                  </Link></li>
                  <li><Link href={`/${collectionName}`} className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> {displayName} Past Papers
                  </Link></li>
                  <li><Link href={`/${collectionName}/${documentId}`} className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> {subject}
                  </Link></li>
                  <li><a href="https://play.google.com/store/apps/details?id=com.taleemspot.notes" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Download App
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
                <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
                <Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DocumentPage;
