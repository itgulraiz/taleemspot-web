import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import Head from 'next/head';
import { useRouter } from 'next/router';

export async function getStaticPaths() {
  try {
    const collections = [
      "Punjab9thPastPapers",
      "Punjab10thPastPapers",
      "Punjab11thPastPapers",
      "Punjab12thPastPapers",
      "PunjabECATPastPapers",
      "PunjabMDCATPastPapers"
    ];

    // Get all resources first to identify all available boards
    const boardSet = new Set();
    
    // Process each collection to extract unique boards
    for (const collectionName of collections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);
        
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.subjects && Array.isArray(data.subjects)) {
              data.subjects.forEach(subject => {
                if (subject.board) {
                  boardSet.add(subject.board);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
      }
    }

    // Create paths for each unique board
    const paths = Array.from(boardSet).map(board => ({
      params: { boardName: board }
    }));

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { boardName } = params;
    const collections = [
      "Punjab9thPastPapers",
      "Punjab10thPastPapers",
      "Punjab11thPastPapers",
      "Punjab12thPastPapers",
      "PunjabECATPastPapers",
      "PunjabMDCATPastPapers"
    ];

    // Get all resources for this board
    let boardResources = [];
    
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
            
          // Process each document in the collection
          snapshot.forEach(doc => {
            const data = doc.data();
            
            // If this document has subjects array, process it
            if (data.subjects && Array.isArray(data.subjects)) {
              data.subjects.forEach((subject, index) => {
                if (subject.url && subject.board && subject.year && subject.board === boardName) {
                  // Create a record for each matching subject
                  const driveId = extractDriveId(subject.url);
                  boardResources.push({
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

    // Sort resources by year (newest first)
    boardResources.sort((a, b) => b.year - a.year);

    // If no resources found, return 404
    if (boardResources.length === 0) {
      return {
        notFound: true
      };
    }

    // Extract subject counts for this board
    const subjectCounts = {};
    boardResources.forEach(resource => {
      if (!subjectCounts[resource.subject]) {
        subjectCounts[resource.subject] = 1;
      } else {
        subjectCounts[resource.subject] += 1;
      }
    });

    // Extract classes for this board
    const boardClasses = [...new Set(boardResources.map(resource => resource.class))];

    // Extract years for this board
    const boardYears = [...new Set(boardResources.map(resource => resource.year))].sort((a, b) => b - a);

    return {
      props: {
        boardName,
        resources: boardResources,
        subjectCounts,
        boardClasses,
        boardYears,
        totalResources: boardResources.length
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

const BoardPage = ({ boardName, resources, subjectCounts, boardClasses, boardYears, totalResources }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState(resources);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const resourcesPerPage = 20;

  // Handle filters and search
  useEffect(() => {
    let filtered = resources;
    
    // Apply filters
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(item => item.subject === selectedSubject);
    }
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(item => item.class === selectedClass);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(item => item.year === parseInt(selectedYear));
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      filtered = filtered.filter(item => {
        return searchTerms.every(term => 
          item.title.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term) ||
          item.subject.toLowerCase().includes(term)
        );
      });
    }
    
    setFilteredResources(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, selectedClass, selectedYear, resources]);

  // Calculate pagination
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = filteredResources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ResourceCard Component
  const ResourceCard = ({ resource }) => {
    return (
      <Link 
        href={resource.path}
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
                {resource.subject} • {resource.class} {resource.class.includes('ECAT') || resource.class.includes('MDCAT') ? '' : 'Class'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {resource.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              {resource.year}
            </span>
            <div className="flex items-center text-blue-600 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>Open</span>
            </div>
          </div>
        </div>
      </Link>
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
        <title>{boardName} Board Past Papers - TaleemSpot</title>
        <meta name="description" content={`Download ${boardName} Board past papers for all subjects and classes. Access ${totalResources}+ resources for 9th, 10th, 11th, 12th classes and entrance tests.`} />
        <meta name="keywords" content={`${boardName} Board, past papers, education, Pakistan, 9th class, 10th class, Punjab board`} />
        <link rel="canonical" href={`https://taleemspot.com/board/${boardName}`} />
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
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center py-3">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
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
              </Link>

              {/* Search Bar - Desktop */}
              <div className="flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${boardName} Board past papers...`}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Back to Home Button */}
              <Link 
                href="/"
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>Back to Home</span>
              </Link>
            </div>
            
            {/* Mobile Header */}
            <div className="flex md:hidden justify-between items-center py-3">
              {/* Search Button */}
              <button 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Search className="h-6 w-6" />
              </button>
              
              {/* Logo */}
              <Link href="/" className="text-center">
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  TaleemSpot
                </span>
              </Link>
              
              {/* Menu Button */}
              <button 
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
              <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex flex-col">
                <div className="bg-white p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Search</h3>
                    <button onClick={() => setMobileSearchOpen(false)}>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${boardName} Board papers...`}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{boardName} Board Past Papers</h1>
              <p className="text-lg text-gray-600">Download {totalResources}+ past papers for all subjects and classes</p>
            </div>

            {/* AdSense Banner */}
            <AdSenseBanner slot="board-top-banner" format="horizontal" />

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 my-6">
              {/* Subject Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Subjects</option>
                  {Object.keys(subjectCounts).sort().map(subject => (
                    <option key={subject} value={subject}>
                      {subject} ({subjectCounts[subject]})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Class Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Classes</option>
                  {boardClasses.sort().map(cls => (
                    <option key={cls} value={cls}>
                      {cls} {!cls.includes('ECAT') && !cls.includes('MDCAT') ? 'Class' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Year Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Years</option>
                  {boardYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Results Label */}
            <div className="mb-4 text-gray-700">
              {(searchTerm || selectedSubject !== 'all' || selectedClass !== 'all' || selectedYear !== 'all') && (
                <div>
                  <span>Filtered results: </span>
                  {selectedSubject !== 'all' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">Subject: {selectedSubject}</span>}
                  {selectedClass !== 'all' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">Class: {selectedClass}</span>}
                  {selectedYear !== 'all' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">Year: {selectedYear}</span>}
                  {searchTerm && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">Search: "{searchTerm}"</span>}
                  <span className="ml-2 text-sm text-gray-500">({filteredResources.length} resources found)</span>
                </div>
              )}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 my-6">
              {currentResources.length > 0 ? (
                currentResources.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">No resources found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or search term</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`py-2 px-4 border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'} rounded-l-md text-sm font-medium`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Calculate page numbers to show based on current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button 
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`py-2 px-4 border ${currentPage === pageNum ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                                        className={`py-2 px-4 border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'} rounded-r-md text-sm font-medium`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* AdSense Banner */}
            <div className="mt-8">
              <AdSenseBanner slot="board-bottom-banner" format="horizontal" />
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
                  <li><Link href="/Punjab10thPastPapers" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> 10th Class Past Papers
                  </Link></li>
                  <li><Link href="/Punjab9thPastPapers" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> 9th Class Past Papers
                  </Link></li>
                  <li><Link href="/PunjabECATPastPapers" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> ECAT Past Papers
                  </Link></li>
                  <li><Link href="/PunjabMDCATPastPapers" className="text-gray-400 hover:text-white flex items-center">
                    <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> MDCAT Past Papers
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
                <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
                <Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
                <Link href="/sitemap" className="hover:text-white">Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BoardPage;
