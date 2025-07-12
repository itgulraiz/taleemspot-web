import React, { memo } from 'react';
import { BookOpen, User, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/router';

const ResourceCard = memo(({ resource }) => {
  const router = useRouter();

  const handleCardClick = (e) => {
    e.preventDefault();
    // Use router.push for instant navigation
    router.push(resource.path);
  };

  // Construct displayInfo if not provided
  const displayInfo = resource.displayInfo || [
    resource.class,
    resource.category,
    resource.subject,
    resource.type,
    resource.province ? `- ${resource.province}` : ''
  ]
    .filter(Boolean) // Remove undefined or empty values
    .join(' ')
    .trim() || 'N/A';

  // Fallback for bottom badges if year or board is "N/A"
  const bottomBadges = [
    resource.year && resource.year !== 'N/A' ? resource.year : (resource.type || 'Type N/A'),
    resource.board && resource.board !== 'N/A' ? resource.board : (resource.subject || 'Subject N/A')
  ].filter(Boolean);

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 hover:shadow-xl group overflow-hidden cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {resource.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center">
              <span>{displayInfo}</span>
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>
        
        {/* Author Section */}
        <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            By: <span className="font-medium text-blue-600 dark:text-blue-400">{resource.author}</span>
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {bottomBadges.map((badge, index) => (
              <span
                key={index}
                className={`bg-gradient-to-r ${
                  index === 0 ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-300' 
                  : 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-300'
                } text-xs px-3 py-1 rounded-full font-medium`}
              >
                {badge}
              </span>
            ))}
          </div>
          
          <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium group-hover:text-green-700 dark:group-hover:text-green-300">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Open</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';

export default ResourceCard;
