import React, { useState, useEffect } from 'react';
import { BookOpen, Download, ExternalLink, ChevronDown, Search, Menu, X, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ResourceDetail = () => {
  const router = useRouter();
  const { classLevel, type, documentId } = router.query; // Updated to match new URL structure
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
        { name: '9th Class', path: '/9th/past-papers' },
        { name: '10th Class', path: '/10th/past-papers' },
        { name: 'Lahore Board', path: '/lahore/past-papers' },
        { name: 'Federal Board', path: '/federal/past-papers' },
      ]
    },
    { 
      name: 'Notes',
      path: '/notes',
      dropdownItems: [
        { name: 'Biology', path: '/9th/notes' },
        { name: 'Physics', path: '/9th/notes' },
        { name: 'Chemistry', path: '/9th/notes' },
        { name: 'Mathematics', path: '/10th/notes' },
      ]
    },
    { 
      name: 'Test Papers',
      path: '/test-papers',
      dropdownItems: [
        { name: '9th Class', path: '/9th/test-papers' },
        { name: '10th Class', path: '/10th/test-papers' },
        { name: 'First Term', path: '/9th/test-papers' },
        { name: 'Final Term', path: '/10th/test-papers' },
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

  // Static data for demonstration (updated to include documentId)
  const staticData = [
    {
      id: 1,
      title: "9th Class Biology Chapter 1 - Introduction to Biology",
      description: "Complete notes covering the fundamental concepts of biology, cell structure, and basic biological processes.",
      subject: "Biology",
      class: "9th",
      board: "Punjab",
      year: "2024",
      type: "notes",
      documentId: "doc1",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
    },
    {
      id: 2,
      title: "9th Class Physics Chapter 2 - Kinematics",
      description: "Detailed notes on motion, velocity, acceleration, and equations of motion with solved examples.",
      subject: "Physics", 
      class: "9th",
      board: "Punjab",
      year: "2024",
      type: "notes",
      documentId: "doc2",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
    },
    {
      id: 3,
      title: "9th Class Chemistry Chapter 1 - Fundamentals of Chemistry",
      description: "Basic concepts of chemistry, atomic structure, and chemical bonding explained in simple language.",
      subject: "Chemistry",
      class: "9th",
      board: "Punjab", 
      year: "2024",
      type: "notes",
      documentId: "doc3",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
    },
    {
      id: 4,
      title: "10th Class Mathematics Chapter 3 - Quadratic Equations",
      description: "Comprehensive guide to solving quadratic equations with step-by-step examples and practice problems.",
      subject: "Mathematics",
      class: "10th",
      board: "Federal",
      year: "2024",
      type: "notes",
      documentId: "doc4",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
    },
    {
      id: 5,
      title: "9th Class Biology Past Paper 2023 - Lahore Board",
      description: "Complete solved past paper for 9th class Biology from Lahore Board examination 2023.",
      subject: "Biology",
      class: "9th",
      board: "Lahore",
      year: "2023",
      type: "past-papers",
      documentId: "doc5",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
    },
    {
      id: 6,
      title: "10th Class Physics Test Paper - First Term",
      description: "Comprehensive test paper for 10th class Physics covering the first term syllabus with solutions.",
      subject: "Physics",
      class: "10th",
      board: "Punjab",
      year: "2024",
      type: "test-papers",
      documentId: "doc6",
      url: "https://drive.google.com/uc?export=download&id=1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      driveId: "1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e",
      thumbnail: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
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

  useEffect(() => {
    if (classLevel && type && documentId) {
      // Simulate API fetch based on new URL structure
      setTimeout(() => {
        const foundResource = staticData.find(item => 
          item.class.toLowerCase() === classLevel.toLowerCase() && 
          item.type === type && 
          item.documentId === documentId
        ) || staticData[0];
        setResource(foundResource);
        
        // Get related resources of same subject
        const related = staticData
          .filter(item => item.subject === foundResource.subject && 
            item.documentId !== documentId)
          .slice(0, 4);
        setRelatedResources(related);
        setLoading(false);
      }, 500);
    }
  }, [classLevel, type, documentId]);

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Resource not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header navMenus={navMenus} setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} setActiveTab={setActiveTab} activeTab={activeTab} setOpenDropdown={setOpenDropdown} openDropdown={openDropdown} />

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
                        {resource.board}
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

              {/* Download Button */}
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

              {/* AdSense Banner */}
              <AdSenseBanner slot="resource-bottom-banner" format="horizontal" />

              {/* Related Resources */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {relatedResources.map(item => (
                    <Link 
                      key={item.id} 
                      href={`/${item.class.toLowerCase()}/${item.type}/${item.documentId}`}
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
              <button className="mt-3 w-full text-center text-sm text-green-600 hover:text-green-800 py-2">
                View All Categories
              </button>
            </div>
            
            {/* AdSense Banner */}
            <AdSenseBanner slot="resource-sidebar-banner" format="vertical" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResourceDetail;
