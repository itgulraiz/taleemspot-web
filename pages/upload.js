'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { 
  Upload as UploadIcon, 
  FileText,
  Video,
  X,
  CheckCircle,
  ArrowLeft,
  Home,
  Clock,
  User,
  AlertCircle,
  File,
  Cloud,
  Plus,
  Zap,
  Target,
  Award,
  Star,
  Camera,
  Link,
  Youtube,
  Tags,
  Image as ImageIcon,
  HelpCircle,
  BookOpen,
  GraduationCap,
  PlusCircle
} from 'lucide-react';

const Upload = () => {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  
  // Current data and time
  const currentDateTime = '2025-07-11 03:23:11';
  const currentUserLogin = 'itgulraiz';
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data states
  const [resourceType, setResourceType] = useState(''); // PDF or Lecture first
  const [mainCategory, setMainCategory] = useState('');
  const [contentType, setContentType] = useState('');
  const [province, setProvince] = useState('');
  const [classLevel, setClassLevel] = useState('');
  
  // Additional fields
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [focusKeywords, setFocusKeywords] = useState('');
  const [customOption, setCustomOption] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputType, setCustomInputType] = useState('');
  
  // Content type specific fields
  const [questionType, setQuestionType] = useState('');
  const [testType, setTestType] = useState('');
  
  // Quiz specific fields
  const [quizQuestion, setQuizQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [quizImageUrl, setQuizImageUrl] = useState('');
  
  // URLs and media
  const [driveUrl, setDriveUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

  // Complete collections structure matching Selection.txt exactly with updated categories
  const allCollections = {
    School: {
      provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
      classes: ['9th', '10th'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: true },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'GuessPapers': { needsBoard: false },
        'DateSheet': { needsBoard: true },
        'Result': { needsBoard: false },
        'RollNoSlip': { needsBoard: false },
        'Gazette': { needsBoard: true },
        'PairingScheme': { needsBoard: false }
      }
    },
    College: {
      provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
      classes: ['11th', '12th'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: true },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'GuessPapers': { needsBoard: false },
        'DateSheet': { needsBoard: true },
        'Result': { needsBoard: false },
        'RollNoSlip': { needsBoard: false },
        'Gazette': { needsBoard: true },
        'PairingScheme': { needsBoard: false }
      }
    },
    Cambridge: {
      classes: ['OLevel', 'ALevel'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: false },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false }
      }
    },
    'Entry Test': {
      classes: ['PMA', 'UniversityEntryTest', 'MDCAT', 'ECAT', 'NUMS', 'AMC'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: false },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'Result': { needsBoard: false },
        'RollNoSlip': { needsBoard: false }
      },
      provincesFor: {
        'MDCAT': ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
        'UniversityEntryTest': ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal']
      }
    },
    University: {
      classes: ['BDS', 'MBBS', 'AllamaIqbalOpenUniversity', 'VirtualUniversity'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: false },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'GuessPapers': { needsBoard: false },
        'RollNoSlip': { needsBoard: false }
      },
      provincesFor: {
        'OtherUniversity': ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal']
      }
    },
    'Competition Exam': {
      classes: ['CSS', 'NTS', 'AJKPSC', 'KPSC', 'BPSC', 'SPSC', 'FPSC', 'PPSC', 'PMS'],
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'Result': { needsBoard: false }
      }
    },
    General: {
      contentTypes: {
        'Notes': { needsBoard: false },
        'TextBooks': { needsBoard: false },
        'PastPapers': { needsBoard: false },
        'Lectures': { needsBoard: false },
        'Quiz': { needsBoard: false },
        'Test': { needsBoard: false },
        'Syllabus': { needsBoard: false },
        'GuessPapers': { needsBoard: false },
        'DateSheet': { needsBoard: false },
        'Gazette': { needsBoard: false },
        'PairingScheme': { needsBoard: false },
        'UrduCalligraphy': { needsBoard: false },
        'EnglishCalligraphy': { needsBoard: false },
        'EnglishLanguage': { needsBoard: false }
      }
    }
  };

  // Subjects by category (with Add New option)
  const getSubjects = () => {
    const subjectsByCategory = {
      School: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pakistan Studies', 'Computer Science', 'Economics', 'Accounting', 'Business Studies'],
      College: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pakistan Studies', 'Computer Science', 'Economics', 'Accounting', 'Business Studies', 'Psychology', 'Sociology', 'Philosophy'],
      Cambridge: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Language', 'English Literature', 'Business Studies', 'Economics', 'Computer Science', 'Accounting'],
      'Entry Test': ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'General Knowledge', 'Logical Reasoning'],
      University: ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Medicine', 'Surgery', 'Gynecology', 'Pediatrics', 'Community Medicine'],
      'Competition Exam': ['General Knowledge', 'Current Affairs', 'Pakistan Affairs', 'Islamic Studies', 'English', 'Mathematics', 'Reasoning', 'Computer Science']
    };
    
    const subjects = subjectsByCategory[mainCategory] || ['General'];
    return [...subjects, 'Add New'];
  };

  // Chapters by subject (with Add New option)
  const getChapters = () => {
    const chaptersBySubject = {
      Mathematics: ['Chapter 1: Numbers', 'Chapter 2: Algebra', 'Chapter 3: Geometry', 'Chapter 4: Trigonometry', 'Chapter 5: Statistics', 'Chapter 6: Probability'],
      Physics: ['Chapter 1: Mechanics', 'Chapter 2: Waves', 'Chapter 3: Electricity', 'Chapter 4: Magnetism', 'Chapter 5: Optics', 'Chapter 6: Modern Physics'],
      Chemistry: ['Chapter 1: Atomic Structure', 'Chapter 2: Chemical Bonding', 'Chapter 3: Acids and Bases', 'Chapter 4: Organic Chemistry', 'Chapter 5: Physical Chemistry'],
      Biology: ['Chapter 1: Cell Biology', 'Chapter 2: Genetics', 'Chapter 3: Evolution', 'Chapter 4: Ecology', 'Chapter 5: Human Physiology'],
      English: ['Chapter 1: Grammar', 'Chapter 2: Comprehension', 'Chapter 3: Essay Writing', 'Chapter 4: Literature', 'Chapter 5: Poetry'],
      Urdu: ['Chapter 1: قواعد', 'Chapter 2: نثر', 'Chapter 3: شاعری', 'Chapter 4: تاریخ ادب', 'Chapter 5: ترجمہ']
    };
    
    if (selectedSubject && selectedSubject !== 'Add New' && chaptersBySubject[selectedSubject]) {
      return [...chaptersBySubject[selectedSubject], 'Add New'];
    }
    
    // Default chapters
    const defaultChapters = Array.from({length: 15}, (_, i) => `Chapter ${i + 1}`);
    return [...defaultChapters, 'Add New'];
  };

  // Test types
  const testTypes = ['Weekly', 'Monthly', 'Chapter Wise', '2-2 Chapter', 'Quarter Wise', 'Half Book', 'Full Book', 'Grand Test Session'];

  // Helper functions
  const getMainCategories = () => Object.keys(allCollections);

  const getContentTypes = () => {
    if (!mainCategory) return [];
    
    const category = allCollections[mainCategory];
    if (!category?.contentTypes) return [];
    
    let types = Object.keys(category.contentTypes);
    
    // Filter content types based on resource type
    if (resourceType === 'Lecture') {
      types = types.filter(type => ['Lectures'].includes(type));
    } else if (resourceType === 'PDF') {
      types = types.filter(type => !['Lectures'].includes(type));
    }
    
    return types.sort(); // No Add New for content types
  };

  const getProvinces = () => {
    if (!mainCategory) return [];
    
    const category = allCollections[mainCategory];
    if (category?.provinces) {
      return category.provinces; // No Add New for provinces
    }
    
    if (category?.provincesFor && classLevel && category.provincesFor[classLevel]) {
      return category.provincesFor[classLevel]; // No Add New for provinces
    }
    
    return [];
  };

  const getClasses = () => {
    if (!mainCategory) return [];
    
    const category = allCollections[mainCategory];
    if (category?.classes) {
      return category.classes; // No Add New for classes
    }
    
    return [];
  };

  const getBoards = () => {
    if (!province || province === 'Add New') return [];
    
    const boardMap = {
      'Punjab': ['Punjab Board', 'Lahore Board', 'Rawalpindi Board', 'Faisalabad Board', 'Multan Board', 'Bahawalpur Board', 'Sargodha Board', 'Gujranwala Board', 'D.G Khan Board'],
      'Sindh': ['Sindh Board', 'Karachi Board', 'Hyderabad Board', 'Sukkur Board', 'Larkana Board', 'Mirpurkhas Board'],
      'KhyberPakhtunkhwa': ['KPK Board', 'Peshawar Board', 'Mardan Board', 'Abbottabad Board', 'Bannu Board', 'D.I Khan Board', 'Kohat Board', 'Malakand Board'],
      'Balochistan': ['Balochistan Board', 'Quetta Board', 'Kalat Board', 'Turbat Board'],
      'AzadJammuKashmir': ['AJK Board', 'Mirpur Board', 'Muzaffarabad Board'],
      'GilgitBaltistan': ['GB Board', 'Gilgit Board', 'Baltistan Board'],
      'Federal': ['Federal Board', 'Islamabad Board']
    };
    
    const boards = boardMap[province] || [];
    return [...boards, 'Add New']; // Add New allowed for boards
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 20; i--) {
      years.push(i.toString());
    }
    return years; // No Add New for years
  };

  const needsBoard = () => {
    if (!mainCategory || !contentType) return false;
    
    const category = allCollections[mainCategory];
    if (category?.contentTypes && category.contentTypes[contentType]) {
      return category.contentTypes[contentType].needsBoard;
    }
    
    return false;
  };

  const needsSubject = () => {
    return ['PastPapers', 'GuessPapers', 'Lectures', 'Notes', 'PairingScheme', 'Quiz', 'Test', 'TextBooks'].includes(contentType);
  };

  const needsChapter = () => {
    return ['Lectures', 'Notes', 'Quiz'].includes(contentType) && selectedSubject && selectedSubject !== 'Add New';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      setError('Image must be less than 1MB');
      return;
    }

    setUploadImage(file);
    setError('');
  };

  const generateCollectionName = () => {
    let parts = [];
    
    if (mainCategory === 'General') {
      // For General category, use exact collection names from Selection.txt
      if (contentType === 'UrduCalligraphy') return 'UrduCalligraphy';
      if (contentType === 'EnglishCalligraphy') return 'EnglishCalligraphy';
      if (contentType === 'EnglishLanguage') return 'EnglishLanguage';
      return contentType || 'General';
    } else if (mainCategory === 'Cambridge') {
      // For Cambridge - OLevel, ALevel
      return classLevel + contentType;
    } else if (mainCategory === 'Competition Exam') {
      // For Competition Exams - no provinces
      return classLevel + contentType;
    } else if (mainCategory === 'University' && (classLevel === 'VirtualUniversity' || classLevel === 'AllamaIqbalOpenUniversity' || classLevel === 'MBBS' || classLevel === 'BDS')) {
      // For University categories without provinces
      return classLevel + contentType;
    } else if (mainCategory === 'Entry Test' && (classLevel === 'ECAT' || classLevel === 'NUMS' || classLevel === 'AMC' || classLevel === 'PMA')) {
      // For Entry Test categories without provinces
      return classLevel + contentType;
    } else {
      // Standard structure with provinces
      if (province) parts.push(province);
      if (classLevel) parts.push(classLevel);
      if (contentType) parts.push(contentType);
    }
    
    return parts.join('') || 'DefaultCollection';
  };

  const createMapBasedDocument = () => {
    const docData = {
      // Resource metadata
      metadata: {
        resourceType,
        mainCategory,
        contentType,
        province,
        classLevel,
        collection: generateCollectionName(),
        uploadDateTime: currentDateTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      // User information
      userInfo: {
        userId: currentUser.uid,
        userDisplayName: userProfile?.fullName || 'Unknown User',
        userUsername: userProfile?.username || 'unknown',
        authorName: userProfile?.fullName || 'Unknown Author',
        education: userProfile?.education || ''
      },
      
      // Content details
      content: {
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim().split(',').map(tag => tag.trim()).filter(tag => tag),
        focusKeywords: focusKeywords.trim().split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
        driveUrl: driveUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        fileUrl: resourceType === 'PDF' ? driveUrl.trim() : youtubeUrl.trim()
      },
      
      // Academic information (nested map)
      academicInfo: {
        ...(selectedBoard && selectedBoard !== 'Add New' && { board: selectedBoard }),
        ...(selectedSubject && selectedSubject !== 'Add New' && { subject: selectedSubject }),
        ...(selectedChapter && selectedChapter !== 'Add New' && { chapter: selectedChapter }),
        ...(selectedYear && { year: selectedYear }),
        ...(testType && { testType }),
        ...(contentType === 'Quiz' && {
          quiz: {
            question: quizQuestion.trim(),
            questionType,
            options: {
              option1: option1.trim(),
              option2: option2.trim(),
              option3: option3.trim(),
              option4: option4.trim()
            },
            correctOption,
            ...(quizImageUrl && { imageUrl: quizImageUrl.trim() })
          }
        })
      },
      
      // Media and assets
      media: {
        imageUrl: '',
        hasImage: false
      },
      
      // Analytics and engagement
      analytics: {
        views: 0,
        downloads: 0,
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        approved: false,
        featured: false
      }
    };
    
    return docData;
  };

  const handleAddNew = (type, value) => {
    if (!value.trim()) {
      setError('Please enter a valid value');
      return;
    }
    
    // Set the custom value based on type (only for allowed types)
    switch(type) {
      case 'subject':
        setSelectedSubject(value);
        break;
      case 'chapter':
        setSelectedChapter(value);
        break;
      case 'board':
        setSelectedBoard(value);
        break;
      default:
        setError('Invalid custom field type');
        return;
    }
    
    setCustomOption('');
    setShowCustomInput(false);
    setCustomInputType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please log in to upload resources');
      return;
    }

    // Handle custom options validation
    if (selectedSubject === 'Add New' && !customOption.trim()) {
      setError('Please enter a custom subject or select from available options');
      return;
    }
    
    if (selectedChapter === 'Add New' && !customOption.trim()) {
      setError('Please enter a custom chapter or select from available options');
      return;
    }
    
    if (selectedBoard === 'Add New' && !customOption.trim()) {
      setError('Please enter a custom board or select from available options');
      return;
    }

    // Comprehensive validation
    if (!resourceType) {
      setError('Please select resource type (PDF or Lecture)');
      return;
    }

    if (!mainCategory) {
      setError('Please select main category');
      return;
    }

    if (!contentType) {
      setError('Please select content type');
      return;
    }

    // Category-specific validations
    if (mainCategory !== 'General' && mainCategory !== 'Cambridge' && mainCategory !== 'Competition Exam') {
      if (getProvinces().length > 0 && !province) {
        setError('Please select province');
        return;
      }
      if (!classLevel) {
        setError('Please select class/level');
        return;
      }
    } else if (mainCategory === 'Cambridge' || mainCategory === 'Competition Exam') {
      if (!classLevel) {
        setError('Please select class/level');
        return;
      }
    }

    // Content type specific validations
    if (needsBoard() && !selectedBoard) {
      setError(`Please select board for ${contentType}`);
      return;
    }

    if (needsSubject() && !selectedSubject) {
      setError(`Please select subject for ${contentType}`);
      return;
    }

    if (needsChapter() && !selectedChapter) {
      setError(`Please select chapter for ${contentType}`);
      return;
    }

    if ((contentType === 'PastPapers' || contentType === 'DateSheet' || contentType === 'Gazette') && !selectedYear) {
      setError(`Please select year for ${contentType}`);
      return;
    }

    if (contentType === 'Quiz' && (!quizQuestion.trim() && !quizImageUrl.trim() || !option1 || !option2 || !option3 || !option4 || !correctOption)) {
      setError('Please fill all Quiz details (Question, Options, Correct Answer)');
      return;
    }

    if (contentType === 'Test' && !testType) {
      setError('Please select test type for Test');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    // URL validations
    if (resourceType === 'PDF' && !driveUrl.trim()) {
      setError('Please provide Google Drive URL for PDF content');
      return;
    }

    if (resourceType === 'Lecture' && !youtubeUrl.trim()) {
      setError('Please provide YouTube URL for lecture content');
      return;
    }

    setError('');
    setUploadingFile(true);
    setFileUploadProgress(0);

    try {
      let imageUrl = '';
      
      // Upload image if provided (optional)
      if (uploadImage) {
        const imageRef = ref(storage, `resource_images/${currentUser.uid}/${Date.now()}_${uploadImage.name}`);
        const imageUploadTask = uploadBytesResumable(imageRef, uploadImage);
        
        await new Promise((resolve, reject) => {
          imageUploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 30; // 30% for image
              setFileUploadProgress(Math.round(progress));
            },
            (error) => reject(error),
            async () => {
              imageUrl = await getDownloadURL(imageUploadTask.snapshot.ref);
              setFileUploadProgress(30);
              resolve();
            }
          );
        });
      }

      // Generate collection name and create map-based document
      const collectionName = generateCollectionName();
      const documentData = createMapBasedDocument();
      
      // Update media information if image was uploaded
      if (imageUrl) {
        documentData.media.imageUrl = imageUrl;
        documentData.media.hasImage = true;
      }

      setFileUploadProgress(70);

      // Create document with map-based structure
      const docRef = doc(collection(db, collectionName));
      await setDoc(docRef, documentData);
      
      setFileUploadProgress(100);
      setUploadingFile(false);
      setSuccess('🎉 Resource uploaded successfully! Redirecting to your profile...');
      
      // Reset form
      resetForm();
      
      // Redirect to profile after 3 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
      
    } catch (error) {
      setError('Error uploading resource. Please try again.');
      setUploadingFile(false);
      console.error('Upload error:', error);
    }
  };

  const resetForm = () => {
    setResourceType('');
    setMainCategory('');
    setContentType('');
    setProvince('');
    setClassLevel('');
    setSelectedBoard('');
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedYear('');
    setFocusKeywords('');
    setCustomOption('');
    setShowCustomInput(false);
    setCustomInputType('');
    setQuestionType('');
    setTestType('');
    setQuizQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption('');
    setQuizImageUrl('');
    setDriveUrl('');
    setYoutubeUrl('');
    setTitle('');
    setTags('');
    setDescription('');
    setUploadImage(null);
    setCurrentStep(1);
    setError('');
    setSuccess('');
  };

  const nextStep = () => {
    // Step validation
    if (currentStep === 1 && !resourceType) {
      setError('Please select resource type (PDF or Lecture)');
      return;
    }
    if (currentStep === 2 && !mainCategory) {
      setError('Please select a main category');
      return;
    }
    if (currentStep === 3 && !contentType) {
      setError('Please select content type');
      return;
    }
    if (currentStep === 4 && getProvinces().length > 0 && !province) {
      setError('Please select a province');
      return;
    }
    if (currentStep === 5 && !classLevel) {
      setError('Please select a class/level');
      return;
    }
    
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
    setShowCustomInput(false);
    setCustomOption('');
    setCustomInputType('');
  };

  const getTotalSteps = () => {
    if (mainCategory === 'General') return 4;
    if (mainCategory === 'Cambridge') return 5;
    if (mainCategory === 'Competition Exam') return 5;
    if (getProvinces().length === 0) return 5;
    return 6;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md border border-gray-200 dark:border-gray-700">
          <AlertCircle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4">Login Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to upload and share your educational resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => router.push('/login')} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Upload Resource - TaleemSpot</title>
        <meta name="description" content="Upload educational resources to TaleemSpot with advanced categorization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        
        {/* Navigation Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </button>
                <div className="hidden sm:flex items-center space-x-3">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                    alt="TaleemSpot" 
                    className="h-8 w-8 rounded-full"
                  />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Upload Resource</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8">

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-700 dark:text-red-400">{error}</span>
                </div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-700 dark:text-green-400">{success}</span>
                </div>
                <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload New Resource</h2>
              <div className="text-sm text-gray-500">Step {currentStep} of {getTotalSteps()}</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Resource Type */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="h-6 w-6 mr-3 text-blue-600" />
                      Select Resource Type
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <button
                        type="button"
                        onClick={() => setResourceType('PDF')}
                        className={`p-8 rounded-xl border-2 transition-all duration-200 ${
                          resourceType === 'PDF'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                        }`}
                      >
                        <FileText className="h-16 w-16 mx-auto mb-4 text-red-500" />
                        <div className="text-xl font-bold">PDF Document</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Notes, Books, Papers, Documents
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setResourceType('Lecture')}
                        className={`p-8 rounded-xl border-2 transition-all duration-200 ${
                          resourceType === 'Lecture'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                        }`}
                      >
                        <Video className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                        <div className="text-xl font-bold">Lecture Video</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Video Lectures, Audio Content
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Main Category */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <GraduationCap className="h-6 w-6 mr-3 text-blue-600" />
                      Select Main Category
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {getMainCategories().map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setMainCategory(category)}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                            mainCategory === category
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">{category}</div>
                            {category === 'Cambridge' && (
                              <div className="text-xs text-gray-500 mt-1">O Level & A Level</div>
                            )}
                            {category === 'Competition Exam' && (
                              <div className="text-xs text-gray-500 mt-1">CSS, NTS, PPSC, etc.</div>
                            )}
                            {category === 'Entry Test' && (
                              <div className="text-xs text-gray-500 mt-1">MDCAT, ECAT, etc.</div>
                            )}
                            {category === 'University' && (
                              <div className="text-xs text-gray-500 mt-1">MBBS, BDS, VU, etc.</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Content Type (No Add New) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                      Select Content Type
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {getContentTypes().map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setContentType(type)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            contentType === type
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-bold text-sm">{type}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Province (if needed) - No Add New */}
                {currentStep === 4 && getProvinces().length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Select Province
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {getProvinces().map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setProvince(prov)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            province === prov
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-bold">{prov.replace(/([A-Z])/g, ' $1').trim()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Class/Level - No Add New */}
                {currentStep === 5 && (getProvinces().length === 0 ? true : province) && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Select Class/Level
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {getClasses().map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setClassLevel(cls)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            classLevel === cls
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 transform scale-105 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:transform hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-bold">{cls.replace(/([A-Z])/g, ' $1').trim()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Step: Details */}
                {currentStep === getTotalSteps() && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Resource Details
                    </h3>

                    {/* Board Selection (if needed) with Add New option */}
                    {needsBoard() && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Board *
                        </label>
                        <select
                          value={selectedBoard}
                          onChange={(e) => {
                            if (e.target.value === 'Add New') {
                              setShowCustomInput(true);
                              setCustomInputType('board');
                            } else {
                              setSelectedBoard(e.target.value);
                              setShowCustomInput(false);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Choose Board</option>
                          {getBoards().map((board) => (
                            <option key={board} value={board}>
                              {board === 'Add New' ? '+ Add New Board' : board}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom Input for Board */}
                        {showCustomInput && customInputType === 'board' && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                              Enter Custom Board:
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={customOption}
                                onChange={(e) => setCustomOption(e.target.value)}
                                className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Private Board, International Board"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddNew('board', customOption)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subject Selection (if needed) with Add New option */}
                    {needsSubject() && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Subject *
                        </label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => {
                            if (e.target.value === 'Add New') {
                              setShowCustomInput(true);
                              setCustomInputType('subject');
                            } else {
                              setSelectedSubject(e.target.value);
                              setShowCustomInput(false);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Choose Subject</option>
                          {getSubjects().map((subject) => (
                            <option key={subject} value={subject}>
                              {subject === 'Add New' ? '+ Add New Subject' : subject}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom Input for Subject */}
                        {showCustomInput && customInputType === 'subject' && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                              Enter Custom Subject:
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={customOption}
                                onChange={(e) => setCustomOption(e.target.value)}
                                className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Philosophy, Psychology, etc."
                              />
                              <button
                                type="button"
                                onClick={() => handleAddNew('subject', customOption)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chapter Selection (if needed) with Add New option */}
                    {needsChapter() && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Chapter *
                        </label>
                        <select
                          value={selectedChapter}
                          onChange={(e) => {
                            if (e.target.value === 'Add New') {
                              setShowCustomInput(true);
                              setCustomInputType('chapter');
                            } else {
                              setSelectedChapter(e.target.value);
                              setShowCustomInput(false);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Choose Chapter</option>
                          {getChapters().map((chapter) => (
                            <option key={chapter} value={chapter}>
                              {chapter === 'Add New' ? '+ Add New Chapter' : chapter}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom Input for Chapter */}
                        {showCustomInput && customInputType === 'chapter' && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                              Enter Custom Chapter:
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={customOption}
                                onChange={(e) => setCustomOption(e.target.value)}
                                className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Chapter 16: Advanced Topics"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddNew('chapter', customOption)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Year Selection for specific content types - No Add New */}
                    {(['PastPapers', 'DateSheet', 'Gazette'].includes(contentType)) && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Year *
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Choose Year</option>
                          {getYears().map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Test Type Selection */}
                    {contentType === 'Test' && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Test Type *
                        </label>
                        <select
                          value={testType}
                          onChange={(e) => setTestType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Choose Test Type</option>
                          {testTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quiz Specific Fields */}
                    {contentType === 'Quiz' && (
                      <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Quiz Details</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Type
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setQuestionType('Text')}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                questionType === 'Text'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              Type Here
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuestionType('Image')}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                questionType === 'Image'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              Upload Image / Paste URL
                            </button>
                          </div>
                        </div>

                        {questionType === 'Text' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Question *
                            </label>
                            <textarea
                              value={quizQuestion}
                              onChange={(e) => setQuizQuestion(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="3"
                              placeholder="Enter your quiz question..."
                              required
                            />
                          </div>
                        )}

                        {questionType === 'Image' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Question Image URL *
                            </label>
                            <input
                              type="url"
                              value={quizImageUrl}
                              onChange={(e) => setQuizImageUrl(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="https://example.com/question-image.jpg"
                              required
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Option 1 *
                            </label>
                            <input
                              type="text"
                              value={option1}
                              onChange={(e) => setOption1(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="First option"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Option 2 *
                            </label>
                            <input
                              type="text"
                              value={option2}
                              onChange={(e) => setOption2(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Second option"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Option 3 *
                            </label>
                            <input
                              type="text"
                              value={option3}
                              onChange={(e) => setOption3(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Third option"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Option 4 *
                            </label>
                            <input
                              type="text"
                              value={option4}
                              onChange={(e) => setOption4(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Fourth option"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Correct Option *
                          </label>
                          <select
                            value={correctOption}
                            onChange={(e) => setCorrectOption(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Select Correct Option</option>
                            <option value="1">Option 1</option>
                            <option value="2">Option 2</option>
                            <option value="3">Option 3</option>
                            <option value="4">Option 4</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* URLs */}
                    <div className="space-y-4">
                      {resourceType === 'PDF' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Link className="inline h-4 w-4 mr-2" />
                            Google Drive URL *
                          </label>
                          <input
                            type="url"
                            value={driveUrl}
                            onChange={(e) => setDriveUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://drive.google.com/file/d/..."
                            required
                          />
                        </div>
                      )}

                      {resourceType === 'Lecture' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Youtube className="inline h-4 w-4 mr-2" />
                            YouTube URL *
                          </label>
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://youtube.com/watch?v=..."
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Title, Tags, Description */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter resource title"
                          required
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Tags className="inline h-4 w-4 mr-2" />
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="mathematics, algebra, solved, 2024"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">{tags.length}/200 characters</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="4"
                          placeholder="Describe your resource..."
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                      </div>

                      {/* Focus Keywords - Optional */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Focus Keywords (Optional)
                        </label>
                        <input
                          type="text"
                          value={focusKeywords}
                          onChange={(e) => setFocusKeywords(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="key topics, important concepts"
                          maxLength={150}
                        />
                        <p className="text-xs text-gray-500 mt-1">{focusKeywords.length}/150 characters</p>
                      </div>
                    </div>

                    {/* Image Upload - Optional (Not allowed for Test Papers) */}
                    {contentType !== 'Test' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <ImageIcon className="inline h-4 w-4 mr-2" />
                          Upload Image (Optional - Max 1MB)
                        </label>
                        {!uploadImage ? (
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Click to upload image</p>
                              <p className="text-sm text-gray-500">Optional • Max 1MB • PNG, JPG, JPEG</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <img
                              src={URL.createObjectURL(uploadImage)}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{uploadImage.name}</p>
                              <p className="text-sm text-gray-500">{(uploadImage.size / 1024).toFixed(1)} KB</p>
                              <p className="text-xs text-green-600">✓ Image selected successfully</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setUploadImage(null)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadingFile && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
                        Uploading: {fileUploadProgress}%
                      </span>
                      <span className="text-lg text-blue-600 dark:text-blue-400">
                        {title || 'Untitled Resource'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${fileUploadProgress}%` }}
                      >
                        {fileUploadProgress > 10 && (
                          <span className="text-xs text-white font-medium">{fileUploadProgress}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                      <span>Please don't close this page while uploading...</span>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || uploadingFile}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={uploadingFile}
                      className="px-6 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset All
                    </button>
                    
                    {currentStep < getTotalSteps() ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
                      >
                        Next
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={uploadingFile}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center"
                      >
                        {uploadingFile ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-5 w-5 mr-2" />
                            Upload Resource
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Selection Summary with Map Structure Preview */}
          {(resourceType || mainCategory || contentType || province || classLevel) && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Your Selection Summary:
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {resourceType && (
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                    📄 {resourceType}
                  </span>
                )}
                {mainCategory && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                    🎓 {mainCategory}
                  </span>
                )}
                {contentType && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                    📚 {contentType}
                  </span>
                )}
                {province && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                    🗺️ {province.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )}
                {classLevel && (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
                    📖 {classLevel.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )}
                {selectedSubject && selectedSubject !== 'Add New' && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
                    📘 {selectedSubject}
                  </span>
                )}
                {selectedChapter && selectedChapter !== 'Add New' && (
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300 rounded-full text-sm font-medium">
                    📑 {selectedChapter}
                  </span>
                )}
                {testType && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                    📝 {testType}
                  </span>
                )}
              </div>
              
            
            </div>
          )}

          {/* Enhanced Tips Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Upload Guidelines & Restricted Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Map-based Storage:</strong> Data organized in nested maps for scalability</span>
              </div>
              <div className="flex items-start space-x-2">
                <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                <span><strong>Collection Restriction:</strong> Users cannot add custom collections</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Add New Limited:</strong> Only subjects, chapters, and boards</span>
              </div>
              <div className="flex items-start space-x-2">
                <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                <span><strong>Fixed Categories:</strong> Content types, provinces, classes are fixed</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Updated Categories:</strong> CSS, NTS, PPSC, etc. for competitions</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Entry Tests:</strong> PMA, MDCAT, ECAT, NUMS, AMC supported</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>University:</strong> BDS, MBBS, VU, Allama Iqbal covered</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Cambridge:</strong> Dedicated section for O & A Levels</span>
              </div>
            </div>
          </div>

          {/* Category Information Panel */}
          {mainCategory && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                {mainCategory} Category Information:
              </h4>
              
              {mainCategory === 'Competition Exam' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Available Exams:</strong> CSS, NTS, AJKPSC, KPSC, BPSC, SPSC, FPSC, PPSC, PMS
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {['CSS', 'NTS', 'AJKPSC', 'KPSC', 'BPSC', 'SPSC', 'FPSC', 'PPSC', 'PMS'].map(exam => (
                      <span key={exam} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-center text-xs font-medium">
                        {exam}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">* No province selection required for competition exams</p>
                </div>
              )}
              
              {mainCategory === 'Entry Test' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Available Tests:</strong> PMA, University Entry Test, MDCAT, ECAT, NUMS, AMC
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['PMA', 'UniversityEntryTest', 'MDCAT', 'ECAT', 'NUMS', 'AMC'].map(test => (
                      <span key={test} className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-center text-xs font-medium">
                        {test.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">* MDCAT and University Entry Test require province selection</p>
                </div>
              )}
              
              {mainCategory === 'University' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Available Universities:</strong> BDS, MBBS, Allama Iqbal Open University, Virtual University
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['BDS', 'MBBS', 'AllamaIqbalOpenUniversity', 'VirtualUniversity'].map(uni => (
                      <span key={uni} className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-center text-xs font-medium">
                        {uni.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">* VU and AIOU do not require province selection</p>
                </div>
              )}
            </div>
          )}

          {/* Restriction Information */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Custom Addition Policy:
            </h4>
            <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
              <p><strong>✅ Allowed:</strong> Custom Subjects, Chapters, and Boards only</p>
              <p><strong>❌ Restricted:</strong> Content Types, Provinces, Classes, Years are fixed</p>
              <p><strong>🔒 Security:</strong> Prevents unauthorized collection creation</p>
              <p><strong>📊 Consistency:</strong> Maintains data structure integrity</p>
              <p><strong>⚡ Performance:</strong> Optimized for predefined collections only</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Upload;