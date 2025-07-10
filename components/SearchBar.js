import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  searchSuggestions = [], 
  placeholder = "Search Past Papers, Notes, Subjects...",
  className = "",
  onSuggestionClick,
  showSuggestions = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    setIsFocused(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    setIsFocused(false);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Search suggestions */}
      {showSuggestions && isFocused && searchTerm && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700">
          {searchSuggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="dark:text-white text-sm">{suggestion.text}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {suggestion.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;