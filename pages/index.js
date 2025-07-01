import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Download, BookOpen, Users } from 'lucide-react';

const TaleemSpot = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  // Static data for demonstration
  const staticData = [
    {
      id: 1,
      title: "9th Class Biology Chapter 1 - Introduction to Biology",
      description: "Complete notes covering the fundamental concepts of biology, cell structure, and basic biological processes.",
      subject: "Biology",
      class: "9th",
      url: "#",
      thumbnail: "/drawbles/biology-icon.png"
    },
    {
      id: 2,
      title: "9th Class Physics Chapter 2 - Kinematics",
      description: "Detailed notes on motion, velocity, acceleration, and equations of motion with solved examples.",
      subject: "Physics", 
      class: "9th",
      url: "#",
      thumbnail: "/drawbles/physics-icon.png"
    },
    {
      id: 3,
      title: "9th Class Chemistry Chapter 1 - Fundamentals of Chemistry",
      description: "Basic concepts of chemistry, atomic structure, and chemical bonding explained in simple language.",
      subject: "Chemistry",
      class: "9th", 
      url: "#",
      thumbnail: "/drawbles/chemistry-icon.png"
    }
  ];

  const AdSenseBanner = ({ slot = "7584383457", format = "auto" }) => {
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
          Ad Slot: "3940651912" | Format: "auto"
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
      <div className="bg-gray-800 text-white py-2 px-4 text-center text-sm">
        <span>Install Taleem Spot App from the Play Store</span>
        <button className="ml-4 bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700">
          Install Our APP
        </button>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src="/drawbles/logo.png" 
                alt="TaleemSpot Logo" 
                className="h-10 w-10"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-green-600">TaleemSpot</span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Past Paper, Notes, and other type here"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="ml-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
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
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 pb-3">
              {['Home', 'Past Papers', 'Notes', 'Test Papers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-left md:text-center transition-colors ${
                    activeTab === tab 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-700 hover:bg-green-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/drawbles/logo.png" 
                  alt="Class Logo" 
                  className="h-12 w-12 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center w-12 h-12 bg-green-100 rounded">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">9th Class Biology</h3>
                  <p className="text-sm text-gray-600">Faisalabad 2028</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-green-600 text-white px-3 py-1 rounded text-sm text-center">
                  Past Papers
                </div>
                <div className="text-center text-sm text-gray-600 py-1">
                  2018 - 2024
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Taleem Spot</span>
                </div>
              </div>
            </div>

            {/* AdSense Sidebar Ad */}
            <AdSenseBanner slot="8370851518" format="vertical" />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Top AdSense Banner */}
            <AdSenseBanner slot="8773342044" format="horizontal" />

            {/* Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {staticData.map((item, index) => (
                <div key={item.id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {item.subject} • {item.class} Class
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Insert Ad after every 2nd item */}
                  {(index + 1) % 2 === 0 && (
                    <AdSenseBanner slot={`content-ad-${index}`} format="square" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom AdSense Banner */}
            <AdSenseBanner slot="7688325238" format="horizontal" />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Latest Posts */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Latest Post</h3>
              <div className="space-y-3">
                {staticData.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.subject} • {item.class}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar AdSense */}
            <AdSenseBanner slot="7688325238" format="vertical" />
            
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-4">Our Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Notes</span>
                  <span className="font-bold text-green-600">1,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Past Papers</span>
                  <span className="font-bold text-green-600">500+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="font-bold text-green-600">10,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/drawbles/logo.png" 
                  alt="TaleemSpot Logo" 
                  className="h-8 w-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-lg font-bold">TaleemSpot</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your ultimate destination for educational resources, past papers, and notes.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Past Papers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Notes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Test Papers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Download App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contact</h4>
              <p className="text-gray-400 text-sm">
                Email: info@taleemspot.com<br/>
                Location: Faisalabad, Punjab, Pakistan
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2025 TaleemSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaleemSpot;
