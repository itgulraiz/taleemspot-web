import React, { memo } from 'react';
import Link from 'next/link';

const SidebarSection = memo(({ 
  title, 
  subtitle, 
  icon: Icon, 
  items, 
  viewAllLink, 
  colorScheme = "blue",
  badgeColors = {},
  showSerialNumbers = true
}) => {
  const colorSchemes = {
    red: {
      iconBg: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-600 dark:text-red-400",
      hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
      viewAllColor: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300",
      serialBg: "bg-red-500",
      serialText: "text-white"
    },
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-600 dark:text-blue-400",
      hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
      viewAllColor: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
      serialBg: "bg-blue-500",
      serialText: "text-white"
    },
    green: {
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-600 dark:text-green-400",
      hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
      viewAllColor: "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300",
      serialBg: "bg-green-500",
      serialText: "text-white"
    },
    purple: {
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      titleColor: "text-purple-600 dark:text-purple-400",
      hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
      viewAllColor: "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300",
      serialBg: "bg-purple-500",
      serialText: "text-white"
    },
    yellow: {
      iconBg: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-600 dark:text-yellow-400",
      hoverBg: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
      viewAllColor: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300",
      serialBg: "bg-yellow-500",
      serialText: "text-white"
    },
    gray: {
      iconBg: "bg-gray-100 dark:bg-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      titleColor: "text-gray-600 dark:text-gray-400",
      hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-700",
      viewAllColor: "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300",
      serialBg: "bg-gray-500",
      serialText: "text-white"
    }
  };

  const colors = colorSchemes[colorScheme];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${colors.iconColor}`} />
          </div>
          <div>
            <h3 className={`font-bold text-gray-800 dark:text-gray-200 text-lg`}>
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <Link
              href={item.href || '#'}
              key={index}
              className={`flex items-center justify-between px-4 py-3 ${colors.hoverBg} rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
            >
              <div className="flex items-center space-x-3">
                {showSerialNumbers && (
                  <div className={`w-6 h-6 ${colors.serialBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${colors.serialText}`}>
                      {index + 1}
                    </span>
                  </div>
                )}
                <span className={`text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:${colors.titleColor.split(' ')[0]}`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[item.badge] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className={`text-xs ${colors.iconBg} ${colors.iconColor} px-3 py-1 rounded-full font-semibold`}>
                    {item.count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink} 
            className={`block text-center text-sm ${colors.viewAllColor} font-semibold mt-4 py-3 border-t border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg`}
          >
            View All
          </Link>
        )}
      </div>
    </div>
  );
});

SidebarSection.displayName = 'SidebarSection';

export default SidebarSection;