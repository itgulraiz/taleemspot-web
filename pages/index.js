'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, BookOpen, Users, Star, TrendingUp, Calendar, Award, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
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

// Enhanced helper function to generate SEO-friendly resource URL paths
function generateResourcePath(item) {
  const segments = [];
  
  // Build URL segments in proper order based on resource metadata
  // Province comes first (if available)
  if (item.province && item.province !== 'General') {
    segments.push(item.province.toLowerCase().replace(/\s+/g, ''));
  }
  
  // Class/Level comes second
  if (item.class && item.class !== 'General') {
    const classSegment = item.class.toLowerCase()
      .replace(/\s+/g, '')
      .replace('class', '')
      .replace('level', '-level');
    segments.push(classSegment);
  }
  
  // Content type comes third
  if (item.type) {
    const typeSegment = item.type.toLowerCase()
      .replace(/\s+/g, '')
      .replace('papers', 'papers')
      .replace('textbooks', 'textbooks');
    segments.push(typeSegment);
  }
  
  // Subject comes fourth (if available and not general)
  if (item.subject && item.subject !== 'General') {
    segments.push(item.subject.toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Chapter info (if available)
  if (item.chapter) {
    segments.push(item.chapter.toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Year (if available and not N/A)
  if (item.year && item.year !== 'N/A') {
    segments.push(item.year);
  }
  
  // Document ID at the end for specific resource identification
  if (item.documentId) {
    segments.push(item.documentId);
  }
  
  return segments.join('/');
}

// Sample authors data
const authors = [
  'Muhammad Ali Khan', 'Fatima Ahmed', 'Ahmed Hassan', 'Ayesha Malik', 'Hassan Raza',
  'Zainab Sheikh', 'Omar Farooq', 'Rabia Nawaz', 'Bilal Ahmad', 'Sana Tariq',
];

// Function to get random author
const getRandomAuthor = () => {
  return authors[Math.floor(Math.random() * authors.length)];
};

// All collections from Selection.txt
const allCollections = [
  'AJKPSCNotes', 'AJKPSCPastPapers', 'AJKPSCQuiz', 'AJKPSCSyllabus', 'AJKPSCTest', 'AJKPSCTextBooks',
  'ALevelLectures', 'ALevelNotes', 'ALevelPastPapers', 'ALevelQuiz', 'ALevelSyllabus', 'ALevelTest', 'ALevelTextBooks',
  'CSSNotes', 'CSSPastPapers', 'CSSQuiz', 'CSSSyllabus', 'CSSTest', 'CSSTextBooks',
  'Punjab10thNotes', 'Punjab10thPastPapers', 'Punjab11thNotes', 'Punjab12thNotes',
  'Sindh10thNotes', 'Sindh11thNotes', 'Federal10thNotes', 'Federal11thNotes',
  'PunjabMDCATNotes', 'SindhMDCATNotes', 'ECATNotes', 'NTSNotes', 'PPSCNotes'
];

// Category definitions
const categoryDefinitions = {
  School: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['9th', '10th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers'],
  },
  College: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['11th', '12th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers'],
  },
  Cambridge: {
    classes: ['OLevel', 'ALevel'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus'],
  },
  'Entry Test': {
    classes: ['MDCAT', 'ECAT', 'NUMS', 'AMC'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus'],
  },
  'Competition Exam': {
    classes: ['CSS', 'NTS', 'PPSC', 'FPSC', 'SPSC'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Quiz', 'Test', 'Syllabus'],
  },
};

// Helper function to parse collection name and extract metadata
const parseCollectionName = (collectionName) => {
  let category = 'General';
  let province = null;
  let classLevel = null;
  let contentType = null;

  // Competition Exam collections
  const compExams = categoryDefinitions['Competition Exam'].classes;
  if (compExams.some((exam) => collectionName.startsWith(exam))) {
    const exam = compExams.find((e) => collectionName.startsWith(e));
    contentType = collectionName.replace(exam, '');
    return { category: 'Competition Exam', province: null, classLevel: exam, contentType };
  }

  // Cambridge collections
  const cambridgeClasses = categoryDefinitions.Cambridge.classes;
  if (cambridgeClasses.some((cls) => collectionName.startsWith(cls))) {
    const cls = cambridgeClasses.find((c) => collectionName.startsWith(c));
    contentType = collectionName.replace(cls, '');
    return { category: 'Cambridge', province: null, classLevel: cls, contentType };
  }

  // Entry Test collections
  const entryTestClasses = categoryDefinitions['Entry Test'].classes;
  if (entryTestClasses.some((cls) => collectionName.includes(cls))) {
    const cls = entryTestClasses.find((c) => collectionName.includes(c));
    contentType = collectionName.replace(cls, '').replace(/Punjab|Sindh|Federal/g, '');
    province = collectionName.includes('Punjab') ? 'Punjab' : 
               collectionName.includes('Sindh') ? 'Sindh' : 
               collectionName.includes('Federal') ? 'Federal' : null;
    return { category: 'Entry Test', province, classLevel: cls, contentType };
  }

  // School and College collections
  const provinces = categoryDefinitions.School.provinces;
  const schoolClasses = categoryDefinitions.School.classes;
  const collegeClasses = categoryDefinitions.College.classes;

  for (const province of provinces) {
    if (collectionName.startsWith(province)) {
      const remaining = collectionName.replace(province, '');
      const cls = [...schoolClasses, ...collegeClasses].find((c) => remaining.includes(c));
      if (cls) {
        contentType = remaining.replace(cls, '');
        category = schoolClasses.includes(cls) ? 'School' : 'College';
        return { category, province, classLevel: cls, contentType };
      }
    }
  }

  return { category: 'General', province: null, classLevel: null, contentType: collectionName };
};

export async function getStaticProps() {
  try {
    let allData = [];
    let classCategories = [];
    let boardCategories = [];
    let subjectCategories = [];
    
    // Initialize with sample data to prevent errors
    const sampleData = [
      {
        id: 'sample-1',
        title: '9th Class Physics Notes - Chapter 1',
        description: 'Comprehensive physics notes for 9th class students',
        subject: 'Physics',
        class: '9th',
        board: 'Punjab Board',
        year: '2024',
        type: 'Notes',
        url: '#',
        downloadUrl: '#',
        driveId: null,
        collection: 'Punjab9thNotes',
        documentId: 'sample-1',
        itemIndex: 0,
        author: 'Muhammad Ali Khan',
        category: 'School',
        province: 'Punjab',
        authorImage: null,
        chapter: null,
      },
      {
        id: 'sample-2',
        title: 'CSS General Knowledge Notes 2024',
        description: 'Complete CSS preparation notes for General Knowledge',
        subject: 'General Knowledge',
        class: 'CSS',
        board: 'FPSC',
        year: '2024',
        type: 'Notes',
        url: '#',
        downloadUrl: '#',
        driveId: null,
        collection: 'CSSNotes',
        documentId: 'sample-2',
        itemIndex: 0,
        author: 'Fatima Ahmed',
        category: 'Competition Exam',
        province: null,
        authorImage: null,
        chapter: null,
      }
    ];

    allData = sampleData;

    // Generate categories
    classCategories = [
      { id: 'school-9th', name: '9th Class', count: 150, category: 'School' },
      { id: 'school-10th', name: '10th Class', count: 200, category: 'School' },
      { id: 'college-11th', name: '11th Class', count: 180, category: 'College' },
      { id: 'college-12th', name: '12th Class', count: 220, category: 'College' },
      { id: 'cambridge-olevel', name: 'O Level', count: 100, category: 'Cambridge' },
      { id: 'cambridge-alevel', name: 'A Level', count: 120, category: 'Cambridge' },
    ];

    boardCategories = [
      { id: 1, name: 'Punjab Board', count: 500 },
      { id: 2, name: 'Sindh Board', count: 300 },
      { id: 3, name: 'Federal Board', count: 250 },
    ];

    subjectCategories = [
      { id: 1, name: 'Physics', count: 200, icon: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9' },
      { id: 2, name: 'Chemistry', count: 180, icon: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9' },
      { id: 3, name: 'Biology', count: 220, icon: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9' },
      { id: 4, name: 'Mathematics', count: 190, icon: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9' },
    ];

    return {
      props: {
        resources: allData.slice(0, 8),
        allResources: allData,
        classCategories,
        boardCategories,
        subjectCategories,
        ecatCount: 50,
        mdcatCount: 80,
        numsCount: 30,
        amcCount: 25,
        pmaCount: 20,
        cssCount: 100,
        ntsCount: 60,
        ppscCount: 90,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        resources: [],
        allResources: [],
        classCategories: [],
        boardCategories: [],
        subjectCategories: [],
        ecatCount: 0,
        mdcatCount: 0,
        numsCount: 0,
        amcCount: 0,
        pmaCount: 0,
        cssCount: 0,
        ntsCount: 0,
        ppscCount: 0,
      },
      revalidate: 3600,
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
const TaleemSpot = ({
  resources = [],
  allResources = [],
  classCategories = [],
  boardCategories = [],
  subjectCategories = [],
  ecatCount = 0,
  mdcatCount = 0,
  numsCount = 0,
  amcCount = 0,
  pmaCount = 0,
  cssCount = 0,
  ntsCount = 0,
  ppscCount = 0,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [filteredData, setFilteredData] = useState(resources);
  const [activeNews, setActiveNews] = useState(0);

  // News data
  const latestNews = useMemo(() => [
    {
      id: 1,
      title: '9th Class Biology 2024 - Lahore Board',
      date: 'Just Now',
      content: 'Latest 9th Class Biology past paper from Lahore Board for 2024 examination is now available for download.',
      type: 'trending',
    },
    {
      id: 2,
      title: 'CSS 2024 General Knowledge Notes',
      date: '2 hours ago',
      content: 'Comprehensive notes for CSS 2024 General Knowledge section now available.',
      type: 'new',
    },
    {
      id: 3,
      title: 'MDCAT 2024 Preparation Guide',
      date: '5 hours ago',
      content: 'Complete preparation guide and past papers for MDCAT 2024 entrance test.',
      type: 'popular',
    },
    {
      id: 4,
      title: 'O Level Mathematics Past Papers 2024',
      date: '1 day ago',
      content: 'Access the latest O Level Mathematics past papers for 2024.',
      type: 'new',
    },
  ], []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(resources);
      setSearchSuggestions([]);
    } else {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      const filtered = allResources.filter((item) =>
        searchTerms.every(
          (term) =>
            item.title?.toLowerCase().includes(term) ||
            item.subject?.toLowerCase().includes(term) ||
            item.class?.toLowerCase().includes(term) ||
            item.board?.toLowerCase().includes(term) ||
            item.year?.toString().includes(term) ||
            item.author?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term) ||
            item.province?.toLowerCase().includes(term)
        )
      );

      setFilteredData(filtered);

      if (searchTerm.length > 2) {
        const suggestions = [];

        // Subject suggestions
        subjectCategories.forEach((subject) => {
          if (subject.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestions.push({ text: subject.name, type: 'subject' });
          }
        });

        setSearchSuggestions(suggestions.slice(0, 5));
      } else {
        setSearchSuggestions([]);
      }
    }
  }, [searchTerm, resources, allResources, subjectCategories]);

  // Auto-rotate news
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % latestNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [latestNews.length]);

  return (
    <>
      <Head>
        <title>TaleemSpot - Pakistan's #1 Educational Resource Platform | Past Papers, Notes & Study Materials</title>
        <meta
          name="description"
          content="Access comprehensive educational resources including past papers, notes, guess papers, lectures, quizzes, and study materials for 9th-12th classes, ECAT, MDCAT, CSS, NTS, and more from all Pakistani boards and institutions. Download free educational content."
        />
        <meta
          name="keywords"
          content="past papers, Punjab board, Sindh board, KPK board, Balochistan board, AJK board, Federal board, Cambridge, O Level, A Level, MDCAT, ECAT, CSS, NTS, PPSC, study notes, guess papers, pairing scheme, quizzes, lectures"
        />
        <meta property="og:title" content="TaleemSpot - Pakistan's Premier Educational Platform" />
        <meta
          property="og:description"
          content="Download past papers, notes, lectures, quizzes, and study materials for all Pakistani boards, Cambridge, and competitive exams. Free educational resources for students."
        />
        <meta property="og:url" content="https://taleemspot.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TaleemSpot - Educational Resources" />
        <meta name="twitter:description" content="Access past papers, notes, lectures, and study materials for Pakistani students" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://taleemspot.com" />

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'TaleemSpot',
              description: "Pakistan's premier educational resource platform",
              url: 'https://taleemspot.com',
              logo: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9',
            }),
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
            {/* Left Sidebar */}
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
                  badge: index === 0 ? 'Trending News' : null,
                  href: `/resource/news/${news.id}`,
                }))}
                viewAllLink="/resource/news"
                badgeColors={{
                  'Trending News': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
                }}
              />

              {/* Classes Section */}
              <SidebarSection
                title="Classes"
                subtitle="Explore School & College Resources"
                icon={BookOpen}
                colorScheme="green"
                showSerialNumbers={true}
                items={classCategories
                  .filter((cat) => ['School', 'College'].includes(cat.category))
                  .map((cat) => ({
                    name: cat.name,
                    count: cat.count,
                    href: `/resource/punjab/${cat.name.replace(' Class', '').toLowerCase()}/notes`,
                  }))}
                viewAllLink="/resource/classes"
              />

              {/* Entry Test Section */}
              <SidebarSection
                title="Entry Test"
                subtitle="Prepare for Entry Tests"
                icon={Award}
                colorScheme="purple"
                showSerialNumbers={true}
                items={[
                  { name: 'MDCAT', count: mdcatCount, href: '/resource/mdcat/notes' },
                  { name: 'ECAT', count: ecatCount, href: '/resource/ecat/notes' },
                  { name: 'NUMS', count: numsCount, href: '/resource/nums/notes' },
                  { name: 'AMC', count: amcCount, href: '/resource/amc/notes' },
                  { name: 'PMA', count: pmaCount, href: '/resource/pma/notes' },
                ]}
                viewAllLink="/resource/entry-tests"
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

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {(searchTerm ? filteredData.slice(0, 12) : filteredData.slice(0, 8)).map((item) => (
                  <ResourceCard 
                    key={item.id} 
                    resource={{
                      ...item,
                      path: `/resource/${generateResourcePath(item)}`
                    }} 
                  />
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

                {!searchTerm && allResources.length > 8 && <ViewAllButton href="/resource/all-resources" />}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Competitive Exams Section */}
              <SidebarSection
                title="Competitive Exams"
                subtitle="Prepare for Competitive Exams"
                icon={Star}
                colorScheme="yellow"
                showSerialNumbers={true}
                items={[
                  { name: 'CSS', count: cssCount, href: '/resource/css/notes' },
                  { name: 'NTS', count: ntsCount, href: '/resource/nts/notes' },
                  { name: 'PPSC', count: ppscCount, href: '/resource/ppsc/notes' },
                  { name: 'FPSC', count: '50+', href: '/resource/fpsc/notes' },
                  { name: 'PMS', count: '30+', href: '/resource/pms/notes' },
                ]}
                viewAllLink="/resource/competitive-exams"
              />

              {/* University Section */}
              <SidebarSection
                title="University"
                subtitle="Resources for Higher Education"
                icon={Users}
                colorScheme="blue"
                showSerialNumbers={true}
                items={[
                  { name: 'MBBS', count: '100+', href: '/resource/mbbs/notes' },
                  { name: 'BDS', count: '50+', href: '/resource/bds/notes' },
                  { name: 'Engineering', count: '80+', href: '/resource/engineering/notes' },
                  { name: 'Virtual University', count: '60+', href: '/resource/virtualuniversity/notes' },
                ]}
                viewAllLink="/resource/university"
              />

              {/* Cambridge Section */}
              <SidebarSection
                title="Cambridge"
                subtitle="International Education"
                icon={BookOpen}
                colorScheme="indigo"
                showSerialNumbers={true}
                items={[
                  { name: 'O Level', count: '150+', href: '/resource/o-level/notes' },
                  { name: 'A Level', count: '200+', href: '/resource/a-level/notes' },
                  { name: 'IGCSE', count: '80+', href: '/resource/igcse/notes' },
                ]}
                viewAllLink="/resource/cambridge"
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
