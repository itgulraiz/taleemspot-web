import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import Skeleton from 'react-loading-skeleton';

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

export default function SubjectPage() {
  const router = useRouter();
  const { collection: collectionName, subject, board, year } = router.query;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPapers, setRelatedPapers] = useState([]);

  useEffect(() => {
    if (!collectionName || !subject) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, collectionName, subject);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDocument(docSnap.data());
          
          const selectedPaper = docSnap.data().subjects.find(
            item => item.board === board && item.year === year
          );
          
          if (selectedPaper) {
            setDocument(prev => ({ ...prev, selectedPaper }));
          }
        }

        setRelatedPapers(docSnap.data().subjects || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching document: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, subject, board, year]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Skeleton height={32} className="mb-4" width="60%" />
          <Skeleton height={24} className="mb-8" width="40%" />
        </div>
        
        <div className="mb-8">
          <Skeleton height={480} className="mb-8" />
        </div>
        
        <Skeleton height={40} width={150} />
      </div>
    );
  }

  if (!document) {
    return <div className="container mx-auto p-4">Document not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">
        {collectionName.replace('Punjab', '').replace('PastPapers', '')} Class {subject} Past Paper - {board} Board {year}
      </h1>
      <p className="text-gray-600 mb-8">Author: {document.metadata?.author || "TaleemSpot"}</p>

      {document.selectedPaper?.url && (
        <>
          <iframe
            src={document.selectedPaper.url.replace("/view?usp=drive_link", "/preview")}
            width="100%"
            height="480px"
            className="border-none rounded-lg mb-6"
          />
          
          <a
            href={document.selectedPaper.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 mb-12"
          >
            Download PDF
          </a>
        </>
      )}

      <h2 className="text-2xl font-bold mt-12 mb-6">More {subject} Past Papers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPapers.map((paper, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${paper.board === board && paper.year === year ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => router.push(`/${collectionName}/${subject}/${paper.board}/${paper.year}`)}
          >
            <div className="p-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                  <img 
                    src={boardLogos[paper.board] || 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png'} 
                    alt={`${paper.board} logo`} 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-center mb-1">
                {collectionName.replace('Punjab', '').replace('PastPapers', '')} Class
              </h2>
              <p className="text-gray-600 text-center mb-1">{subject}</p>
              <p className="text-green-600 font-semibold text-center">{paper.year}</p>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">{paper.board} Board</span>
              </div>
            </div>
            
            <div className="bg-green-600 text-white text-center py-2">
              View Papers
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
