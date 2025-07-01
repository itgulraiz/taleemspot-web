import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Sitemap() {
  // Simple static data - no Firebase dependencies
  const classes = [
    { id: "Punjab9thPastPapers", name: "9th Class Past Papers" },
    { id: "Punjab10thPastPapers", name: "10th Class Past Papers" },
    { id: "Punjab11thPastPapers", name: "11th Class Past Papers" },
    { id: "Punjab12thPastPapers", name: "12th Class Past Papers" },
    { id: "PunjabECATPastPapers", name: "ECAT Past Papers" },
    { id: "PunjabMDCATPastPapers", name: "MDCAT Past Papers" }
  ];
  
  const pages = [
    { url: "/", title: "Home" },
    { url: "/all-classes", title: "All Classes" },
    { url: "/all-subjects", title: "All Subjects" },
    { url: "/all-boards", title: "All Boards" },
    { url: "/all-resources", title: "All Resources" },
    { url: "/privacy-policy", title: "Privacy Policy" },
    { url: "/terms-of-service", title: "Terms of Service" },
    { url: "/cookie-policy", title: "Cookie Policy" }
  ];

  return (
    <>
      <Head>
        <title>Sitemap - TaleemSpot</title>
        <meta name="description" content="Sitemap of TaleemSpot - Find all pages and resources easily" />
        <link rel="canonical" href="https://taleemspot.com/sitemap" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Sitemap</h1>
            <p className="mt-2 text-gray-600">Find all pages and resources on TaleemSpot</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Main Pages</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Our primary pages and resources</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Pages</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {pages.map((page) => (
                          <li key={page.url} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">{page.title}</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <Link href={page.url} className="font-medium text-blue-600 hover:text-blue-500">
                                Visit
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Classes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {classes.map((cls) => (
                          <li key={cls.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">{cls.name}</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <Link href={`/${cls.id}`} className="font-medium text-blue-600 hover:text-blue-500">
                                Visit
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
