import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { 
  Menu, X, ChevronDown, Search, Bell, User, Download, Star, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Built-in Logo Component
const Logo = memo(({ size = 'medium', showTagline = false, showTitle = true }) => {
  const sizes = {
    small: { container: 'h-8', image: 'h-6 w-6', text: 'text-sm', tagline: 'text-xs' },
    medium: { container: 'h-10', image: 'h-8 w-8', text: 'text-lg', tagline: 'text-xs' },
    large: { container: 'h-12', image: 'h-10 w-10', text: 'text-xl', tagline: 'text-sm' }
  };
  
  const sizeConfig = sizes[size];
  
  return (
    <div className={`flex items-center space-x-3 ${sizeConfig.container}`}>
      <div className="flex-shrink-0">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
          alt="Taleem Spot Logo"
          className={`${sizeConfig.image} rounded-lg object-cover`}
          loading="eager"
        />
      </div>
      {showTitle && (
        <div>
          <h1 className={`${sizeConfig.text} font-bold text-red-600 dark:text-red-400 leading-tight`}>
            Taleem Spot
          </h1>
          {showTagline && (
            <p className={`${sizeConfig.tagline} text-gray-500 dark:text-gray-400 leading-none`}>
              Educational Resources
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';

// Built-in SearchBar Component
const SearchBar = memo(({ 
  searchTerm = '', 
  setSearchTerm, 
  searchSuggestions = [], 
  placeholder = 'Search...', 
  className = '' 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    if (setSearchTerm) {
      setSearchTerm(value);
    }
    setShowSuggestions(value.length > 0 && searchSuggestions.length > 0);
  }, [setSearchTerm, searchSuggestions.length]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(searchTerm.length > 0 && searchSuggestions.length > 0);
  }, [searchTerm.length, searchSuggestions.length]);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);
  
  const handleSuggestionClick = useCallback((suggestion) => {
    if (setSearchTerm) {
      setSearchTerm(suggestion.text);
    }
    setShowSuggestions(false);
  }, [setSearchTerm]);
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 
            rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
            ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        />
      </div>
      
      {/* Search Suggestions */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">{suggestion.text}</span>
                {suggestion.type && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {suggestion.type}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

// Custom hooks for logic separation
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

const useKeyboardNavigation = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    
    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection && (currentScrollY - lastScrollY > 10 || currentScrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };
    
    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection]);
  
  return { scrollDirection, scrollY };
};

// Modern navigation structure without icons
const createNavigationStructure = (classCategories) => [
  {
    id: 'home',
    name: 'Home',
    href: '/',
    type: 'link'
  },
  {
    id: 'notes',
    name: 'Notes',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: cat.name,
      href: `/${cat.id}`
    }))
  },
  {
    id: 'pairing-scheme',
    name: 'Pairing Scheme',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: `${cat.name} Pairing Scheme`,
      href: `/pairing-scheme/${cat.id}`
    }))
  },
  {
    id: 'guess-papers',
    name: 'Guess Papers',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: `${cat.name} Guess Papers`,
      href: `/guess-papers/${cat.id}`
    }))
  },
  {
    id: 'textbooks',
    name: 'Text Books',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: `${cat.name} Text Books`,
      href: `/text-books/${cat.id}`
    }))
  },
  {
    id: 'test-papers',
    name: 'Test Papers',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: `${cat.name} Test Papers`,
      href: `/test-papers/${cat.id}`
    }))
  },
  {
    id: 'past-papers',
    name: 'Past Papers',
    type: 'dropdown',
    items: classCategories.map(cat => ({
      name: cat.name,
      href: `/${cat.id}`
    }))
  },
  {
    id: 'results',
    name: 'Result',
    type: 'dropdown',
    items: [
      { name: '9th Class Result', href: '/result/9th' },
      { name: '10th Class Result', href: '/result/10th' },
      { name: '11th Class Result', href: '/result/11th' },
      { name: '12th Class Result', href: '/result/12th' }
    ]
  },
  {
    id: 'gazette',
    name: 'Gazette',
    type: 'dropdown',
    items: [
      { name: 'Educational Gazette', href: '/gazette/education' },
      { name: 'Government Gazette', href: '/gazette/government' }
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    type: 'dropdown',
    items: [
      { name: 'All Classes', href: '/all-classes' },
      { name: 'All Subjects', href: '/all-subjects' },
      { name: 'All Boards', href: '/all-boards' }
    ]
  }
];

