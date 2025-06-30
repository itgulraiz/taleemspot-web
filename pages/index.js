import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [data, setData] = useState([]);
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
    async function fetchData() {
      setLoading(true);
      const collections = [
        'Punjab9thPastPapers',
        'Punjab10thPastPapers',
        'Punjab11thPastPapers',
        'Punjab12thPastPapers',
        'PunjabECATPastPapers',
        'PunjabMDCATPastPapers',
      ];

      const allData = [];
      for (const coll of collections) {
        const querySnapshot = await getDocs(collection(db, coll));
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          docData.subjects?.forEach((subject) => {
            allData.push({
              collection: coll,
              subject: doc.id,
              board: subject.board,
              year: subject.year,
              url: subject.url,
            });
          });
        });
      }
      setData(allData);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Head>
        <title>TaleemSpot - Past Papers</title>
        <meta name="description" content="Access past papers for Punjab boards." />
      </Head>
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Past Papers</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, index) => (
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
      )}
    </div>
  );
}
