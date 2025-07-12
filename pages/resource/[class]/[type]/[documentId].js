'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure this path matches your firebase config file location
import Head from 'next/head';

const ResourceDetail = () => {
  const router = useRouter();
  const { classLevel, type, documentId } = router.query;
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateShortDescription = (resource) => {
    return `${resource.subject} ${resource.class} ${resource.type.replace('-', ' ')} for ${resource.year}. Key topics include ${resource.description.split('.')[0].toLowerCase()}.`;
  };

  useEffect(() => {
    const fetchResource = async () => {
      if (!classLevel || !type || !documentId) return;

      try {
        // Fetch resource from Firebase based on documentId
        const resourceRef = doc(db, 'resources', documentId); // Assuming 'resources' is your collection
        const resourceSnap = await getDoc(resourceRef);

        if (resourceSnap.exists()) {
          const data = resourceSnap.data();
          const driveId = data.content?.fileUrl ? extractDriveId(data.content.fileUrl) : null;
          const subjects = Array.isArray(data.academicInfo?.subject) ? data.academicInfo.subject : [data.academicInfo?.subject || 'General'];
          const resourceData = {
            id: documentId,
            title: data.content?.title || `${classLevel} ${type} - ${subjects[0]}`,
            description: data.content?.description || `Access ${type} for ${subjects[0]} ${classLevel}`,
            subject: subjects[0],
            class: classLevel,
            board: data.academicInfo?.board || 'N/A',
            year: data.academicInfo?.year || 'N/A',
            type: type,
            url: data.content?.fileUrl || '#',
            downloadUrl: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : data.content?.fileUrl || '#',
            driveId,
            documentId,
            author: data.userInfo?.authorName || 'Unknown Author',
            authorImage: data.userInfo?.authorImage || null,
          };
          setResource(resourceData);

          // Fetch related resources
          const allResources = [];
          for (const collectionName of allCollections) {
            const collRef = collection(db, collectionName);
            const snapshot = await getDocs(collRef);
            snapshot.forEach((docSnap) => {
              const docData = docSnap.data();
              if (docData.metadata?.resourceType === 'PDF' && docData.content?.fileUrl) {
                const relatedDriveId = extractDriveId(docData.content.fileUrl);
                const relatedSubjects = Array.isArray(docData.academicInfo?.subject) ? docData.academicInfo.subject : [docData.academicInfo?.subject || 'General'];
                relatedSubjects.forEach((subject, index) => {
                  if (subject === resourceData.subject && docSnap.id !== documentId) {
                    allResources.push({
                      id: `${collectionName}-${docSnap.id}-${index}`,
                      title: docData.content?.title || `${classLevel} ${type} - ${subject}`,
                      description: docData.content?.description || `Access ${type} for ${subject} ${classLevel}`,
                      subject,
                      class: classLevel,
                      board: docData.academicInfo?.board || 'N/A',
                      year: docData.academicInfo?.year || 'N/A',
                      type: type,
                      url: docData.content?.fileUrl || '#',
                      downloadUrl: relatedDriveId ? `https://drive.google.com/uc?export=download&id=${relatedDriveId}` : docData.content?.fileUrl || '#',
                      driveId: relatedDriveId,
                      documentId: docSnap.id,
                    });
                  }
                });
              }
            });
          }
          setRelatedResources(allResources.slice(0, 4));
        } else {
          setResource(null); // Resource not found
        }
      } catch (error) {
        console.error('Error fetching resource:', error);
        setResource(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [classLevel, type, documentId]);

  // Helper function to extract Drive ID
  const extractDriveId = (url) => {
    try {
      const regex = /\/d\/([a-zA-Z0-9_-]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  };

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Resource Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The requested resource could not be found.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const tags = [resource.subject, resource.class, resource.board, resource.year].filter(tag => tag && tag !== 'N/A');

  return (
    <>
      <Head>
        <title>{resource.title} - TaleemSpot</title>
        <meta name="description" content={generateShortDescription(resource)} />
        <meta name="keywords" content={`${resource.subject}, ${resource.class}, ${resource.board}, ${resource.type}, TaleemSpot, educational resources`} />
        <meta property="og:title" content={`${resource.title} - TaleemSpot`} />
        <meta property="og:description" content={generateShortDescription(resource)} />
        <meta property="og:url" content={`https://app.taleemspot.com/resource/${classLevel}/${type}/${documentId}`} />
        <meta property="og:type" content="article" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1">
            <div className="col-span-1">
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
                    href={resource.downloadUrl} 
                    download
                    className="bg-green-600 dark:bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download {resource.type === 'PDF' ? 'PDF' : 'Resource'}</span>
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Click to download the full resource for offline study. File size may vary based on content.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Related Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedResources.map(item => (
                      <Link key={item.id} href={`/resource/${item.class}/${item.type}/${item.documentId}`} className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  try {
    let paths = [];

    for (const collectionName of allCollections) {
      const collRef = collection(db, collectionName);
      const snapshot = await getDocs(collRef);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.metadata?.resourceType === 'PDF' && data.content?.fileUrl) {
          const { classLevel, contentType } = parseCollectionName(collectionName);
          paths.push({
            params: { class: classLevel || 'general', type: contentType.toLowerCase(), documentId: docSnap.id },
          });
        }
      });
    }

    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  return { props: {} }; // No static props needed, all data fetched at runtime
}

export default ResourceDetail;
