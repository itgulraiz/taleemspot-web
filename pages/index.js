import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, BookOpen, Users, Star, TrendingUp, Calendar, Award, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import SidebarSection from '../components/SidebarSection';
import ViewAllButton from '../components/ViewAllButton';

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

// Sample authors data
const authors = [
  "Muhammad Ali Khan", "Fatima Ahmed", "Ahmed Hassan", "Ayesha Malik", "Hassan Raza",
  "Zainab Sheikh", "Omar Farooq", "Rabia Nawaz", "Bilal Ahmad", "Sana Tariq"
];

// Function to get random author
const getRandomAuthor = () => {
  return authors[Math.floor(Math.random() * authors.length)];
};

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

    let allData = [];
    let classCategories = [];
    
    for (const collectionName of collections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);
        
        if (!snapshot.empty) {
          const className = collectionName
            .replace("Punjab", "")
            .replace("PastPapers", "")
            .replace("ECAT", "ECAT ")
            .replace("MDCAT", "MDCAT ");
          
          // Only add regular classes, not ECAT/MDCAT
          if (!collectionName.includes("ECAT") && !collectionName.includes("MDCAT")) {
            const displayName = `${className.trim()} Class`;
            classCategories.push({
              id: collectionName,
              name: displayName,
              count: snapshot.size
            });
          }
          
          snapshot.forEach(doc => {
            const data = doc.data();
            
            if (data.subjects && Array.isArray(data.subjects)) {
              data.subjects.forEach((subject, index) => {
                if (subject.url && subject.board && subject.year) {
                  const driveId = extractDriveId(subject.url);
                  const displayName = collectionName.includes("ECAT") || collectionName.includes("MDCAT") 
                    ? className.trim() 
                    : `${className.trim()} Class`;
                    
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
                    path: `/${collectionName}/${doc.id}/${index}`,
                    author: getRandomAuthor()
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

    const boardsSet = new Set();
    allData.forEach(item => boardsSet.add(item.board));
    
    const boardCategories = Array.from(boardsSet).map((board, index) => ({
      id: index + 1,
      name: `${board} Board`,
      count: allData.filter(item => item.board === board).length
    }));

    const subjectsSet = new Set();
    allData.forEach(item => subjectsSet.add(item.subject));
    
    const subjectCategories = Array.from(subjectsSet).map((subject, index) => ({
      id: index + 1,
      name: subject,
      count: allData.filter(item => item.subject === subject).length,
      icon: "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
    }));

    // Get ECAT and MDCAT data for entry test section
    const ecatData = allData.filter(item => item.collection === "PunjabECATPastPapers");
    const mdcatData = allData.filter(item => item.collection === "PunjabMDCATPastPapers");

    const featuredData = allData
      .sort((a, b) => b.year - a.year)
      .slice(0, 8); // Exactly 8 cards

    return {
      props: {
        resources: featuredData,
        allResources: allData,
        classCategories,
        boardCategories,
        subjectCategories,
        ecatCount: ecatData.length,
        mdcatCount: mdcatData.length
      },
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
        subjectCategories: [],
        ecatCount: 0,
        mdcatCount: 0
      },
      revalidate: 3600
    };
  }
}

// Enhanced News Card Component
const NewsCard = memo(({ news, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      isActive 
        ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg' 
        : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md'
    }`}
  >
    <div className="flex items-start space-x-3">
      <div className={`w-3 h-3 rounded-full mt-2 animate-pulse ${isActive ? 'bg-red-500' : 'bg-gray-300'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-semibold leading-tight ${isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}>
          {news.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {news.date}
        </p>
      </div>
    </div>
  </div>
));

NewsCard.displayName = 'NewsCard';

// Main Component
const TaleemSpot = ({ resources, allResources, classCategories, boardCategories, subjectCategories, ecatCount, mdcatCount }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [filteredData, setFilteredData] = useState(resources || []);
  const [activeNews, setActiveNews] = useState(0);

  // Sample news data with actual counts
  const latestNews = useMemo(() => [
    {
      id: 1,
      title: "9th Class Biology 2024 - Lahore Board",
      date: "Just Now",
      content: "Latest 9th Class Biology past paper from Lahore Board for 2024 examination is now available for download.",
      type: "trending"
    },
    {
      id: 2,
      title: "10th Class Physics 2024 - Faisalabad Board", 
      date: "2 hours ago",
      content: "Get the complete Physics past paper for 10th class students from Faisalabad Board.",
      type: "new"
    },
    {
      id: 3,
      title: "MDCAT 2024 Preparation Guide",
      date: "5 hours ago", 
      content: "Complete preparation guide and past papers for MDCAT 2024 entrance test.",
      type: "popular"
    }
  ], []);

  // Search functionality
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
            item.subject.toLowerCase().includes(term) ||
            item.class.toLowerCase().includes(term) ||
            item.board.toLowerCase().includes(term) ||
            item.year.toString().includes(term) ||
            item.author.toLowerCase().includes(term)
          );
        });
        
        setFilteredData(filtered);
        
        if (searchTerm.length > 2) {
          const suggestions = [];
          
          subjectCategories.forEach(subject => {
            if (subject.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: subject.name, type: 'subject' });
            }
          });
          
          boardCategories.forEach(board => {
            if (board.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: board.name, type: 'board' });
            }
          });
          
          // Add author suggestions
          const authorSuggestions = [...new Set(allResources.map(item => item.author))]
            .filter(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3);
          
          authorSuggestions.forEach(author => {
            suggestions.push({ text: author, type: 'author' });
          });
          
          setSearchSuggestions(suggestions.slice(0, 8));
        } else {
          setSearchSuggestions([]);
        }
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, resources, allResources, subjectCategories, boardCategories]);

  // Auto-rotate news
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews(prev => (prev + 1) % latestNews.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [latestNews.length]);

  return (
    <>
      <Head>
        <title>TaleemSpot - Pakistan's #1 Educational Resource Platform | Past Papers, Notes & Study Materials</title>
        <meta name="description" content="Access comprehensive educational resources including past papers, notes, guess papers, and study materials for 9th-12th classes, ECAT & MDCAT from all Punjab boards. Download free educational content." />
        <meta name="keywords" content="past papers, Punjab board, education Pakistan, 9th class, 10th class, 11th class, 12th class, ECAT, MDCAT, study notes, guess papers, pairing scheme" />
        <meta property="og:title" content="TaleemSpot - Pakistan's Premier Educational Platform" />
        <meta property="og:description" content="Download past papers, notes, and study materials for all Punjab board classes. Free educational resources for Pakistani students." />
        <meta property="og:url" content="https://taleemspot.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TaleemSpot - Educational Resources" />
        <meta name="twitter:description" content="Access past papers, notes, and study materials for Pakistani students" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://taleemspot.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "TaleemSpot",
              "description": "Pakistan's premier educational resource platform",
              "url": "https://taleemspot.com",
              "logo": "https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9",
              "sameAs": [
                "https://www.facebook.com/taleemspot",
                "https://www.twitter.com/taleemspot"
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchSuggestions={searchSuggestions}
          classCategories={classCategories}
          subjectCategories={subjectCategories}
          boardCategories={boardCategories}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar - 3 Widgets */}
            <div className="lg:col-span-1">
              {/* Latest News Section */}
              <SidebarSection
                title="Latest News"
                subtitle={`Stay Up to Date with TaleemSpot - ${new Date().getDate()}`}
                icon={TrendingUp}
                colorScheme="red"
                showSerialNumbers={true}
                items={latestNews.map((news, index) => ({
                  name: news.title,
                  badge: index === 0 ? "Trending News" : null,
                  href: '#'
                }))}
                viewAllLink="/all-news"
                badgeColors={{
                  "Trending News": "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                }}
              />

              {/* Classes Section */}
              <SidebarSection
                title="Classes"
                subtitle="Get Latest Educational Materials"
                icon={BookOpen}
                colorScheme="green"
                showSerialNumbers={true}
                items={classCategories.map(cat => ({
                  name: cat.name,
                  count: cat.count,
                  href: `/${cat.id}`
                }))}
                viewAllLink="/all-classes"
              />

              {/* Entry Test Section */}
              <SidebarSection
                title="Entry Test"
                subtitle="Test Entry and Confirm your success"
                icon={Award}
                colorScheme="purple"
                showSerialNumbers={true}
                items={[
                  { name: "MDCAT", count: mdcatCount, href: "/PunjabMDCATPastPapers" },
                  { name: "ECAT", count: ecatCount, href: "/PunjabECATPastPapers" },
                  { name: "University Entry Test", count: "50+", href: "/university-entry-test" }
                ]}
                viewAllLink="/entry-tests"
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Search Results Header */}
              {searchTerm && (
                <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 text-lg">
                        Search results for: <span className="font-bold text-blue-600 dark:text-blue-400">"{searchTerm}"</span>
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Found {filteredData.length} results
                      </p>
                    </div>
                  </div>
                </div>
              )}

                            {/* Content Grid - Exactly 8 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Show exactly 8 cards when not searching */}
                {(searchTerm ? filteredData.slice(0, 12) : filteredData.slice(0, 8)).map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
                
                {filteredData.length === 0 && searchTerm && (
                  <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
                      <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-3">No results found</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">Try using different keywords or browse categories</p>
                    </div>
                  </div>
                )}
                
                {/* Simple View All Resources Button - only show when not searching and we have more data */}
                {!searchTerm && allResources.length > 8 && (
                  <ViewAllButton href="/all-resources" />
                )}
              </div>
            </div>

            {/* Right Sidebar - 3 Widgets */}
            <div className="lg:col-span-1">
              {/* Competitive Exams Section */}
              <SidebarSection
                title="Competitive Exams"
                subtitle="Test Entry and Confirm your success"
                icon={Star}
                colorScheme="yellow"
                showSerialNumbers={true}
                items={[
                  { name: "PPSC", count: "25+", href: "/ppsc" },
                  { name: "FPSC", count: "30+", href: "/fpsc" },
                  { name: "CSS", count: "15+", href: "/css" },
                  { name: "NTS", count: "40+", href: "/nts" }
                ]}
                viewAllLink="/competitive-exams"
              />

              {/* International Section */}
              <SidebarSection
                title="International"
                subtitle="Test Entry and Confirm your success"
                icon={Users}
                colorScheme="blue"
                showSerialNumbers={true}
                items={[
                  { name: "NCRT", count: "25+", href: "/ncrt" },
                  { name: "O Level", count: "15+", href: "/o-level" },
                  { name: "A Level", count: "20+", href: "/a-level" }
                ]}
                viewAllLink="/international"
              />

              {/* General Section */}
              <SidebarSection
                title="General"
                subtitle="Test Entry and Confirm your success"
                icon={BookOpen}
                colorScheme="gray"
                showSerialNumbers={true}
                items={[
                  { name: "Admissions", count: "100+", href: "/admissions" },
                  { name: "Scholarships", count: "50+", href: "/scholarships" },
                  { name: "Tutors Services", count: "200+", href: "/tutors" },
                  { name: "Best College for me", count: "150+", href: "/colleges" }
                ]}
                viewAllLink="/general"
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TaleemSpot;
