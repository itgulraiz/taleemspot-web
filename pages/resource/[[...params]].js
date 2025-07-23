import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { BookOpen, Download, ExternalLink, Home as HomeIcon, ChevronDown, Search, Menu, X, Users, ArrowLeft, Clock, FileText } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ResourceCard from '../../components/ResourceCard';

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

// Helper function to format URL segments for display
function formatUrlSegment(segment) {
  if (!segment) return '';
  
  // Handle special cases
  if (segment.toLowerCase() === 'mdcat' || segment.toLowerCase() === 'ecat' || segment.toLowerCase() === 'css') {
    return segment.toUpperCase();
  }
  
  // Handle multiple words with hyphens
  if (segment.includes('-')) {
    return segment.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle camelCase segments (like classLevel, contentType)
  if (/[a-z][A-Z]/.test(segment)) {
    return segment.replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle standard cases
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

// Category definitions (to match up with your database structure)
const categoryDefinitions = {
  School: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['9th', '10th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Result', 'RollNoSlip', 'Gazette', 'PairingScheme'],
  },
  College: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['11th', '12th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Result', 'RollNoSlip', 'Gazette', 'PairingScheme'],
  },
  Cambridge: {
    classes: ['OLevel', 'ALevel'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus'],
  },
  'Entry Test': {
    classes: ['PMA', 'UniversityEntryTest', 'MDCAT', 'ECAT', 'NUMS', 'AMC'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'Result', 'RollNoSlip'],
    provincesFor: {
      MDCAT: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
      UniversityEntryTest: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    },
  },
  University: {
    classes: ['BDS', 'MBBS', 'AllamaIqbalOpenUniversity', 'VirtualUniversity', 'OtherUniversity'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'RollNoSlip'],
    provincesFor: {
      OtherUniversity: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    },
  },
  'Competition Exam': {
    classes: ['CSS', 'NTS', 'AJKPSC', 'KPSC', 'BPSC', 'SPSC', 'FPSC', 'PPSC', 'PMS'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Quiz', 'Test', 'Syllabus', 'Result'],
  },
  General: {
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Gazette', 'PairingScheme', 'UrduCalligraphy', 'EnglishCalligraphy', 'EnglishLanguage'],
  },
};

// Helper to normalize segments for comparison with database values
function normalizeSegment(segment) {
  // Convert segment to lowercase and remove hyphens, convert to camelCase for comparison
  return segment.toLowerCase().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Find category based on URL segments
function identifyResourceType(segments) {
  let province = null;
  let classLevel = null;
  let contentType = null;
  let category = null;
  let subject = null;
  let chapter = null;
  let year = null;
  let additionalInfo = [];

  if (!segments || segments.length === 0) {
    return { error: "No segments provided" };
  }

  // Check if first segment is a province
  const allProvinces = [
    ...categoryDefinitions.School.provinces,
    ...categoryDefinitions.College.provinces,
  ];
  
  const normalizedFirstSegment = normalizeSegment(segments[0]);
  
  // Check if it's a province (starting point)
  const isProvince = allProvinces.some(
    p => normalizeSegment(p) === normalizedFirstSegment
  );
  
  let currentIndex = 0;
  
  if (isProvince) {
    province = segments[0];
    currentIndex = 1;
  }
  
  // Next segment could be class level or exam type
  if (currentIndex < segments.length) {
    const normalizedSegment = normalizeSegment(segments[currentIndex]);
    
    // Check if it's a school/college class
    const schoolClasses = categoryDefinitions.School.classes;
    const collegeClasses = categoryDefinitions.College.classes;
    
    if (schoolClasses.some(c => normalizeSegment(c) === normalizedSegment)) {
      classLevel = segments[currentIndex];
      category = "School";
      currentIndex++;
    } else if (collegeClasses.some(c => normalizeSegment(c) === normalizedSegment)) {
      classLevel = segments[currentIndex];
      category = "College";
      currentIndex++;
    } 
    // Check Cambridge classes
    else if (["olevel", "alevel", "o-level", "a-level"].includes(normalizedSegment)) {
      classLevel = normalizedSegment.includes("o") ? "OLevel" : "ALevel";
      category = "Cambridge";
      currentIndex++;
    } 
    // Check Competition Exams
    else if (categoryDefinitions['Competition Exam'].classes.some(
      c => normalizeSegment(c) === normalizedSegment
    )) {
      classLevel = segments[currentIndex];
      category = "Competition Exam";
      currentIndex++;
    }
    // Check Entry Tests
    else if (categoryDefinitions['Entry Test'].classes.some(
      c => normalizeSegment(c) === normalizedSegment
    )) {
      classLevel = segments[currentIndex];
      category = "Entry Test";
      currentIndex++;
    }
    // Check University types
    else if (categoryDefinitions.University.classes.some(
      c => normalizeSegment(c) === normalizedSegment
    )) {
      classLevel = segments[currentIndex];
      category = "University";
      currentIndex++;
    }
    // If not identified yet but we have a province, assume it's School or College based on context
    else if (province) {
      // Default to General category if nothing else matches
      category = "General";
    }
    // If still not identified, try matching with General content types
    else if (categoryDefinitions.General.contentTypes.some(
      t => normalizeSegment(t) === normalizedSegment
    )) {
      contentType = segments[currentIndex];
      category = "General";
      currentIndex++;
    }
  }
  
  // Next segment is likely content type
  if (currentIndex < segments.length && !contentType) {
    const normalizedSegment = normalizeSegment(segments[currentIndex]);
    
    // Find content type based on category
    if (category && categoryDefinitions[category]) {
      const validContentTypes = categoryDefinitions[category].contentTypes;
      if (validContentTypes.some(t => normalizeSegment(t) === normalizedSegment)) {
        contentType = segments[currentIndex];
        currentIndex++;
      }
    } else {
      // If category not determined, check all content types
      let allContentTypes = [];
      Object.values(categoryDefinitions).forEach(def => {
        if (def.contentTypes) {
          allContentTypes = [...allContentTypes, ...def.contentTypes];
        }
      });
      
      if (allContentTypes.some(t => normalizeSegment(t) === normalizedSegment)) {
        contentType = segments[currentIndex];
        currentIndex++;
      }
    }
  }
  
  // All remaining segments are treated as additional details (subject, chapter, etc.)
  while (currentIndex < segments.length) {
    const segment = segments[currentIndex];
    
    // Try to identify specific parts
    if (segment.match(/^(physics|chemistry|biology|mathematics|english|urdu|islamiat)(-|$)/i)) {
      subject = segment;
    }
    else if (segment.match(/chapter-\d+/i)) {
      chapter = segment;
    }
    else if (segment.match(/\d{4}$/) || segment.match(/^(20\d{2})(-|$)/)) {
      year = segment.match(/\d{4}/)[0]; // Extract year
    }
    else {
      additionalInfo.push(segment);
    }
    
    currentIndex++;
  }
  
  // Generate a likely collection name based on the structure in Selection.txt
  let collectionName = '';
  if (province) collectionName += province;
  if (classLevel) collectionName += classLevel;
  if (contentType) collectionName += contentType;
  
  // If we still don't have a category, make a best guess
  if (!category) {
    if (classLevel && ['9th', '10th'].includes(classLevel)) {
      category = 'School';
    } else if (classLevel && ['11th', '12th'].includes(classLevel)) {
      category = 'College';
    } else if (classLevel && ['OLevel', 'ALevel'].includes(classLevel)) {
      category = 'Cambridge';
    } else if (classLevel && ['CSS', 'NTS', 'PPSC'].includes(classLevel)) {
      category = 'Competition Exam';
    } else if (classLevel && ['MDCAT', 'ECAT'].includes(classLevel)) {
      category = 'Entry Test';
    } else {
      category = 'General';
    }
  }
  
  return {
    province,
    classLevel,
    contentType,
    category,
    subject,
    chapter,
    year,
    additionalInfo,
    collectionName,
    segments,
    urlPath: '/' + segments.join('/'),
  };
}

// The main resource component
export default function ResourcePage({ resource, relatedResources, resourceType, seo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (!router.isFallback) {
      setLoading(false);
    }
  }, [router.isFallback]);

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
        { name: '9th Class', path: '/resource/punjab/9th/past-papers' },
        { name: '10th Class', path: '/resource/punjab/10th/past-papers' },
        { name: 'Lahore Board', path: '/resource/punjab/past-papers' },
        { name: 'Federal Board', path: '/resource/federal/past-papers' },
      ]
    },
    { 
      name: 'Notes',
      path: '/notes',
      dropdownItems: [
        { name: 'Biology', path: '/resource/notes/biology' },
        { name: 'Physics', path: '/resource/notes/physics' },
        { name: 'Chemistry', path: '/resource/notes/chemistry' },
        { name: 'Mathematics', path: '/resource/notes/mathematics' },
      ]
    },
    { 
      name: 'Test Papers',
      path: '/test-papers',
      dropdownItems: [
        { name: '9th Class', path: '/resource/punjab/9th/test' },
        { name: '10th Class', path: '/resource/punjab/10th/test' },
        { name: 'MDCAT', path: '/resource/mdcat/test' },
        { name: 'CSS', path: '/resource/css/test' },
      ]
    }
  ];

  // Toggle dropdown menu
  const toggleDropdown = (menuName) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Resource not found case
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

  // Breadcrumbs generator
  const renderBreadcrumbs = () => {
    if (!resourceType || !resourceType.segments) return null;
    
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      ...resourceType.segments.map((segment, index) => {
        const path = `/${resourceType.segments.slice(0, index + 1).join('/')}`;
        return {
          name: formatUrlSegment(segment),
          path: `/resource${path}`
        };
      })
    ];

    return (
      <nav className="flex py-3 px-5 bg-gray-50 rounded-lg mb-4 overflow-x-auto whitespace-nowrap">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              <Link 
                href={crumb.path}
                className={`inline-flex items-center text-sm font-medium ${
                  index === breadcrumbs.length - 1 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {index === 0 && <HomeIcon className="mr-2 h-4 w-4" />}
                {crumb.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Format display title from resource type information
  const getPageTitle = () => {
    if (resource && resource.title) return resource.title;
    
    if (!resourceType) return "Educational Resource";
    
    const parts = [];
    
    if (resourceType.subject) parts.push(formatUrlSegment(resourceType.subject));
    if (resourceType.contentType) parts.push(formatUrlSegment(resourceType.contentType));
    if (resourceType.classLevel) parts.push(formatUrlSegment(resourceType.classLevel));
    if (resourceType.province) parts.push(formatUrlSegment(resourceType.province));
    if (resourceType.chapter) parts.push(formatUrlSegment(resourceType.chapter));
    if (resourceType.year) parts.push(resourceType.year);
    
    return parts.join(' - ') || "Educational Resource";
  };

  // Generate meta description
  const getMetaDescription = () => {
    if (resource && resource.description) return resource.description;
    
    if (!resourceType) return "Find educational resources on TaleemSpot";
    
    const parts = [];
    
    if (resourceType.contentType) {
      parts.push(`Access ${formatUrlSegment(resourceType.contentType)}`);
    }
    
    if (resourceType.subject) {
      parts.push(`for ${formatUrlSegment(resourceType.subject)}`);
    }
    
    if (resourceType.classLevel) {
      parts.push(resourceType.classLevel.toLowerCase().includes('level') ? 
        `${formatUrlSegment(resourceType.classLevel)}` : 
        `Class ${formatUrlSegment(resourceType.classLevel)}`);
    }
    
    if (resourceType.province) {
      parts.push(`from ${formatUrlSegment(resourceType.province)}`);
    }
    
    if (resourceType.year) {
      parts.push(`(${resourceType.year})`);
    }
    
    return parts.join(' ') || "Find educational resources for Pakistani students on TaleemSpot";
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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{`${getPageTitle()} | TaleemSpot Educational Resources`}</title>
        <meta name="description" content={getMetaDescription()} />
        <meta name="keywords" content={`${resourceType?.subject || ''}, ${resourceType?.contentType || ''}, ${resourceType?.classLevel || ''}, ${resourceType?.province || ''}, past papers, notes, educational resources, pakistan`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://taleemspot.com/resource${resourceType?.urlPath || ''}`} />
        <meta property="og:title" content={`${getPageTitle()} | TaleemSpot`} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:image" content={resource?.thumbnail || "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://taleemspot.com/resource${resourceType?.urlPath || ''}`} />
        <meta property="twitter:title" content={`${getPageTitle()} | TaleemSpot`} />
        <meta property="twitter:description" content={getMetaDescription()} />
        <meta property="twitter:image" content={resource?.thumbnail || "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://taleemspot.com/resource${resourceType?.urlPath || ''}`} />
      </Head>

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
        {/* Breadcrumbs Navigation */}
        {renderBreadcrumbs()}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {/* Resource Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    {resource?.type === 'Lecture' ? (
                      <Video className="h-8 w-8 text-green-600" />
                    ) : resource?.type === 'Notes' ? (
                      <BookOpen className="h-8 w-8 text-green-600" />
                    ) : resource?.type === 'PastPapers' ? (
                      <FileText className="h-8 w-8 text-green-600" />
                    ) : (
                      <BookOpen className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resourceType?.subject && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {formatUrlSegment(resourceType.subject)}
                        </span>
                      )}
                      {resourceType?.classLevel && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {formatUrlSegment(resourceType.classLevel)}
                        </span>
                      )}
                      {resourceType?.province && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {formatUrlSegment(resourceType.province)}
                        </span>
                      )}
                      {resourceType?.year && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {resourceType.year}
                        </span>
                      )}
                      {resourceType?.contentType && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {formatUrlSegment(resourceType.contentType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mt-4">
                  {resource?.description || getMetaDescription()}
                </p>
              </div>

              {/* AdSense Banner */}
              <AdSenseBanner slot="resource-top-banner" format="horizontal" />

              {/* Dynamic Content Display */}
              {resource ? (
                <>
                  {/* Google Drive Embed for PDF */}
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

                  {/* YouTube Embed for Lectures */}
                  {resource.url && resource.url.includes('youtube') && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Watch Lecture</h2>
                      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm aspect-w-16 aspect-h-9">
                        <iframe 
                          src={`https://www.youtube.com/embed/${resource.url.split('v=')[1]?.split('&')[0]}`}
                          width="100%" 
                          height="500" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          className="w-full"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Download Button for PDFs */}
                  {resource.downloadUrl && (
                    <div className="mb-8">
                      <a 
                        href={resource.downloadUrl} 
                        download
                        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download {resource.type}</span>
                      </a>
                    </div>
                  )}
                </>
              ) : (
                // Category Listing View
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-green-600" />
                    {resourceType?.category ? `${formatUrlSegment(resourceType.category)} Resources` : 'Educational Resources'}
                  </h2>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <p className="text-blue-800 font-medium">
                      Browse resources for {getPageTitle()}. Select from the available options below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Display placeholder options when no resource */}
                    {resourceType?.category === 'School' && (
                      <>
                        <Link href="/resource/punjab/9th/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">9th Class Notes</h3>
                          </div>
                        </Link>
                        <Link href="/resource/punjab/10th/past-papers" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">10th Class Past Papers</h3>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    {resourceType?.category === 'Cambridge' && (
                      <>
                        <Link href="/resource/a-level/past-papers" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">A Level Past Papers</h3>
                          </div>
                        </Link>
                        <Link href="/resource/o-level/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">O Level Notes</h3>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    {resourceType?.category === 'Entry Test' && (
                      <>
                        <Link href="/resource/mdcat/past-papers" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">MDCAT Past Papers</h3>
                          </div>
                        </Link>
                        <Link href="/resource/ecat/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">ECAT Notes</h3>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    {resourceType?.category === 'Competition Exam' && (
                      <>
                        <Link href="/resource/css/past-papers" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-yellow-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">CSS Past Papers</h3>
                          </div>
                        </Link>
                        <Link href="/resource/ppsc/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-teal-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">PPSC Notes</h3>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    {!resourceType?.category && (
                      <>
                        <Link href="/resource/punjab/9th/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">School Resources</h3>
                          </div>
                        </Link>
                        <Link href="/resource/a-level/past-papers" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">Cambridge</h3>
                          </div>
                        </Link>
                        <Link href="/resource/css/notes" 
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-yellow-600" />
                            </div>
                            <h3 className="font-medium text-gray-800">Competitive Exams</h3>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* AdSense Banner */}
              <AdSenseBanner slot="resource-bottom-banner" format="horizontal" />

              {/* Related Resources */}
              {relatedResources && relatedResources.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {relatedResources.map(item => (
                      <Link 
                        key={item.id} 
                        href={`/resource/${item.path.split('/').filter(Boolean).join('/')}`}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{item.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.subject} • {item.class}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                {['Biology', 'Physics', 'Chemistry', 'Mathematics', 'English'].map((category, index) => (
                  <div key={category} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {20 - index * 2}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/subjects" className="mt-3 w-full text-center block text-sm text-green-600 hover:text-green-800 py-2">
                View All Categories
              </Link>
            </div>
            
            {/* AdSense Banner */}
            <AdSenseBanner slot="resource-sidebar-banner" format="vertical" />
            
            {/* Resource Information */}
            {resourceType && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resource Information
                </h3>
                <div className="space-y-3">
                  {resourceType.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {formatUrlSegment(resourceType.category)}
                      </span>
                    </div>
                  )}
                  
                  {resourceType.province && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Province:</span>
                      <span className="text-sm font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded">
                        {formatUrlSegment(resourceType.province)}
                      </span>
                    </div>
                  )}
                  
                  {resourceType.classLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Class/Level:</span>
                      <span className="text-sm font-medium bg-green-50 text-green-700 px-2 py-1 rounded">
                        {formatUrlSegment(resourceType.classLevel)}
                      </span>
                    </div>
                  )}
                  
                  {resourceType.contentType && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Content Type:</span>
                      <span className="text-sm font-medium bg-red-50 text-red-700 px-2 py-1 rounded">
                        {formatUrlSegment(resourceType.contentType)}
                      </span>
                    </div>
                  )}
                  
                  {resourceType.subject && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subject:</span>
                      <span className="text-sm font-medium bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        {formatUrlSegment(resourceType.subject)}
                      </span>
                    </div>
                  )}
                  
                  {resourceType.year && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Year:</span>
                      <span className="text-sm font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded">
                        {resourceType.year}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/resource/past-papers" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Past Papers
                </a></li>
                <li><a href="/resource/notes" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Notes
                </a></li>
                <li><a href="/resource/test" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> Test Papers
                </a></li>
                <li><a href="/resource/mdcat" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> MDCAT
                </a></li>
                <li><a href="/resource/css" className="text-gray-400 hover:text-white flex items-center">
                  <ChevronDown className="h-3 w-3 mr-2 transform rotate-90" /> CSS
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
              <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white">Terms of Service</a>
              <a href="/cookie-policy" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Server-side data fetching
export async function getServerSideProps(context) {
  try {
    // Extract URL segments from params
    const { params } = context;
    const segments = params?.params || [];
    
    // Analyze URL structure to determine resource type
    const resourceType = identifyResourceType(segments);
    
    // Initialize resource and related resources
    let resource = null;
    let relatedResources = [];
    
    // Check if we have a specific ID in the URL (last segment might be an ID)
    const lastSegment = segments[segments.length - 1];
    const isSpecificResource = lastSegment && lastSegment.length > 20; // Assuming Firestore IDs are long
    
    if (isSpecificResource) {
      // Fetch specific resource by ID
      try {
        const docRef = doc(db, resourceType.collectionName || 'General', lastSegment);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Create a resource object from the document
          resource = {
            id: docSnap.id,
            title: data.content?.title || "Educational Resource",
            description: data.content?.description || "Access educational resources on TaleemSpot",
            subject: data.academicInfo?.subject || "General",
            class: resourceType.classLevel || "General",
            board: data.academicInfo?.board || "N/A",
            year: data.academicInfo?.year || "N/A",
            type: resourceType.contentType || "Resource",
            url: data.content?.fileUrl || data.content?.youtubeUrl || "",
            downloadUrl: data.content?.fileUrl || "",
            driveId: extractDriveId(data.content?.fileUrl || ""),
            thumbnail: data.media?.imageUrl || "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9",
            author: data.userInfo?.authorName || "TaleemSpot",
          };
          
          // Fetch related resources
          let relatedQuery;
          if (data.academicInfo?.subject) {
            relatedQuery = query(
              collection(db, resourceType.collectionName || 'General'),
              where('academicInfo.subject', '==', data.academicInfo.subject),
              where('__name__', '!=', docSnap.id),
              limit(4)
            );
          } else {
            relatedQuery = query(
              collection(db, resourceType.collectionName || 'General'),
              limit(4)
            );
          }
          
          const relatedSnapshot = await getDocs(relatedQuery);
          relatedResources = relatedSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.content?.title || "Educational Resource",
              description: data.content?.description || "",
              subject: data.academicInfo?.subject || "General",
              class: resourceType.classLevel || "General",
              type: resourceType.contentType || "Resource",
              url: data.content?.fileUrl || data.content?.youtubeUrl || "",
              path: `/resource/${segments.slice(0, segments.length - 1).join('/')}/${doc.id}`,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    } else {
      // It's a category/listing page, fetch a sampling of resources
      try {
        // Determine which collection to query based on resourceType
        let collectionName = resourceType.collectionName;
        
        // If no collection name is determined, use a default
        if (!collectionName && resourceType.contentType) {
          collectionName = resourceType.contentType;
        } else if (!collectionName) {
          collectionName = 'General';
        }
        
        // Try to fetch from the determined collection
        const resourcesQuery = query(collection(db, collectionName), limit(8));
        const resourcesSnapshot = await getDocs(resourcesQuery);
        
        if (!resourcesSnapshot.empty) {
          relatedResources = resourcesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.content?.title || "Educational Resource",
              description: data.content?.description || "",
              subject: data.academicInfo?.subject || "General",
              class: resourceType.classLevel || "General",
              type: resourceType.contentType || "Resource",
              url: data.content?.fileUrl || data.content?.youtubeUrl || "",
              path: `/resource/${segments.join('/')}/${doc.id}`,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    }
    
    return {
      props: {
        resource,
        relatedResources,
        resourceType,
        seo: {
          title: resource?.title || getPageTitle(resourceType),
          description: resource?.description || getMetaDescription(resourceType),
        }
      }
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        resource: null,
        relatedResources: [],
        resourceType: null,
        seo: {
          title: "Educational Resources - TaleemSpot",
          description: "Access educational resources for Pakistani students"
        }
      }
    };
  }
}

// Helper function for SEO title (for server-side)
function getPageTitle(resourceType) {
  if (!resourceType) return "Educational Resource";
  
  const parts = [];
  
  if (resourceType.subject) parts.push(formatUrlSegment(resourceType.subject));
  if (resourceType.contentType) parts.push(formatUrlSegment(resourceType.contentType));
  if (resourceType.classLevel) parts.push(formatUrlSegment(resourceType.classLevel));
  if (resourceType.province) parts.push(formatUrlSegment(resourceType.province));
  if (resourceType.chapter) parts.push(formatUrlSegment(resourceType.chapter));
  if (resourceType.year) parts.push(resourceType.year);
  
  return parts.join(' - ') || "Educational Resource";
}

// Helper function for meta description (for server-side)
function getMetaDescription(resourceType) {
  if (!resourceType) return "Find educational resources on TaleemSpot";
  
  const parts = [];
  
  if (resourceType.contentType) {
    parts.push(`Access ${formatUrlSegment(resourceType.contentType)}`);
  }
  
  if (resourceType.subject) {
    parts.push(`for ${formatUrlSegment(resourceType.subject)}`);
  }
  
  if (resourceType.classLevel) {
    parts.push(resourceType.classLevel.toLowerCase().includes('level') ? 
      `${formatUrlSegment(resourceType.classLevel)}` : 
      `Class ${formatUrlSegment(resourceType.classLevel)}`);
  }
  
  if (resourceType.province) {
    parts.push(`from ${formatUrlSegment(resourceType.province)}`);
  }
  
  if (resourceType.year) {
    parts.push(`(${resourceType.year})`);
  }
  
  return parts.join(' ') || "Find educational resources for Pakistani students on TaleemSpot";
}
