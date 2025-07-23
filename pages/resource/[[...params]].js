import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  BookOpen, Download, ExternalLink, Home as HomeIcon, ChevronRight, 
  Search, Share2, Eye, Clock, FileText, Video, Users, Tag,
  Heart, Bookmark, ArrowLeft, Calendar, User, Star
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Enhanced helper function to extract Drive ID from URL
function extractDriveId(url) {
  if (!url) return null;
  try {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting Drive ID:', error);
    return null;
  }
}

// Enhanced URL segment formatting
function formatUrlSegment(segment) {
  if (!segment) return '';
  
  // Special cases
  const specialCases = {
    'mdcat': 'MDCAT',
    'ecat': 'ECAT', 
    'css': 'CSS',
    'nts': 'NTS',
    'ppsc': 'PPSC',
    'fpsc': 'FPSC',
    'spsc': 'SPSC',
    'kpsc': 'KPSC',
    'bpsc': 'BPSC',
    'ajkpsc': 'AJKPSC',
    'pms': 'PMS',
    'nums': 'NUMS',
    'amc': 'AMC',
    'pma': 'PMA',
    'o-level': 'O Level',
    'a-level': 'A Level',
    'olevel': 'O Level',
    'alevel': 'A Level'
  };
  
  const lower = segment.toLowerCase();
  if (specialCases[lower]) return specialCases[lower];
  
  // Handle hyphenated words
  if (segment.includes('-')) {
    return segment.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle camelCase
  if (/[a-z][A-Z]/.test(segment)) {
    return segment.replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

// Enhanced category mapping
const CATEGORY_MAPPING = {
  provinces: ['punjab', 'sindh', 'khyberpakhtunkhwa', 'balochistan', 'azadjammukashmir', 'gilgitbaltistan', 'federal'],
  classes: {
    school: ['9th', '10th', 'class9', 'class10'],
    college: ['11th', '12th', 'class11', 'class12'],
    cambridge: ['o-level', 'a-level', 'olevel', 'alevel'],
    entryTest: ['mdcat', 'ecat', 'nums', 'amc', 'pma', 'universityentrytest'],
    university: ['bds', 'mbbs', 'allamaiiqbalopenuniversity', 'virtualuniversity', 'otheruniversity'],
    competition: ['css', 'nts', 'ppsc', 'fpsc', 'spsc', 'kpsc', 'bpsc', 'ajkpsc', 'pms']
  },
  contentTypes: ['notes', 'pastpapers', 'textbooks', 'lectures', 'quiz', 'test', 'syllabus', 'guesspapers', 'datesheet', 'result', 'rollnoslip', 'gazette', 'pairingscheme']
};

// Smart URL parser with improved logic
function parseResourceUrl(segments) {
  if (!segments || segments.length === 0) {
    return { error: "No segments provided" };
  }

  let province = null;
  let category = null;
  let classLevel = null;
  let contentType = null;
  let subject = null;
  let chapter = null;
  let year = null;
  let resourceId = null;
  let additionalInfo = [];
  
  let currentIndex = 0;
  const normalizedSegments = segments.map(s => s.toLowerCase().replace(/-/g, ''));
  
  // Check for province (first segment)
  if (CATEGORY_MAPPING.provinces.includes(normalizedSegments[0])) {
    province = segments[0];
    currentIndex = 1;
  }
  
  // Check for class/exam type
  if (currentIndex < segments.length) {
    const segment = normalizedSegments[currentIndex];
    
    if (CATEGORY_MAPPING.classes.school.some(c => segment.includes(c.replace(/[^a-z0-9]/g, '')))) {
      category = 'School';
      classLevel = segments[currentIndex];
      currentIndex++;
    } else if (CATEGORY_MAPPING.classes.college.some(c => segment.includes(c.replace(/[^a-z0-9]/g, '')))) {
      category = 'College';
      classLevel = segments[currentIndex];
      currentIndex++;
    } else if (CATEGORY_MAPPING.classes.cambridge.some(c => segment.includes(c.replace(/[^a-z0-9]/g, '')))) {
      category = 'Cambridge';
      classLevel = segments[currentIndex];
      currentIndex++;
    } else if (CATEGORY_MAPPING.classes.entryTest.some(c => segment.includes(c))) {
      category = 'Entry Test';
      classLevel = segments[currentIndex];
      currentIndex++;
    } else if (CATEGORY_MAPPING.classes.university.some(c => segment.includes(c))) {
      category = 'University';
      classLevel = segments[currentIndex];
      currentIndex++;
    } else if (CATEGORY_MAPPING.classes.competition.some(c => segment.includes(c))) {
      category = 'Competition Exam';
      classLevel = segments[currentIndex];
      currentIndex++;
    }
  }
  
  // Check for content type
  if (currentIndex < segments.length) {
    const segment = normalizedSegments[currentIndex];
    if (CATEGORY_MAPPING.contentTypes.some(ct => segment.includes(ct))) {
      contentType = segments[currentIndex];
      currentIndex++;
    }
  }
  
  // Parse remaining segments
  while (currentIndex < segments.length) {
    const segment = segments[currentIndex];
    const normalized = segment.toLowerCase();
    
    // Check if it's a subject
    if (['physics', 'chemistry', 'biology', 'mathematics', 'english', 'urdu', 'islamiat', 'computer', 'economics'].some(s => normalized.includes(s))) {
      subject = segment;
    }
    // Check if it's a chapter
    else if (normalized.includes('chapter')) {
      chapter = segment;
    }
    // Check if it's a year
    else if (/\d{4}/.test(segment)) {
      year = segment.match(/\d{4}/)[0];
    }
    // Check if it looks like a Firestore ID (long alphanumeric string)
    else if (segment.length > 15 && /^[a-zA-Z0-9]+$/.test(segment)) {
      resourceId = segment;
    }
    // Everything else goes to additional info
    else {
      additionalInfo.push(segment);
    }
    
    currentIndex++;
  }
  
  // Generate collection name
  let collectionName = '';
  if (province) collectionName += formatUrlSegment(province).replace(/\s/g, '');
  if (classLevel) collectionName += formatUrlSegment(classLevel).replace(/\s/g, '');
  if (contentType) collectionName += formatUrlSegment(contentType).replace(/\s/g, '');
  
  return {
    province,
    category: category || 'General',
    classLevel,
    contentType,
    subject,
    chapter,
    year,
    resourceId,
    additionalInfo,
    collectionName: collectionName || 'General',
    segments,
    urlPath: '/' + segments.join('/'),
    isSpecificResource: !!resourceId
  };
}

// Enhanced resource fetching
async function fetchResourceData(parsedUrl) {
  let resource = null;
  let relatedResources = [];
  
  try {
    if (parsedUrl.isSpecificResource && parsedUrl.resourceId) {
      // Fetch specific resource
      const docRef = doc(db, parsedUrl.collectionName, parsedUrl.resourceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const driveId = extractDriveId(data.content?.fileUrl);
        
        resource = {
          id: docSnap.id,
          title: data.content?.title || generateTitle(parsedUrl),
          description: data.content?.description || generateDescription(parsedUrl),
          subject: data.academicInfo?.subject || parsedUrl.subject || 'General',
          class: data.academicInfo?.class || parsedUrl.classLevel || 'General',
          board: data.academicInfo?.board || 'N/A',
          year: data.academicInfo?.year || parsedUrl.year || 'N/A',
          type: parsedUrl.contentType || 'Resource',
          url: data.content?.fileUrl || data.content?.youtubeUrl || '',
          downloadUrl: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : data.content?.fileUrl,
          driveId,
          thumbnail: data.media?.imageUrl || data.content?.thumbnailUrl,
          author: data.userInfo?.authorName || 'TaleemSpot',
          authorImage: data.userInfo?.authorImage,
          tags: data.metadata?.tags || [],
          views: data.analytics?.views || 0,
          downloads: data.analytics?.downloads || 0,
          rating: data.analytics?.rating || 0,
          createdAt: data.metadata?.createdAt?.toDate?.() || new Date(),
          updatedAt: data.metadata?.updatedAt?.toDate?.() || new Date(),
          category: parsedUrl.category,
          province: parsedUrl.province
        };
        
        // Fetch related resources
        relatedResources = await fetchRelatedResources(parsedUrl, data.academicInfo?.subject);
      }
    } else {
      // Fetch category resources
      relatedResources = await fetchCategoryResources(parsedUrl);
    }
  } catch (error) {
    console.error('Error fetching resource data:', error);
  }
  
  return { resource, relatedResources };
}

// Helper functions for generating titles and descriptions
function generateTitle(parsedUrl) {
  const parts = [];
  if (parsedUrl.subject) parts.push(formatUrlSegment(parsedUrl.subject));
  if (parsedUrl.contentType) parts.push(formatUrlSegment(parsedUrl.contentType));
  if (parsedUrl.classLevel) parts.push(formatUrlSegment(parsedUrl.classLevel));
  if (parsedUrl.province) parts.push(formatUrlSegment(parsedUrl.province));
  if (parsedUrl.year) parts.push(parsedUrl.year);
  
  return parts.join(' - ') || 'Educational Resource';
}

function generateDescription(parsedUrl) {
  const parts = [];
  if (parsedUrl.contentType) parts.push(`Access ${formatUrlSegment(parsedUrl.contentType)}`);
  if (parsedUrl.subject) parts.push(`for ${formatUrlSegment(parsedUrl.subject)}`);
  if (parsedUrl.classLevel) parts.push(`${formatUrlSegment(parsedUrl.classLevel)}`);
  if (parsedUrl.province) parts.push(`from ${formatUrlSegment(parsedUrl.province)}`);
  
  return parts.join(' ') || 'Educational resources for Pakistani students';
}

// Fetch related resources
async function fetchRelatedResources(parsedUrl, subject, limit = 6) {
  try {
    let relatedQuery;
    
    if (subject) {
      relatedQuery = query(
        collection(db, parsedUrl.collectionName),
        where('academicInfo.subject', '==', subject),
        orderBy('metadata.createdAt', 'desc'),
        limit(limit)
      );
    } else {
      relatedQuery = query(
        collection(db, parsedUrl.collectionName),
        orderBy('metadata.createdAt', 'desc'),
        limit(limit)
      );
    }
    
    const snapshot = await getDocs(relatedQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().content?.title || 'Educational Resource',
      subject: doc.data().academicInfo?.subject || 'General',
      class: doc.data().academicInfo?.class || parsedUrl.classLevel || 'General',
      type: parsedUrl.contentType || 'Resource',
      url: `/resource/${parsedUrl.segments.join('/')}/${doc.id}`,
      thumbnail: doc.data().media?.imageUrl,
      views: doc.data().analytics?.views || 0
    }));
  } catch (error) {
    console.error('Error fetching related resources:', error);
    return [];
  }
}

// Fetch category resources
async function fetchCategoryResources(parsedUrl, limit = 12) {
  try {
    const resourcesQuery = query(
      collection(db, parsedUrl.collectionName),
      orderBy('metadata.createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().content?.title || 'Educational Resource',
      subject: doc.data().academicInfo?.subject || 'General',
      class: doc.data().academicInfo?.class || parsedUrl.classLevel || 'General',
      type: parsedUrl.contentType || 'Resource',
      url: `/resource/${parsedUrl.segments.join('/')}/${doc.id}`,
      thumbnail: doc.data().media?.imageUrl,
      description: doc.data().content?.description || '',
      views: doc.data().analytics?.views || 0,
      author: doc.data().userInfo?.authorName || 'TaleemSpot'
    }));
  } catch (error) {
    console.error('Error fetching category resources:', error);
    return [];
  }
}