// Modern Badge Component
const Badge = memo(({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    live: 'bg-red-500 text-white animate-pulse'
  };
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Modern Button Component
const Button = memo(({ children, variant = 'primary', size = 'md', className = '', onClick, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transform hover:scale-105'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium 
        transition-all duration-200 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 
        disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// Dropdown Menu Component
const DropdownMenu = memo(({ items, isOpen, onClose }) => (
  <div className={`
    absolute top-full left-0 bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 min-w-[250px] z-50 overflow-hidden
    transition-all duration-300 transform
    ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}
  `}>
    <div className="py-2 max-h-80 overflow-y-auto">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClose}
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
            {item.name}
          </span>
          {item.badge && (
            <Badge variant={item.badge === 'Live' ? 'live' : 'primary'} size="xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  </div>
));

DropdownMenu.displayName = 'DropdownMenu';

// Main Header Component
const Header = memo(({ 
  searchTerm, 
  setSearchTerm, 
  searchSuggestions, 
  classCategories = [], 
  subjectCategories = [], 
  boardCategories = [] 
}) => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notifications] = useState(3);
  
  // Refs
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Custom hooks
  const { scrollDirection, scrollY } = useScrollDirection();
  
  useClickOutside(headerRef, useCallback(() => setActiveDropdown(null), []));
  useClickOutside(mobileMenuRef, useCallback(() => setIsMobileMenuOpen(false), []));
  useKeyboardNavigation(isMobileMenuOpen, useCallback(() => setIsMobileMenuOpen(false), []));
  
  // Memoized navigation structure
  const navigationItems = useMemo(() => 
    createNavigationStructure(classCategories), 
    [classCategories]
  );
  
  // Event handlers
  const handleDropdownToggle = useCallback((itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  }, [activeDropdown]);
  
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);
  
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);
  
  const closeAllMenus = useCallback(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, []);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  return (
    <>
      {/* Main Header */}
      <header
        ref={headerRef}
        className={`
          sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg
          transition-transform duration-300
          ${scrollDirection === 'down' && scrollY > 100 ? '-translate-y-full' : 'translate-y-0'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <Logo size="large" showTagline showTitle />
            </Link>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchSuggestions={searchSuggestions}
                placeholder="Search for notes, papers, books..."
                className="w-full"
              />
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge variant="danger" size="xs" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              {/* User Section */}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/profile')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => router.push('/authors')}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Authors
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => router.push('/register')}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" className="flex items-center">
                <Logo size="small" showTitle />
              </Link>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMobileMenuToggle}
                  className="p-2"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
            
            {/* Mobile Search */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchSuggestions={searchSuggestions}
              placeholder="Search..."
              className="w-full"
            />
          </div>
        </div>
        
        {/* Desktop Navigation - Responsive Menu */}
        <nav className="hidden md:block bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap">
              {navigationItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.type === 'link' ? (
                    <Link
                      href={item.href}
                      className="flex items-center px-4 py-4 hover:bg-white/10 transition-colors font-medium whitespace-nowrap"
                    >
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleDropdownToggle(item.id)}
                      className={`flex items-center space-x-1 px-4 py-4 hover:bg-white/10 transition-colors font-medium whitespace-nowrap ${
                        activeDropdown === item.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === item.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                  )}
                  
                  {/* Dropdown Menu */}
                  {item.type === 'dropdown' && (
                    <DropdownMenu
                      items={item.items}
                      isOpen={activeDropdown === item.id}
                      onClose={closeAllMenus}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={handleMobileMenuToggle}
          />
          
          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            className={`
              fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden overflow-y-auto
              transition-transform duration-300 transform
              ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Menu Content */}
            <div className="p-4 space-y-6">
              {/* User Section */}
              {currentUser ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Welcome back!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      router.push('/login');
                      handleMobileMenuToggle();
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      router.push('/register');
                      handleMobileMenuToggle();
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
              
              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    {item.type === 'link' ? (
                      <Link
                        href={item.href}
                        onClick={handleMobileMenuToggle}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleDropdownToggle(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          activeDropdown === item.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          activeDropdown === item.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                    )}
                    
                    {/* Mobile Dropdown Content */}
                    {activeDropdown === item.id && item.type === 'dropdown' && (
                      <div className={`
                        ml-6 mt-2 space-y-1 overflow-hidden transition-all duration-300
                        ${activeDropdown === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      `}>
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleMobileMenuToggle}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {subItem.name}
                            </span>
                            {subItem.badge && (
                              <Badge variant={subItem.badge === 'Live' ? 'live' : 'primary'} size="xs">
                                {subItem.badge}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              
              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/trending')}
                    className="flex-col h-16"
                  >
                    <TrendingUp className="h-5 w-5 mb-1" />
                    <span className="text-xs">Trending</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/authors')}
                    className="flex-col h-16"
                  >
                    <Star className="h-5 w-5 mb-1" />
                    <span className="text-xs">Authors</span>
                  </Button>
                </div>
              </div>
              
              {/* Logout Button for Logged in Users */}
              {currentUser && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
});

Header.displayName = 'Header';

export default Header;