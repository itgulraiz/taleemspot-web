import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Head from 'next/head';

export async function getStaticProps() {
  try {
    const collections = [
      "Punjab9thPastPapers",
      "Punjab10thPastPapers",
      "Punjab11thPastPapers",
      "Punjab12thPastPapers",
      "PunjabECATPastPapers",
      "PunjabMDCATPastPapers"
    ];

    let allResources = [];
    
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
                if (subject.url && subject.board && subject.year) {
                  // Create a record for each subject
                  const driveId = extractDriveId(subject.url);
                  allResources.push({
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
    allResources.sort((a, b) => b.year - a.year);

    return {
      props: {
        resources: allResources
      },
      revalidate: 86400
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        resources: []
      },
      revalidate: 3600
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

const AllResources = ({ resources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState(resources);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 20;

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResources(resources);
    } else {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      const filtered = resources.filter(item => {
        // Check if ALL search terms match any of the fields
        return searchTerms.every(term => 
          item.title.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term) ||
          item.subject.toLowerCase().includes(term) ||
          item.class.toLowerCase().includes(term) ||
          item.board.toLowerCase().includes(term) ||
          item.year.toString().includes(term)
        );
      });
      setFilteredResources(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, resources]);

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

  return (
    <>
      <Head>
        <title>All Resources - TaleemSpot</title>
        <meta name="description" content="Browse all educational resources including past papers for all classes and subjects." />
        <meta name="keywords" content="past papers, Punjab board, education, Pakistan, 9th class, 10th class, 11th class, 12th class, ECAT, MDCAT" />
        <link rel="canonical" href="https://taleemspot.com/all-resources" />
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
                    placeholder="Search Past Papers, Subjects, Boards..."
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
                      placeholder="Search Past Papers, Subjects, Boards..."
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">All Resources</h1>
              <p className="text-lg text-gray-600">Browse our complete collection of educational resources</p>
            </div>

            {/* AdSense Banner */}
            <AdSenseBanner slot="all-resources-top-banner" format="horizontal" />

            {/* Search Results Label */}
            {searchTerm && (
              <div className="mb-4 text-gray-700">
                Showing results for: <span className="font-medium text-green-600">"{searchTerm}"</span>
                <span className="ml-2 text-sm text-gray-500">({filteredResources.length} items found)</span>
              </div>
            )}

            {/* Resources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
              {currentResources.length > 0 ? (
                currentResources.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">No resources found</h3>
                    <p className="text-gray-500 mt-2">Try using different keywords or browse categories</p>
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
              <AdSenseBanner slot="all-resources-bottom-banner" format="horizontal" />
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
                  <a href="https://facebook.com/taleemspot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="https://twitter.com/taleemspot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="https://instagram.com/taleemspot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
                  </li>
                  <li>
                    <Link href="/all-classes" className="text-gray-400 hover:text-white">All Classes</Link>
                  </li>
                  <li>
                    <Link href="/all-subjects" className="text-gray-400 hover:text-white">All Subjects</Link>
                  </li>
                  <li>
                    <Link href="/all-boards" className="text-gray-400 hover:text-white">All Boards</Link>
                  </li>
                  <li>
                    <Link href="/all-resources" className="text-gray-400 hover:text-white">All Resources</Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Popular Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/Punjab9thPastPapers" className="text-gray-400 hover:text-white">9th Class Past Papers</Link>
                  </li>
                  <li>
                    <Link href="/Punjab10thPastPapers" className="text-gray-400 hover:text-white">10th Class Past Papers</Link>
                  </li>
                  <li>
                    <Link href="/Punjab11thPastPapers" className="text-gray-400 hover:text-white">11th Class Past Papers</Link>
                  </li>
                  <li>
                    <Link href="/Punjab12thPastPapers" className="text-gray-400 hover:text-white">12th Class Past Papers</Link>
                  </li>
                  <li>
                    <Link href="/PunjabECATPastPapers" className="text-gray-400 hover:text-white">ECAT Past Papers</Link>
                  </li>
                  <li>
                    <Link href="/PunjabMDCATPastPapers" className="text-gray-400 hover:text-white">MDCAT Past Papers</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-6">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} TaleemSpot. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white">Terms of Service</Link>
                <Link href="/contact-us" className="text-sm text-gray-400 hover:text-white">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden">
            <div className="bg-white h-full w-64 p-4 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  TaleemSpot
                </span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="space-y-4">
                <Link href="/" className="block py-2 px-4 hover:bg-gray-100 rounded-md">Home</Link>
                <Link href="/all-classes" className="block py-2 px-4 hover:bg-gray-100 rounded-md">All Classes</Link>
                <Link href="/all-subjects" className="block py-2 px-4 hover:bg-gray-100 rounded-md">All Subjects</Link>
                <Link href="/all-boards" className="block py-2 px-4 hover:bg-gray-100 rounded-md">All Boards</Link>
                <Link href="/all-resources" className="block py-2 px-4 bg-gray-100 rounded-md font-medium">All Resources</Link>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Resources</h3>
                <nav className="space-y-2">
                  <Link href="/Punjab9thPastPapers" className="block py-1 px-4 text-sm hover:bg-gray-100 rounded">9th Class Past Papers</Link>
                  <Link href="/Punjab10thPastPapers" className="block py-1 px-4 text-sm hover:bg-gray-100 rounded">10th Class Past Papers</Link>
                  <Link href="/Punjab11thPastPapers" className="block py-1 px-4 text-sm hover:bg-gray-100 rounded">11th Class Past Papers</Link>
                  <Link href="/Punjab12thPastPapers" className="block py-1 px-4 text-sm hover:bg-gray-100 rounded">12th Class Past Papers</Link>
                </nav>
              </div>
              
              <div className="mt-auto pt-6 fixed bottom-4 w-56">
                <a 
                  href="https://play.google.com/store/apps/details?id=com.taleemspot.notes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg w-full flex items-center justify-center space-x-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15C4.34 1.91 4.91 2 5.32 2.3L16.99 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.31 21.7C4.91 22 4.33 22.08 3.84 21.84C3.34 21.6 3 21.08 3 20.5V20.63L13 12L5.31 21.7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 12L3 3.63V3.5C3 2.92 3.34 2.4 3.84 2.16C4.34 1.92 4.91 2.01 5.32 2.3L16.99 11L13 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 12L17 11L5.32 21.7C4.92 22 4.34 22.09 3.84 21.84C3.34 21.6 3 21.08 3 20.5V20.37L13 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Install App</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AllResources;
