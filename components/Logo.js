import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

const Logo = ({ 
  size = "large", 
  showTagline = true, 
  showTitle = true,
  className = "",
  linkClassName = ""
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    small: {
      image: "h-8 w-8",
      title: "text-lg",
      tagline: "text-xs",
      icon: "h-4 w-4"
    },
    medium: {
      image: "h-10 w-10", 
      title: "text-xl",
      tagline: "text-sm",
      icon: "h-5 w-5"
    },
    large: {
      image: "h-12 w-12",
      title: "text-2xl", 
      tagline: "text-sm",
      icon: "h-6 w-6"
    }
  };

  const currentSize = sizes[size];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 ${linkClassName}`}>
      <div className={`${currentSize.image} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 flex items-center justify-center shadow-lg`}>
        {!imageError ? (
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
            alt="TaleemSpot Logo" 
            className="w-full h-full object-cover rounded-full"
            loading="eager"
            onError={handleImageError}
          />
        ) : (
          <BookOpen className={`${currentSize.icon} text-green-600 dark:text-green-400`} />
        )}
      </div>
      
      <div className={`flex flex-col ${className}`}>
        {showTitle && (
          <span className={`${currentSize.title} font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent`}>
            TaleemSpot
          </span>
        )}
        {showTagline && (
          <span className={`${currentSize.tagline} text-gray-500 dark:text-gray-400 font-medium`}>
            Pakistan's #1 Education Platform
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;