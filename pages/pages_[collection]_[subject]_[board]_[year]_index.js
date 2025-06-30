import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../../../lib/firebaseConfig'; // Updated path
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function PastPaperPage() {
  const router = useRouter();
  const { collection: coll, subject, board, year } = router.query;
  const [paper, setPaper] = useState(null);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const boardLogos = {
    Faisalabad: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-2.png',
    Gujranwala: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-4.png',
    Lahore: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    Rawalpindi: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    Multan: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    Sahiwal: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    Bahawalpur: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    'Dera Ghazi Khan': 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
    Sargodha: 'http://taleemspot.com/wp-content/uploads/2025/04/download-removebg-preview-11.png',
  };

  useEffect(() => {
    async function fetchPaper() {
      if (!coll || !subject || !board || !year) return;
      setLoading(true);
      const docRef = doc(db, coll, subject);
      const docSnap = await getDocs(collection(db, coll));
      let selectedPaper = null;
      const related = [];

      docSnap.forEach((doc) => {
        const docData = doc.data();
        docData.subjects?.forEach((sub) => {
          if (doc.id === subject && sub.board === board && sub.year === year) {
            selectedPaper = { ...sub, subject: doc.id };
          } else if (doc.id === subject) {
            related.push({ ...sub, subject: doc.id, collection: coll });
          }
        });
      });

      setPaper(selectedPaper);
      setRelatedPapers(related);
      setLoading(false);
    }
    fetchPaper();
  }, [coll, subject, board, year]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <p className="text-center text-gray-800 dark:text-white">Paper not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Head>
        <title>{`${coll.replace('Punjab', '').replace('PastPapers', '')} Class Past Paper BISE ${board} ${year} ${subject}`}</title>
        <meta name="description" content={`View and download ${subject} past paper for ${coll.replace('Punjab', '').replace('PastPapers', '')} class, BISE ${board}, ${year}.`} />
      </Head>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {`${coll.replace('Punjab', '').replace('PastPapers', '')} Class Past Paper BISE ${board} ${year} ${subject}`}
        </h1>
        <iframe
          src={paper.url.replace('/view?usp=drive_link', '/preview')}
          with="100%"
          height="480"
          className="rounded-lg mb-4"
          style={{ border: 'none' }}
        />
        <a
          href={paper.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-6"
        >
          Download PDF
        </a>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Related Past Papers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedPapers.map((item, index) => (
            <Link
              key={index}
              href={`/${item.collection}/${item.subject}/${item.board}/${item.year}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src={boardLogos[item.board] || boardLogos['Lahore']}
                    alt={`${item.board} Logo`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-full"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {item.collection.replace('Punjab', '').replace('PastPapers', '')} Class
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{item.subject}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}