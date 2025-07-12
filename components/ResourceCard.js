import React, { memo } from 'react';
import { BookOpen, User, ExternalLink, Eye, Heart, Download, Calendar, Star } from 'lucide-react';
import { useRouter } from 'next/router';

const ResourceCard = memo(({ resource }) => {
  const router = useRouter();

  const handleCardClick = (e) => {
    e.preventDefault();
    // Use router.push for instant navigation
    router.push(resource.path);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'lectures':
      case 'lecture':
        return 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 text-red-800 dark:text-red-300';
      case 'pastpapers':
      case 'past papers':
        return 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-300';
      case 'notes':
        return 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-300';
      case 'quiz':
        return 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-800 dark:text-purple-300';
      case 'textbooks':
        return 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-orange-800 dark:text-orange-300';
      case 'syllabus':
        return 'from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-800 dark:text-indigo-300';
      case 'guesspapers':
      case 'guess papers':
        return 'from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 text-yellow-800 dark:text-yellow-300';
      case 'pairingscheme':
      case 'pairing scheme':
        return 'from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 text-pink-800 dark:text-pink-300';
      case 'datesheet':
      case 'date sheet':
        return 'from-cyan-100 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800 text-cyan-800 dark:text-cyan-300';
      case 'gazette':
        return 'from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 text-teal-800 dark:text-teal-300';
      case 'result':
        return 'from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 text-emerald-800 dark:text-emerald-300';
      default:
        return 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatType = (type) => {
    if (!type) return 'Resource';
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 hover:shadow-xl group overflow-hidden cursor-pointer"
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {resource.title}
              </h3>
            </div>
          </div>
          {/* Type Badge */}
          <span className={`bg-gradient-to-r ${getTypeColor(resource.type)} text-xs px-3 py-1 rounded-full font-medium`}>
            {formatType(resource.type)}
          </span>
        </div>

        {/* Address Section - Replaces N/A N/A */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {resource.address || 'General Resource'}
          </p>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Stats Section */}
        {(resource.views || resource.likes || resource.downloads) && (
          <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
            {resource.views && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{resource.views}</span>
              </div>
            )}
            {resource.likes && (
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{resource.likes}</span>
              </div>
            )}
            {resource.downloads && (
              <div className="flex items-center space-x-1">
                <Download className="h-3 w-3" />
                <span>{resource.downloads}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Author Section */}
        <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            By: <span className="font-medium text-blue-600 dark:text-blue-400">{resource.author}</span>
          </span>
        </div>
        
        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {resource.year && resource.year !== 'N/A' && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full font-medium">
                  {resource.year}
                </span>
              </div>
            )}
            {resource.board && resource.board !== 'N/A' && (
              <span className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium">
                {resource.board}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Download Button */}
            {resource.downloadUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Download className="h-3 w-3 mr-1" />
                <span>Download</span>
              </button>
            )}
            
            {/* Open Button */}
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium group-hover:text-green-700 dark:group-hover:text-green-300">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>{resource.type?.toLowerCase() === 'lecture' ? 'Watch' : 'Open'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';

export default ResourceCard;
