import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ViewAllButton = ({ href = "/all-resources" }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Reset after animation
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div className="col-span-full text-center py-8">
      <Link 
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center px-8 py-3 border-2 border-green-600 rounded-lg font-semibold text-green-600 transition-all duration-300 hover:scale-105 ${
          isClicked 
            ? 'bg-green-600 text-white shadow-lg' 
            : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
        }`}
      >
        <span>View All Resources</span>
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
};

export default ViewAllButton;