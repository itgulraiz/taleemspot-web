'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Mail,
  MapPin,
  Phone,
  ArrowUp,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Shield,
  Award
} from 'lucide-react';
import Logo from './Logo';

const Footer = ({ className = '' }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Social links with WhatsApp instead of Instagram
  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/taleemspot', icon: Facebook, color: 'hover:text-blue-500' },
    { name: 'Twitter', href: 'https://twitter.com/taleemspot', icon: Twitter, color: 'hover:text-sky-500' },
    { name: 'WhatsApp', href: 'https://wa.me/923001234567', icon: MessageCircle, color: 'hover:text-green-500' },
    { name: 'YouTube', href: 'https://youtube.com/taleemspot', icon: Youtube, color: 'hover:text-red-500' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/taleemspot', icon: Linkedin, color: 'hover:text-blue-600' }
  ];

  // Quick links data
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/Punjab9thPastPapers", label: "9th Past Papers" },
    { href: "/Punjab10thPastPapers", label: "10th Past Papers" },
    { href: "/Punjab11thPastPapers", label: "11th Past Papers" },
    { href: "/Punjab12thPastPapers", label: "12th Past Papers" },
    { href: "/PunjabECATPastPapers", label: "ECAT Papers" },
    { href: "/PunjabMDCATPastPapers", label: "MDCAT Papers" }
  ];

  // Resources data
  const resources = [
    { href: "/notes", label: "Study Notes" },
    { href: "/guess-papers", label: "Guess Papers" },
    { href: "/text-books", label: "Text Books" },
    { href: "/pairing-scheme", label: "Pairing Scheme" },
    { href: "/test-papers", label: "Test Papers" },
    { href: "/result", label: "Results" }
  ];

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className={`bg-slate-900 text-white ${className}`}>
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4">
                <Logo 
                  size="medium" 
                  showTagline={true} 
                  showTitle={true}
                  className="text-white"
                />
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Pakistan's premier educational platform providing quality resources for students from 9th to 12th grade.
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a 
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 ${social.color} transition-colors duration-200`}
                      aria-label={social.name}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  <span>Trusted by 50K+</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-white flex items-center group transition-colors text-sm"
                    >
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                {resources.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-white flex items-center group transition-colors text-sm"
                    >
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white text-lg mb-4">Contact</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-slate-400 text-sm group">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="group-hover:text-white transition-colors">info@taleemspot.com</span>
                </div>
                <div className="flex items-center text-slate-400 text-sm group">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="group-hover:text-white transition-colors">Punjab, Pakistan</span>
                </div>
                <div className="flex items-center text-slate-400 text-sm group">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="group-hover:text-white transition-colors">+92 300 1234567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-slate-700 bg-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="text-slate-400 text-sm text-center sm:text-left">
                © 2025 TaleemSpot. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm">
                <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/sitemap" className="text-slate-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

export default Footer;