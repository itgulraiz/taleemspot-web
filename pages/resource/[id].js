import React, { useState, useEffect } from 'react';
import { BookOpen, Download, ExternalLink, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ResourceDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (id) {
      // Simulate API fetch
      setTimeout(() => {
        const parsedId = parseInt(id);
        const foundResource = staticData.find(item => item.id === parsedId) || staticData[0];
        setResource(foundResource);
        
        // Get related resources of same subject
        const related = staticData
          .filter(item => item.subject === foundResource.subject && item.id !== parsedId)
          .slice(0, 4);
        setRelatedResources(related);
        setLoading(false);
      }, 500);
    }
  }, [id]);

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
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-green-600">TaleemSpot</span>
            </Link>
            <Link 
              href="/"
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Resource Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{resource.title}</h1>
                <p className="text-gray-600">
                  {resource.subject} • {resource.class} Class
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700 mt-4">{resource.description}</p>
          </div>

          {/* Google Drive Embed */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Preview Document</h2>
            <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
              <iframe 
                src="https://drive.google.com/file/d/1p6G83N3CbAiwR8T_A4Q2nwDSdfa_yR9e/preview" 
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
              href={resource.url || "#"} 
              download
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF</span>
            </a>
          </div>

          {/* AdSense Banner */}
          <AdSenseBanner slot="resource-banner" format="horizontal" />

          {/* Related Resources */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedResources.map(item => (
                <Link 
                  key={item.id} 
                  href={`/resource/${item.id}`}
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-lg font-bold">TaleemSpot</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; 2025 TaleemSpot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResourceDetail;