// Enhanced ResourceCard component
const ResourceCard = ({ resource, isRelated = false }) => {
  const cardClasses = isRelated 
    ? "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
    : "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-300";

  return (
    <Link href={resource.url} className={cardClasses}>
      <div className="relative">
        {resource.thumbnail && (
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img 
              src={resource.thumbnail} 
              alt={resource.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9';
              }}
            />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {formatUrlSegment(resource.type)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
          {resource.title}
        </h3>
        
        {resource.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {resource.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {resource.subject}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {resource.class}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {resource.views || 0}
            </span>
            {resource.author && (
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {resource.author}
              </span>
            )}
          </div>
          {resource.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{resource.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Main ResourcePage component
export default function ResourcePage({ resource, relatedResources, parsedUrl, seo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...parsedUrl.segments.map((segment, index) => ({
      name: formatUrlSegment(segment),
      path: `/resource/${parsedUrl.segments.slice(0, index + 1).join('/')}`
    }))
  ];

  // Handle actions
  const handleBookmark = () => setBookmarked(!bookmarked);
  const handleLike = () => setLiked(!liked);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: seo.title,
        text: seo.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (router.isFallback || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://taleemspot.com${parsedUrl.urlPath}`} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={resource?.thumbnail || seo.image} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={resource?.thumbnail || seo.image} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://taleemspot.com${parsedUrl.urlPath}`} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalResource',
              name: seo.title,
              description: seo.description,
              url: `https://taleemspot.com${parsedUrl.urlPath}`,
              image: resource?.thumbnail || seo.image,
              publisher: {
                '@type': 'Organization',
                name: 'TaleemSpot',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9'
                }
              },
              datePublished: resource?.createdAt?.toISOString(),
              dateModified: resource?.updatedAt?.toISOString(),
              author: {
                '@type': 'Person',
                name: resource?.author || 'TaleemSpot'
              }
            })
          }}
        />
      </Head>

      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
                <Link 
                  href={crumb.path}
                  className={`${
                    index === breadcrumbs.length - 1 
                      ? 'text-green-600 font-medium' 
                      : 'text-gray-500 hover:text-green-600'
                  } whitespace-nowrap`}
                >
                  {index === 0 && <HomeIcon className="h-4 w-4 mr-1 inline" />}
                  {crumb.name}
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {resource ? (
              /* Specific Resource View */
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Resource Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                      <p className="text-gray-600 text-lg leading-relaxed">{resource.description}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={handleLike}
                        className={`p-2 rounded-lg transition-colors ${
                          liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={handleBookmark}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Resource Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.subject && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {resource.subject}
                      </span>
                    )}
                    {resource.class && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {resource.class}
                      </span>
                    )}
                    {resource.board && resource.board !== 'N/A' && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {resource.board}
                      </span>
                    )}
                    {resource.year && resource.year !== 'N/A' && (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        {resource.year}
                      </span>
                    )}
                  </div>
                  
                  {/* Resource Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{resource.views} views</span>
                    </div>
                    {resource.downloads > 0 && (
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        <span>{resource.downloads} downloads</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{resource.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{resource.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Resource Content */}
                <div className="p-6">
                  {/* Google Drive Embed */}
                  {resource.driveId && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        Preview Document
                      </h2>
                      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                        <iframe 
                          src={`https://drive.google.com/file/d/${resource.driveId}/preview`}
                          width="100%" 
                          height="600" 
                          allow="autoplay"
                          className="w-full"
                          title="Document Preview"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* YouTube Embed */}
                  {resource.url?.includes('youtube') && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Video className="h-5 w-5 mr-2 text-red-600" />
                        Watch Video
                      </h2>
                      <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm aspect-video">
                        <iframe 
                          src={`https://www.youtube.com/embed/${resource.url.split('v=')[1]?.split('&')[0]}`}
                          width="100%" 
                          height="100%" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Video Content"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Download Section */}
                  {resource.downloadUrl && (
                    <div className="mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-2">Download Resource</h3>
                        <p className="text-green-700 text-sm mb-4">
                          Click the button below to download this {resource.type.toLowerCase()} to your device.
                        </p>
                        <a 
                          href={resource.downloadUrl}
                          download
                          className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download {formatUrlSegment(resource.type)}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Category Listing View */
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {generateTitle(parsedUrl)}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {generateDescription(parsedUrl)}
                  </p>
                  
                  {parsedUrl.category && (
                    <div className="mt-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {parsedUrl.category}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Resources Grid */}
                {relatedResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {relatedResources.map(item => (
                      <ResourceCard key={item.id} resource={item} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Resources Found</h3>
                    <p className="text-gray-500">
                      We couldn't find any resources for this category. Try browsing other sections.
                    </p>
                    <Link 
                      href="/"
                      className="inline-flex items-center mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <HomeIcon className="h-5 w-5 mr-2" />
                      Back to Home
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Related Resources */}
            {relatedResources.length > 0 && resource && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-green-600" />
                  Related Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedResources.slice(0, 6).map(item => (
                    <ResourceCard key={item.id} resource={item} isRelated={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resource Info Card */}
            {resource && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resource Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {formatUrlSegment(resource.type)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subject:</span>
                    <span className="text-sm font-medium bg-green-50 text-green-700 px-2 py-1 rounded">
                      {resource.subject}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Class:</span>
                    <span className="text-sm font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      {resource.class}
                    </span>
                  </div>
                  {resource.board !== 'N/A' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Board:</span>
                      <span className="text-sm font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded">
                        {resource.board}
                      </span>
                    </div>
                  )}
                  {resource.year !== 'N/A' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Year:</span>
                      <span className="text-sm font-medium bg-red-50 text-red-700 px-2 py-1 rounded">
                        {resource.year}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Quick Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Quick Access
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Past Papers', href: '/resource/past-papers', icon: FileText },
                  { name: 'Notes', href: '/resource/notes', icon: BookOpen },
                  { name: 'MDCAT', href: '/resource/mdcat', icon: FileText },
                  { name: 'CSS', href: '/resource/css', icon: BookOpen },
                  { name: 'A Level', href: '/resource/a-level', icon: FileText }
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Author Info */}
            {resource?.author && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Author
                </h3>
                <div className="flex items-center space-x-3">
                  {resource.authorImage ? (
                    <img 
                      src={resource.authorImage}
                      alt={resource.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800">{resource.author}</h4>
                    <p className="text-sm text-gray-500">Content Creator</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const { params } = context;
    const segments = params?.params || [];
    
    // Parse URL segments
    const parsedUrl = parseResourceUrl(segments);
    
    if (parsedUrl.error) {
      return { notFound: true };
    }
    
    // Fetch resource data
    const { resource, relatedResources } = await fetchResourceData(parsedUrl);
    
    // Generate SEO data
    const seo = {
      title: resource?.title || generateTitle(parsedUrl) + ' | TaleemSpot',
      description: resource?.description || generateDescription(parsedUrl),
      keywords: [
        parsedUrl.subject,
        parsedUrl.contentType,
        parsedUrl.classLevel,
        parsedUrl.province,
        'past papers',
        'notes',
        'educational resources',
        'pakistan'
      ].filter(Boolean).join(', '),
      image: resource?.thumbnail || 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9'
    };
    
    return {
      props: {
        resource,
        relatedResources,
        parsedUrl,
        seo
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
}
