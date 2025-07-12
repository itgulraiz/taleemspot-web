'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ResourceCard from '../../components/ResourceCard';
import SidebarSection from '../../components/SidebarSection';
import { extractDriveId, db } from '../../firebase'; // Adjust this path to your Firebase config file
import { collection, getDocs } from 'firebase/firestore';

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

const ResourceDetail = ({ allResources }) => {
  const router = useRouter();
  const { classLevel, type, documentId } = router.query;
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateShortDescription = (resource) => {
    return `${resource.subject} ${resource.class} ${resource.type.replace('-', ' ')} for ${resource.year}. Key topics include ${resource.description.split('.')[0].toLowerCase()}.`;
  };

  useEffect(() => {
    if (classLevel && type && documentId && allResources) {
      setTimeout(() => {
        const foundResource = allResources.find(item => 
          item.class.toLowerCase() === classLevel.toLowerCase() && 
          item.type.toLowerCase() === type.toLowerCase() && 
          item.documentId === documentId
        ) || allResources[0];
        setResource(foundResource);
        
        const related = allResources
          .filter(item => item.subject === foundResource.subject && item.documentId !== documentId)
          .slice(0, 4);
        setRelatedResources(related);
        setLoading(false);
      }, 500);
    }
  }, [classLevel, type, documentId, allResources]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Resource not found</div>;
  }

  const tags = [resource.subject, resource.class, resource.board, resource.year].filter(tag => tag && tag !== 'N/A');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="border-b pb-6 mb-6 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{resource.title}</h1>
                    {resource.author && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        By {resource.author} {resource.authorImage && (
                          <img src={resource.authorImage} alt={`${resource.author}'s profile`} className="inline w-6 h-6 rounded-full ml-2" />
                        )}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">{generateShortDescription(resource)}</p>
              </div>

              <AdSenseBanner slot="resource-top-banner" format="horizontal" />

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Preview Document</h2>
                <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
                  {resource.driveId ? (
                    <iframe 
                      src={`https://drive.google.com/file/d/${resource.driveId}/preview`}
                      width="100%" 
                      height="600" 
                      allow="autoplay"
                      className="w-full bg-gray-100 dark:bg-gray-800"
                    ></iframe>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 p-4">Preview not available for this resource.</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <a 
                  href={resource.downloadUrl || resource.url} 
                  download
                  className="bg-green-600 dark:bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Download className="h-5 w-5" />
                  <span>Download {resource.type === 'PDF' ? 'PDF' : 'Resource'}</span>
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Click to download the full resource for offline study. File size may vary based on content.</p>
              </div>

              <AdSenseBanner slot="resource-bottom-banner" format="horizontal" />

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Related Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedResources.map(item => (
                    <ResourceCard key={item.id} resource={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <SidebarSection
              title="Subject Categories"
              subtitle="Explore Related Subjects"
              icon={BookOpen}
              colorScheme="green"
              showSerialNumbers={false}
              items={[{ name: resource.subject, count: allResources.filter(r => r.subject === resource.subject).length, href: `/subject/${resource.subject.toLowerCase()}` }]}
              viewAllLink="/all-subjects"
            />
            <AdSenseBanner slot="resource-sidebar-banner" format="vertical" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export async function getStaticProps() {
  try {
    let allData = [];
    for (const collectionName of allCollections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.metadata?.resourceType === 'PDF' && data.content?.fileUrl) {
              const driveId = extractDriveId(data.content.fileUrl);
              const subjects = Array.isArray(data.academicInfo?.subject) ? data.academicInfo.subject : [data.academicInfo?.subject];
              subjects.forEach((subject, index) => {
                const resource = {
                  id: `${collectionName}-${doc.id}-${index}`,
                  title: data.content.title || `${parseCollectionName(collectionName).category} ${parseCollectionName(collectionName).classLevel || ''} ${parseCollectionName(collectionName).contentType} - ${subject}`,
                  description: data.content.description || `Access ${parseCollectionName(collectionName).contentType} for ${subject} ${parseCollectionName(collectionName).classLevel || ''}`,
                  subject: subject || 'General',
                  class: parseCollectionName(collectionName).classLevel || 'General',
                  board: data.academicInfo?.board || 'N/A',
                  year: data.academicInfo?.year || 'N/A',
                  type: parseCollectionName(collectionName).contentType,
                  url: data.content.fileUrl,
                  downloadUrl: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : data.content.fileUrl,
                  driveId,
                  collection: collectionName,
                  documentId: doc.id,
                  itemIndex: index,
                  author: data.userInfo?.authorName || getRandomAuthor(),
                  authorImage: data.userInfo?.authorImage || null,
                };
                allData.push(resource);
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
        allResources: allData,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        allResources: [],
      },
      revalidate: 3600,
    };
  }
}

export async function getStaticPaths() {
  const paths = allCollections.flatMap(collectionName => {
    const { classLevel, contentType } = parseCollectionName(collectionName);
    return [{ params: { class: classLevel || 'general', type: contentType.toLowerCase(), documentId: 'doc1' } }];
  });
  return {
    paths,
    fallback: 'blocking',
  };
}

export default ResourceDetail;
