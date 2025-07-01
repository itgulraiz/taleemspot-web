import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Download, BookOpen, Users, Book, FileText, Calculator, Beaker, Globe, Computer } from 'lucide-react';

const TaleemSpot = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  // Static data for demonstration
  const staticData = [
    {
      id: 1,
      title: "9th Class Biology Chapter 1 - Introduction to Biology",
      description: "Complete notes covering the fundamental concepts of biology, cell structure, and basic biological processes.",
      subject: "Biology",
      class: "9th",
      url: "#",
      thumbnail: "/drawbles/biology-icon.png"
    },
    {
      id: 2,
      title: "9th Class Physics Chapter 2 - Kinematics",
      description: "Detailed notes on motion, velocity, acceleration, and equations of motion with solved examples.",
      subject: "Physics", 
      class: "9th",
      url: "#",
      thumbnail: "/drawbles/physics-icon.png"
    },
    {
      id: 3,
      title: "9th Class Chemistry Chapter 1 - Fundamentals of Chemistry",
      description: "Basic concepts of chemistry, atomic structure, and chemical bonding explained in simple language.",
      subject: "Chemistry",
      class: "9th", 
      url: "#",
      thumbnail: "/drawbles/chemistry-icon.png"
    }
  ];

  // Categories data
  const categories = [
    { 
      id: 1, 
      name: "Biology", 
      icon: Beaker, 
      count: 45,
      color: "bg-green-100 text-green-600"
    },
    { 
      id: 2, 
      name: "Physics", 
      icon: Calculator, 
      count: 38,
      color: "bg-blue-100 text-blue-600"
    },
    { 
      id: 3, 
      name: "Chemistry", 
      icon: FileText, 
      count: 42,
      color: "bg-purple-100 text-purple-600"
    },
    { 
      id: 4, 
      name: "Mathematics", 
      icon: Calculator, 
      count: 35,
      color: "bg-red-100 text-red-600"
    },
    { 
      id: 5, 
      name: "English", 
      icon: Book, 
      count: 28,
      color: "bg-orange-100 text-orange-600"
    },
    { 
      id: 6, 
      name: "Computer", 
      icon: Computer, 
      count: 22,
      color: "bg-teal-100 text-teal-600"
    }
  ];

  const AdSenseBanner = ({ slot = "1234567890", format = "auto" }) => {
    useEffect(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.log("AdSense error:", err);
      }
    }, []);

    return (
      <div className="my-6 p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
        <div className="text-red-600 font-bold text-lg mb-2">AdSense Banner Ads</div>
        <div className="text-sm text-gray-600">
          Ad Slot: {slot} | Format: {format}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <ins 
            className="adsbygoogle"
            style={{display: 'block'}}
            data-ad-client="ca-pub-1926773803487692"
            data-ad-slot="6001475521"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
