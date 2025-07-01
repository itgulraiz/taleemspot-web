import React from 'react';
import Link from 'next/link';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Head from 'next/head';
import { Search, Menu, X, Download, BookOpen, Users, ChevronDown, ExternalLink, Home as HomeIcon } from 'lucide-react';

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
    
    let allLinks = [
      { url: "/", title: "Home", type: "page" },
      { url: "/sitemap", title: "Sitemap", type: "page" },
      { url: "/privacy-policy", title: "Privacy Policy", type: "page" },
      { url: "/terms-of-service", title: "Terms of Service", type: "page" },
      { url: "/cookie-policy", title: "Cookie Policy", type: "page" },
    ];
    
    // Add collection pages
    for (const collectionName of collections) {
      const displayName = collectionName
        .replace("Punjab", "")
        .replace("PastPapers", " Class")
        .replace("ECAT Class", "ECAT")
        .replace("MDCAT Class", "MDCAT")
        .trim();
      
      allLinks.push({
        url: `/${collectionName}`,
        title: `${displayName} Past Papers`,
        type: "collection"
      });
      
      // Fetch document data from the collection
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);
        
        if (!snapshot.empty) {
          const className = collectionName
            .replace("Punjab", "")
            .replace("PastPapers", "")
            .replace("ECAT", "ECAT ")
            .replace("MDCAT", "MDCAT ")
            .trim();
            
          const displayName = collectionName.includes("ECAT") || collectionName.includes("MDCAT") 
            ? className
            : `${className} Class`;
            
          snapshot.forEach(doc => {
            // Add subject page
            allLinks.push({
              url: `/${collectionName}/${doc.id}`,
              title: `${displayName} ${doc.id} Past Papers`,
              type: "subject"
            });
            
            // Add individual paper pages (limited to 5 per subject for the sitemap UI)
            const data = doc.data();
            if (data.subjects && Array.isArray(data.subjects)) {
              data.subjects.slice(0, 5).forEach((subject, index) => {
                allLinks.push({
                  url: `/${collectionName}/${doc.id}/${index}`,
                  title: `${displayName} ${doc.id} ${subject.year} - ${subject.board} Board`,
                  type: "resource"
                });
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
      }
    }
    
    return {
      props: {
        links: allLinks
      },
      revalidate: 86400
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        links: []
      },
      revalidate: 3600
    };
  }
}

const Sitemap = ({ links }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLinks, setFilteredLinks] = useState(links);
  
  // Toggle dropdown menu
  const toggleDropdown = (e, menuName) => {
    e.stopPropagation();
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Filter links by type
  const pageLinks = links.filter(link => link.type === "page");
  const collectionLinks = links.filter(link => link.type === "collection");
  const subjectLinks = links.filter(link => link.type === "subject");
  const resourceLinks = links.filter(link => link.type === "resource");

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLinks(links);
    } else {
      const filtered = links.filter(link => 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        link.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLinks(filtered);
    }
  }, [searchTerm, links]);

  // Navigation menu structure
  const navMenus = [
    { name: 'Home', path: '/', dropdownItems: [] },
    { name: 'Pages', path: '#', dropdownItems: pageLinks.map(link => ({ name: link.title, path: link.url })) },
    { name: 'Classes', path: '#', dropdownItems: collectionLinks.map(link => ({ name: link.title, path: link.url })) }
  ];

  return (
    <>
      <Head>
        <title>Sitemap - TaleemSpot</title>
        <meta name="description" content="Complete sitemap of TaleemSpot website with all available resources and pages." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://taleemspot.com/sitemap" />
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
                    placeholder="Search links..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
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
                      placeholder="Search links..."
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
                    onClick={(e)
