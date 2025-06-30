import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'next/router';
import Skeleton from 'react-skeleton-loader';

const boardLogos = {
  'Lahore': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Faisalabad': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-2.png',
  'Gujranwala': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-4.png',
  'Rawalpindi': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Multan': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Sahiwal': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Bahawalpur': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Dera Ghazi Khan': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  'Sargodha': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png'
};

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Punjab9thPastPapers'));
        const data = [];
        
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setCollections(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching collections: ", error);
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const navigateToSubject = (collectionName, subject, board, year) => {
    router.push(`/${collectionName}/${subject}/${board}/${year}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Loading Resources...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <Skeleton width="100%" height="150px" borderRadius="8px" />
              <Skeleton width="80%" height="20px" borderRadius="4px" />
              <Skeleton width="60%" height="16px" borderRadius="4px" />
              <Skeleton width="40%" height="16px" borderRadius="4px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">9th Class Past Papers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((subjectDoc) => (
          subjectDoc.subjects?.map((subject, index) => (
            <div 
              key={`${subjectDoc.id}-${index}`} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigateToSubject('Punjab9thPastPapers', subjectDoc.id, subject.board, subject.year)}
            >
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                    <img 
                      src={boardLogos[subject.board] || 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png'} 
                      alt={`${subject.board} logo`} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-center mb-1">Class 9th</h2>
                <p className="text-gray-600 text-center mb-1">{subjectDoc.id}</p>
                <p className="text-green-600 font-semibold text-center">{subject.year}</p>
                
                <div className="flex justify-between mt-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {Math.floor(Math.random() * 10000) + 1000}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {(Math.random() * 1 + 4).toFixed(1)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {Math.floor(Math.random() * 5000) + 500}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-600 text-white text-center py-2">
                View Papers
              </div>
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
