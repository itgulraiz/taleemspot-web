'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  Edit2, 
  Share2, 
  LogOut, 
  Grid, 
  List,
  User,
  GraduationCap,
  MapPin,
  FileText,
  File,
  Video,
  Clock,
  Eye,
  Download,
  Star,
  Users,
  Calendar,
  Award,
  Activity,
  Camera,
  X,
  ExternalLink,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ArrowLeft,
  Home,
  Upload,
  Youtube,
  Link,
  RefreshCw,
  Trash2,
  Edit3,
  MoreVertical,
  Save,
  AlertTriangle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  BookOpen,
  Globe,
  School
} from 'lucide-react';

const Profile = () => {
  const router = useRouter();
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  
  // Updated current data as provided
  const currentDateTime = '2025-07-11 04:23:02';
  const currentUserLogin = 'itgulraiz';
  
  // Show badge for everyone now - rules will be set later
  const showBadge = true;
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileViewMode, setFileViewMode] = useState('grid');
  
  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  
  // File editing and deleting states
  const [editingFile, setEditingFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    role: '',
    province: '',
    education: ''
  });

  // File states
  const [userFiles, setUserFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Enhanced stats with demo data
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalViews: Math.floor(Math.random() * 5000) + 1000,
    totalDownloads: Math.floor(Math.random() * 2000) + 500,
    followers: 127,
    following: 43,
    rating: (4 + Math.random()).toFixed(1),
    rank: Math.floor(Math.random() * 100) + 1,
    streakDays: Math.floor(Math.random() * 30) + 5
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        role: userProfile.role || '',
        province: userProfile.province || '',
        education: userProfile.education || ''
      });
      
      fetchUserFiles();
    }
  }, [currentUser, userProfile, router]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleBioChange = (e) => {
    setFormData({
      ...formData,
      bio: e.target.value
    });
  };
  
  const handleBioSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await updateUserProfile({ bio: formData.bio });
      setSuccess('Bio updated successfully');
      setEditingBio(false);
    } catch (error) {
      setError('Failed to update bio');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing && userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        role: userProfile.role || '',
        province: userProfile.province || '',
        education: userProfile.education || ''
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    setError('');

    try {
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          setError('Error uploading image');
          setUploadingImage(false);
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateUserProfile({ photoURL: downloadURL });
          setUploadingImage(false);
          setSuccess('Profile image updated');
        }
      );
    } catch (error) {
      setError('Error uploading image');
      setUploadingImage(false);
    }
  };

  // Handle file editing
  const handleEditFile = (file) => {
    setEditingFile(file.id);
    setEditFormData({
      title: file.title || '',
      description: file.description || '',
      tags: Array.isArray(file.tags) ? file.tags.join(', ') : (file.tags || ''),
      subject: file.subject || '',
      chapter: file.chapter || '',
      board: file.board || '',
      year: file.year || ''
    });
    setActionMenuOpen(null);
  };

  const handleSaveEdit = async (file) => {
    setLoading(true);
    try {
      const docRef = doc(db, file.collectionName, file.id);
      
      // Process tags safely
      const processedTags = typeof editFormData.tags === 'string' 
        ? editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      // Update the document with map structure
      const updateData = {
        'content.title': editFormData.title || 'Untitled',
        'content.description': editFormData.description || '',
        'content.tags': processedTags,
        'academicInfo.subject': editFormData.subject || '',
        'academicInfo.chapter': editFormData.chapter || '',
        'academicInfo.board': editFormData.board || '',
        'academicInfo.year': editFormData.year || '',
        'metadata.updatedAt': new Date()
      };

      await updateDoc(docRef, updateData);
      
      setSuccess('Resource updated successfully!');
      setEditingFile(null);
      fetchUserFiles(); // Refresh the data
    } catch (error) {
      console.error('Error updating file:', error);
      setError('Failed to update resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditFormData({});
  };

  // Handle file deletion
  const handleDeleteFile = (file) => {
    setDeletingFile(file);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const confirmDeleteFile = async () => {
    if (!deletingFile) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, deletingFile.collectionName, deletingFile.id);
      await deleteDoc(docRef);
      
      setSuccess('Resource deleted successfully!');
      setShowDeleteModal(false);
      setDeletingFile(null);
      fetchUserFiles(); // Refresh the data
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteFile = () => {
    setShowDeleteModal(false);
    setDeletingFile(null);
  };

  // Helper function to safely process tags
  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      } catch {
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    return [];
  };

  // Collection names to search through based on selection.txt
  const getCollectionNames = () => {
    return [
      // School collections - Punjab
      'Punjab9thNotes', 'Punjab9thTextBooks', 'Punjab9thPastPapers', 'Punjab9thLectures', 'Punjab9thQuiz', 
      'Punjab9thTest', 'Punjab9thSyllabus', 'Punjab9thGuessPapers', 'Punjab9thDateSheet', 'Punjab9thResult', 
      'Punjab9thRollNoSlip', 'Punjab9thGazette', 'Punjab9thPairingScheme',
      'Punjab10thNotes', 'Punjab10thTextBooks', 'Punjab10thPastPapers', 'Punjab10thLectures', 'Punjab10thQuiz', 
      'Punjab10thTest', 'Punjab10thSyllabus', 'Punjab10thGuessPapers', 'Punjab10thDateSheet', 'Punjab10thResult', 
      'Punjab10thRollNoSlip', 'Punjab10thGazette', 'Punjab10thPairingScheme',
      
      // College collections - Punjab
      'Punjab11thNotes', 'Punjab11thTextBooks', 'Punjab11thPastPapers', 'Punjab11thLectures', 'Punjab11thQuiz', 
      'Punjab11thTest', 'Punjab11thSyllabus', 'Punjab11thGuessPapers', 'Punjab11thDateSheet', 'Punjab11thResult', 
      'Punjab11thRollNoSlip', 'Punjab11thGazette', 'Punjab11thPairingScheme',
      'Punjab12thNotes', 'Punjab12thTextBooks', 'Punjab12thPastPapers', 'Punjab12thLectures', 'Punjab12thQuiz', 
      'Punjab12thTest', 'Punjab12thSyllabus', 'Punjab12thGuessPapers', 'Punjab12thDateSheet', 'Punjab12thResult', 
      'Punjab12thRollNoSlip', 'Punjab12thGazette', 'Punjab12thPairingScheme',
      
      // Sindh collections
      'Sindh9thNotes', 'Sindh9thTextBooks', 'Sindh9thPastPapers', 'Sindh9thLectures', 'Sindh9thQuiz', 
      'Sindh9thTest', 'Sindh9thSyllabus', 'Sindh9thGuessPapers', 'Sindh9thDateSheet', 'Sindh9thResult', 
      'Sindh9thRollNoSlip', 'Sindh9thGazette', 'Sindh9thPairingScheme',
      'Sindh10thNotes', 'Sindh10thTextBooks', 'Sindh10thPastPapers', 'Sindh10thLectures', 'Sindh10thQuiz', 
      'Sindh10thTest', 'Sindh10thSyllabus', 'Sindh10thGuessPapers', 'Sindh10thDateSheet', 'Sindh10thResult', 
      'Sindh10thRollNoSlip', 'Sindh10thGazette', 'Sindh10thPairingScheme',
      'Sindh11thNotes', 'Sindh11thTextBooks', 'Sindh11thPastPapers', 'Sindh11thLectures', 'Sindh11thQuiz', 
      'Sindh11thTest', 'Sindh11thSyllabus', 'Sindh11thGuessPapers', 'Sindh11thDateSheet', 'Sindh11thResult', 
      'Sindh11thRollNoSlip', 'Sindh11thGazette', 'Sindh11thPairingScheme',
      'Sindh12thNotes', 'Sindh12thTextBooks', 'Sindh12thPastPapers', 'Sindh12thLectures', 'Sindh12thQuiz', 
      'Sindh12thTest', 'Sindh12thSyllabus', 'Sindh12thGuessPapers', 'Sindh12thDateSheet', 'Sindh12thResult', 
      'Sindh12thRollNoSlip', 'Sindh12thGazette', 'Sindh12thPairingScheme',
      
      // KhyberPakhtunkhwa collections
      'KhyberPakhtunkhwa9thNotes', 'KhyberPakhtunkhwa9thTextBooks', 'KhyberPakhtunkhwa9thPastPapers', 
      'KhyberPakhtunkhwa9thLectures', 'KhyberPakhtunkhwa9thQuiz', 'KhyberPakhtunkhwa9thTest', 
      'KhyberPakhtunkhwa9thSyllabus', 'KhyberPakhtunkhwa9thGuessPapers', 'KhyberPakhtunkhwa9thDateSheet', 
      'KhyberPakhtunkhwa9thResult', 'KhyberPakhtunkhwa9thRollNoSlip', 'KhyberPakhtunkhwa9thGazette', 
      'KhyberPakhtunkhwa9thPairingScheme',
      'KhyberPakhtunkhwa10thNotes', 'KhyberPakhtunkhwa10thTextBooks', 'KhyberPakhtunkhwa10thPastPapers', 
      'KhyberPakhtunkhwa10thLectures', 'KhyberPakhtunkhwa10thQuiz', 'KhyberPakhtunkhwa10thTest', 
      'KhyberPakhtunkhwa10thSyllabus', 'KhyberPakhtunkhwa10thGuessPapers', 'KhyberPakhtunkhwa10thDateSheet', 
      'KhyberPakhtunkhwa10thResult', 'KhyberPakhtunkhwa10thRollNoSlip', 'KhyberPakhtunkhwa10thGazette', 
      'KhyberPakhtunkhwa10thPairingScheme',
      'KhyberPakhtunkhwa11thNotes', 'KhyberPakhtunkhwa11thTextBooks', 'KhyberPakhtunkhwa11thPastPapers', 
      'KhyberPakhtunkhwa11thLectures', 'KhyberPakhtunkhwa11thQuiz', 'KhyberPakhtunkhwa11thTest', 
      'KhyberPakhtunkhwa11thSyllabus', 'KhyberPakhtunkhwa11thGuessPapers', 'KhyberPakhtunkhwa11thDateSheet', 
      'KhyberPakhtunkhwa11thResult', 'KhyberPakhtunkhwa11thRollNoSlip', 'KhyberPakhtunkhwa11thGazette', 
      'KhyberPakhtunkhwa11thPairingScheme',
      'KhyberPakhtunkhwa12thNotes', 'KhyberPakhtunkhwa12thTextBooks', 'KhyberPakhtunkhwa12thPastPapers', 
      'KhyberPakhtunkhwa12thLectures', 'KhyberPakhtunkhwa12thQuiz', 'KhyberPakhtunkhwa12thTest', 
      'KhyberPakhtunkhwa12thSyllabus', 'KhyberPakhtunkhwa12thGuessPapers', 'KhyberPakhtunkhwa12thDateSheet', 
      'KhyberPakhtunkhwa12thResult', 'KhyberPakhtunkhwa12thRollNoSlip', 'KhyberPakhtunkhwa12thGazette', 
      'KhyberPakhtunkhwa12thPairingScheme',
      
      // Add more provinces collections...
      'Balochistan9thNotes', 'Balochistan9thTextBooks', 'Balochistan9thPastPapers', 'Balochistan9thLectures', 
      'Balochistan9thQuiz', 'Balochistan9thTest', 'Balochistan9thSyllabus', 'Balochistan9thGuessPapers', 
      'Balochistan9thDateSheet', 'Balochistan9thResult', 'Balochistan9thRollNoSlip', 'Balochistan9thGazette', 
      'Balochistan9thPairingScheme',
      'Balochistan10thNotes', 'Balochistan10thTextBooks', 'Balochistan10thPastPapers', 'Balochistan10thLectures', 
      'Balochistan10thQuiz', 'Balochistan10thTest', 'Balochistan10thSyllabus', 'Balochistan10thGuessPapers', 
      'Balochistan10thDateSheet', 'Balochistan10thResult', 'Balochistan10thRollNoSlip', 'Balochistan10thGazette', 
      'Balochistan10thPairingScheme',
      'Balochistan11thNotes', 'Balochistan11thTextBooks', 'Balochistan11thPastPapers', 'Balochistan11thLectures', 
      'Balochistan11thQuiz', 'Balochistan11thTest', 'Balochistan11thSyllabus', 'Balochistan11thGuessPapers', 
      'Balochistan11thDateSheet', 'Balochistan11thResult', 'Balochistan11thRollNoSlip', 'Balochistan11thGazette', 
      'Balochistan11thPairingScheme',
      'Balochistan12thNotes', 'Balochistan12thTextBooks', 'Balochistan12thPastPapers', 'Balochistan12thLectures', 
      'Balochistan12thQuiz', 'Balochistan12thTest', 'Balochistan12thSyllabus', 'Balochistan12thGuessPapers', 
      'Balochistan12thDateSheet', 'Balochistan12thResult', 'Balochistan12thRollNoSlip', 'Balochistan12thGazette', 
      'Balochistan12thPairingScheme',
      
      // Cambridge collections
      'OLevelNotes', 'OLevelTextBooks', 'OLevelPastPapers', 'OLevelLectures', 'OLevelQuiz', 'OLevelTest', 'OLevelSyllabus',
      'ALevelNotes', 'ALevelTextBooks', 'ALevelPastPapers', 'ALevelLectures', 'ALevelQuiz', 'ALevelTest', 'ALevelSyllabus',
      
      // Competition Exam collections
      'CSSNotes', 'CSSTextBooks', 'CSSPastPapers', 'CSSQuiz', 'CSSTest', 'CSSSyllabus', 'CSSResult',
      'NTSNotes', 'NTSTextBooks', 'NTSPastPapers', 'NTSQuiz', 'NTSTest', 'NTSSyllabus', 'NTSResult',
      'PPSCNotes', 'PPSCTextBooks', 'PPSCPastPapers', 'PPSCQuiz', 'PPSCTest', 'PPSCSyllabus', 'PPSCResult',
      'FPSCNotes', 'FPSCTextBooks', 'FPSCPastPapers', 'FPSCQuiz', 'FPSCTest', 'FPSCSyllabus', 'FPSCResult',
      'KPSCNotes', 'KPSCTextBooks', 'KPSCPastPapers', 'KPSCQuiz', 'KPSCTest', 'KPSCSyllabus', 'KPSCResult',
      'BPSCNotes', 'BPSCTextBooks', 'BPSCPastPapers', 'BPSCQuiz', 'BPSCTest', 'BPSCSyllabus', 'BPSCResult',
      'SPSCNotes', 'SPSCTextBooks', 'SPSCPastPapers', 'SPSCQuiz', 'SPSCTest', 'SPSCSyllabus', 'SPSCResult',
      'AJKPSCNotes', 'AJKPSCTextBooks', 'AJKPSCPastPapers', 'AJKPSCQuiz', 'AJKPSCTest', 'AJKPSCSyllabus', 'AJKPSCResult',
      'PMSNotes', 'PMSTextBooks', 'PMSPastPapers', 'PMSQuiz', 'PMSTest', 'PMSSyllabus', 'PMSResult',
      
      // Entry Test collections
      'PMANotes', 'PMATextBooks', 'PMAPastPapers', 'PMAQuiz', 'PMATest', 'PMASyllabus', 'PMAResult', 'PMARollNoSlip',
      'ECATNotes', 'ECATTextBooks', 'ECATPastPapers', 'ECATQuiz', 'ECATTest', 'ECATSyllabus', 'ECATResult', 'ECATRollNoSlip',
      'NUMSNotes', 'NUMSTextBooks', 'NUMSPastPapers', 'NUMSQuiz', 'NUMSTest', 'NUMSSyllabus', 'NUMSResult', 'NUMSRollNoSlip',
      'AMCNotes', 'AMCTextBooks', 'AMCPastPapers', 'AMCQuiz', 'AMCTest', 'AMCSyllabus', 'AMCResult', 'AMCRollNoSlip',
      
      // University collections
      'MBBSNotes', 'MBBSTextBooks', 'MBBSPastPapers', 'MBBSLectures', 'MBBSQuiz', 'MBBSTest', 'MBBSSyllabus', 'MBBSGuessPapers',
      'BDSNotes', 'BDSTextBooks', 'BDSPastPapers', 'BDSQuiz', 'BDSTest', 'BDSSyllabus', 'BDSGuessPapers',
      'VirtualUniversityNotes', 'VirtualUniversityTextBooks', 'VirtualUniversityPastPapers', 'VirtualUniversityLectures', 
      'VirtualUniversityQuiz', 'VirtualUniversityTest', 'VirtualUniversitySyllabus', 'VirtualUniversityGuessPapers', 'VirtualUniversityRollNoSlip',
      'AllamaIqbalOpenUniversityNotes', 'AllamaIqbalOpenUniversityTextBooks', 'AllamaIqbalOpenUniversityPastPapers', 
      'AllamaIqbalOpenUniversityLectures', 'AllamaIqbalOpenUniversityQuiz', 'AllamaIqbalOpenUniversityTest', 
      'AllamaIqbalOpenUniversitySyllabus',
      
      // General collections
      'Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 
      'DateSheet', 'Gazette', 'PairingScheme', 'UrduCalligraphy', 'EnglishCalligraphy', 'EnglishLanguage'
    ];
  };

  const fetchUserFiles = async () => {
    if (!currentUser) return;
    
    setLoadingFiles(true);
    console.log('Fetching files for user:', currentUser.uid);
    
    try {
      const allFiles = [];
      const collectionNames = getCollectionNames();

      // Use Promise.all for faster parallel fetching
      const searchPromises = collectionNames.map(async (collectionName) => {
        try {
          const queries = [
            query(collection(db, collectionName), where('userInfo.userId', '==', currentUser.uid)),
            query(collection(db, collectionName), where('userId', '==', currentUser.uid))
          ];

          for (const q of queries) {
            try {
              const querySnapshot = await getDocs(q);
              
              querySnapshot.forEach(doc => {
                const fileData = doc.data();
                
                allFiles.push({
                  id: doc.id,
                  collectionName,
                  ...fileData,
                  // Extract data from the map structure with fallbacks and safe tag processing
                  title: fileData.content?.title || fileData.title || 'Untitled',
                  description: fileData.content?.description || fileData.description || '',
                  tags: processTags(fileData.content?.tags || fileData.tags),
                  fileUrl: fileData.content?.fileUrl || fileData.content?.driveUrl || fileData.content?.youtubeUrl || fileData.fileUrl || '',
                  resourceType: fileData.metadata?.resourceType || fileData.resourceType || 'PDF',
                  mainCategory: fileData.metadata?.mainCategory || fileData.mainCategory || 'General',
                  contentType: fileData.metadata?.contentType || fileData.contentType || 'Notes',
                  subject: fileData.academicInfo?.subject || fileData.subject || 'General',
                  chapter: fileData.academicInfo?.chapter || fileData.chapter || '',
                  board: fileData.academicInfo?.board || fileData.board || '',
                  year: fileData.academicInfo?.year || fileData.year || '',
                  views: fileData.analytics?.views || fileData.views || Math.floor(Math.random() * 500) + 50,
                  downloads: fileData.analytics?.downloads || fileData.downloads || Math.floor(Math.random() * 200) + 10,
                  rating: fileData.analytics?.rating || fileData.rating || (4 + Math.random()).toFixed(1),
                  createdAt: fileData.metadata?.createdAt || fileData.createdAt,
                  authorName: fileData.userInfo?.authorName || fileData.authorName || userProfile?.fullName || 'Unknown',
                  imageUrl: fileData.media?.imageUrl || fileData.imageUrl || '',
                  hasImage: fileData.media?.hasImage || fileData.hasImage || false
                });
              });
            } catch (queryError) {
              // Skip individual query errors
            }
          }
        } catch (error) {
          // Skip collections that don't exist
        }
      });

      await Promise.all(searchPromises);
      
      // Sort files based on selected criteria
      allFiles.sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        switch (sortBy) {
          case 'views':
            return ((b.views || 0) - (a.views || 0)) * multiplier;
          case 'downloads':
            return ((b.downloads || 0) - (a.downloads || 0)) * multiplier;
          case 'rating':
            return (parseFloat(b.rating || 0) - parseFloat(a.rating || 0)) * multiplier;
          case 'title':
            return (b.title || '').localeCompare(a.title || '') * multiplier;
          case 'oldest':
            return ((a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)) * multiplier;
          case 'newest':
          default:
            return ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) * multiplier;
        }
      });
      
      setUserFiles(allFiles);
      
      // Calculate real stats from actual data
      const totalViews = allFiles.reduce((sum, file) => sum + (file.views || 0), 0);
      const totalDownloads = allFiles.reduce((sum, file) => sum + (file.downloads || 0), 0);
      const averageRating = allFiles.length > 0 
        ? (allFiles.reduce((sum, file) => sum + parseFloat(file.rating || 0), 0) / allFiles.length).toFixed(1)
        : '0.0';
      
      setStats(prevStats => ({
        ...prevStats,
        totalUploads: allFiles.length,
        totalViews: totalViews || prevStats.totalViews,
        totalDownloads: totalDownloads || prevStats.totalDownloads,
        rating: averageRating !== '0.0' ? averageRating : prevStats.rating
      }));
      
    } catch (error) {
      console.error('Error fetching user files:', error);
      setError('Failed to load your resources. Please try again.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'N/A';
    }
  };
  
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'Lecture':
        return <Video className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getResourceTypeIcon = (resourceType) => {
    switch (resourceType) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'Lecture':
        return <Youtube className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrlIcon = (fileUrl) => {
    if (fileUrl?.includes('youtube.com') || fileUrl?.includes('youtu.be')) {
      return <Youtube className="h-3 w-3 mr-1" />;
    } else if (fileUrl?.includes('drive.google.com')) {
      return <Link className="h-3 w-3 mr-1" />;
    }
    return <ExternalLink className="h-3 w-3 mr-1" />;
  };

  // Enhanced filtering function
  const filterFiles = () => {
    let filtered = userFiles;

    // Filter by resource type
    if (selectedFileType !== 'All') {
      filtered = filtered.filter(file => file.resourceType === selectedFileType);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(file => file.mainCategory === selectedCategory);
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(file => file.subject === selectedSubject);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        (file.title || '').toLowerCase().includes(term) ||
        (file.description || '').toLowerCase().includes(term) ||
        (file.subject || '').toLowerCase().includes(term) ||
        (file.contentType || '').toLowerCase().includes(term) ||
        (file.tags || []).some(tag => (tag || '').toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Get unique values for filters
  const getUniqueCategories = () => {
    const categories = [...new Set(userFiles.map(file => file.mainCategory).filter(cat => cat))];
    return ['All', ...categories];
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(userFiles.map(file => file.subject).filter(sub => sub && sub !== 'General'))];
    return ['All', ...subjects];
  };

  // Fixed Blue-filled Verification Badge Component
  const VerificationBadge = ({ className }) => (
    <div className="relative group">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="20px" 
        viewBox="0 -960 960 960" 
        width="20px" 
        className={`${className} cursor-help transform hover:scale-110 transition-transform duration-200`}
      >
        <path 
          d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Z" 
          fill="#3B82F6"
          stroke="#1E40AF"
          strokeWidth="2"
        />
        <path 
          d="m438-338 226-226-56-58-170 170-86-84-56 56 142 142Z" 
          fill="white"
        />
      </svg>
      
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <div className="bg-blue-600 text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap shadow-lg border border-blue-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Verified Account</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced File Card with Edit/Delete Options and Safe Tag Rendering
  const EnhancedFileCard = ({ file, isListView = false }) => {
    const safeTags = processTags(file.tags);
    
    return (
      <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isListView ? 'flex items-center p-4' : 'p-6'
      }`}>
        
        <div className={`${isListView ? 'flex items-center space-x-4 w-full' : ''} relative`}>
          {/* Action Menu */}
          <div className="absolute top-2 right-2 z-10">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuOpen(actionMenuOpen === file.id ? null : file.id);
                }}
                className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              {actionMenuOpen === file.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20">
                  <button
                    onClick={() => handleEditFile(file)}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-3 text-blue-500" />
                    Edit Resource
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete Resource
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* File Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              {file.hasImage && file.imageUrl ? (
                <div className="relative">
                  <img 
                    src={file.imageUrl} 
                    alt={file.title}
                    className={`${isListView ? 'w-16 h-16' : 'w-20 h-20'} object-cover rounded-lg border border-gray-200 dark:border-gray-600`}
                  />
                  <div className="absolute top-1 right-1">
                    {getResourceTypeIcon(file.resourceType)}
                  </div>
                </div>
              ) : (
                getFileTypeIcon(file.resourceType)
              )}
            </div>
          </div>

          {/* File Info */}
          <div className={`${isListView ? 'flex-1' : 'mt-4'}`}>
            {editingFile === file.id ? (
              // Edit Form
              <div className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  rows="2"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="subject"
                    value={editFormData.subject || ''}
                    onChange={handleEditFormChange}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Subject"
                  />
                  <input
                    type="text"
                    name="chapter"
                    value={editFormData.chapter || ''}
                    onChange={handleEditFormChange}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Chapter"
                  />
                </div>
                <input
                  type="text"
                  name="tags"
                  value={editFormData.tags || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Tags (comma separated)"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(file)}
                    disabled={loading}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <>
                <h4 className={`font-bold text-gray-900 dark:text-white ${isListView ? 'text-lg' : 'text-base'} line-clamp-2 pr-8`}>
                  {file.title || 'Untitled Document'}
                </h4>
                
                {/* File Details */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                      {file.contentType}
                    </span>
                    {file.subject && file.subject !== 'General' && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                        {file.subject}
                      </span>
                    )}
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                      {file.resourceType}
                    </span>
                  </div>
                  {file.chapter && (
                    <div className="text-gray-600 dark:text-gray-400">
                      📖 {file.chapter}
                    </div>
                  )}
                  {file.board && (
                    <div className="text-gray-600 dark:text-gray-400">
                      🏫 Board: {file.board}
                    </div>
                  )}
                  {file.year && (
                    <div className="text-gray-600 dark:text-gray-400">
                      📅 Year: {file.year}
                    </div>
                  )}
                </div>
                
                {file.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                    {file.description}
                  </p>
                )}

                {/* File Stats */}
                <div className={`flex ${isListView ? 'flex-row space-x-6 mt-3' : 'flex-col space-y-1 mt-3'} text-xs text-gray-500 dark:text-gray-400`}>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{file.views || 0} views</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    <span>{file.downloads || 0} downloads</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>

                {/* File Actions */}
                <div className={`${isListView ? 'flex items-center justify-between mt-3' : 'mt-4'}`}>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < Math.floor(file.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{file.rating}</span>
                  </div>

                  {isListView && (
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs truncate max-w-20">
                        {file.collectionName}
                      </span>
                      {file.fileUrl && (
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                        >
                          {getUrlIcon(file.fileUrl)}
                          View
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Grid View Actions */}
                {!isListView && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {file.mainCategory || 'General'}
                    </span>
                    {file.fileUrl && (
                      <a 
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                      >
                        {getUrlIcon(file.fileUrl)}
                        View
                      </a>
                    )}
                  </div>
                )}

                {/* Tags - Safe Rendering */}
                {safeTags && safeTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {safeTags.slice(0, 3).map((tag, index) => (
                      <span key={`tag-${index}-${tag}`} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {safeTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        +{safeTags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteModal = () => (
    showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Delete Resource
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Are you sure you want to delete "{deletingFile?.title}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={cancelDeleteFile}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFile}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Loading Profile</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we load your profile...</p>
        </div>
      </div>
    );
  }

  const provinces = [
    'Balochistan',
    'Khyber Pakhtunkhwa',
    'Punjab',
    'Sindh',
    'Azad Jammu and Kashmir',
    'Federal',
    'Gilgit-Baltistan'
  ];

  const educationLevels = [
    'O Level',
    'Matric (9th)',
    'Matric (10th)',
    'A Level',
    'Inter (11th)',
    'Inter (12th)',
    'Entry Test (MDCAT)',
    'Entry Test (ECAT)',
    'Entry Test (NUMS)',
    'Entry Test (AMC)',
    'Entry Test (PMA)',
    'University Entry Test',
    'Virtual University',
    'Allama Iqbal Open University',
    'MBBS',
    'BDS',
    'Other University',
    'Competition Exam (PPSC)',
    'Competition Exam (FPSC)',
    'Competition Exam (KPSC)',
    'Competition Exam (BPSC)',
    'Competition Exam (NTS)',
    'Competition Exam (SPSC)',
    'Competition Exam (CSS)',
    'Competition Exam (AJKPSC)',
    'Competition Exam (PMS)'
  ];
  
  const filteredFiles = filterFiles();

  return (
    <>
      <Head>
        <title>My Profile - TaleemSpot | {userProfile.fullName || 'User Profile'}</title>
        <meta name="description" content={`${userProfile.fullName || 'User'}'s profile on TaleemSpot. Manage your educational resources and account settings.`} />
        <meta name="keywords" content="profile, TaleemSpot, educational resources, user dashboard, manage resources" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={`${userProfile.fullName}'s Profile - TaleemSpot`} />
        <meta property="og:description" content={`View and manage ${userProfile.fullName}'s educational resources on TaleemSpot`} />
        <meta property="og:type" content="profile" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        
        {/* Enhanced Navigation Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                  aria-label="Go to home"
                >
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </button>
                <div className="hidden sm:flex items-center space-x-3">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9" 
                    alt="TaleemSpot" 
                    className="h-8 w-8 rounded-full"
                  />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                </div>
              </div>
              
              {/* Enhanced Navigation with Upload Button */}
              <div className="flex items-center space-x-4">
                {/* Upload Button */}
                <button
                  onClick={() => router.push('/upload')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  aria-label="Upload new resource"
                >
                  <Upload className="h-5 w-5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Clock className="h-3 w-3" />
                  <span>UTC: {currentDateTime}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <button
                                    onClick={handleLogout}
                  className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-green-700 dark:text-green-400">{success}</span>
              </div>
            </div>
          )}

          {/* Enhanced Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
            {/* Cover Background */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Profile Picture */}
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="relative">
                  {userProfile.photoURL || (currentUser && currentUser.photoURL) ? (
                    <img
                      src={userProfile.photoURL || currentUser.photoURL}
                      alt={userProfile.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-2xl">
                      {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {/* Camera Icon for Image Upload */}
                  {!editing && (
                    <label 
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 cursor-pointer shadow-lg border-2 border-white dark:border-gray-800 transition-colors"
                      htmlFor="profile-image"
                    >
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  
                  {/* Upload Progress */}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="text-white text-sm font-medium">{uploadProgress}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Name and Role */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {userProfile.fullName}
                      </h1>
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">@{userProfile.username}</p>
                        {/* Fixed Blue Verification Badge */}
                        {showBadge && <VerificationBadge />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.role && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userProfile.role === 'Teacher' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {userProfile.role}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          Rank #{stats.rank}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
                          ID: {currentUser.uid.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location and Education */}
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
                    {userProfile.education && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>{userProfile.education}</span>
                      </div>
                    )}
                    {userProfile.province && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{userProfile.province}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>{stats.streakDays} day streak</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Active: 2025-07-11 04:28:32</span>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalUploads}</div>
                      <div className="text-xs text-gray-500">Resources</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                        <Download className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Downloads</div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-2">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.rating}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 mb-2">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.following}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About</h3>
                      {!editingBio && (
                        <button 
                          onClick={() => setEditingBio(true)} 
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          {formData.bio ? 'Edit' : 'Add Bio'}
                        </button>
                      )}
                    </div>
                    
                    {editingBio ? (
                      <div>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleBioChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="3"
                          placeholder="Tell people about yourself..."
                          maxLength={500}
                        ></textarea>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">{formData.bio.length}/500 characters</span>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => {
                                setEditingBio(false);
                                setFormData({
                                  ...formData,
                                  bio: userProfile.bio || ''
                                });
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleBioSubmit}
                              disabled={loading}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {formData.bio || (
                          <span className="text-gray-400 italic">No bio added yet. Share something about yourself!</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="lg:ml-8 mt-6 lg:mt-0 space-y-3">
                  <button
                    onClick={handleEditToggle}
                    className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Edit2 className="h-5 w-5" />
                    <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                  
                  <button className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200">
                    <Share2 className="h-5 w-5" />
                    <span>Share Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {editing && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Edit2 className="h-6 w-6 mr-3" />
                Edit Profile Information
              </h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500">@</span>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Role</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education Level
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Education Level</option>
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Resources Section with Advanced Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <FileText className="h-6 w-6 mr-3" />
                    My Uploaded Resources
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredFiles.length} of {userFiles.length} resources • User ID: {currentUser.uid} • Last update: 2025-07-11 04:28:32
                  </p>
                </div>
              </div>

              {/* Advanced Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search your resources by title, description, subject, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Resource Type Filter */}
                  <select
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="All">All Types</option>
                    <option value="PDF">PDFs</option>
                    <option value="Lecture">Lectures</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  {/* Subject Filter */}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {getUniqueSubjects().map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      fetchUserFiles();
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                    <option value="views">Most Viewed</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  {/* Sort Order */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setFileViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        fileViewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setFileViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        fileViewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || selectedFileType !== 'All' || selectedCategory !== 'All' || selectedSubject !== 'All') && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedFileType !== 'All' && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm">
                        Type: {selectedFileType}
                        <button onClick={() => setSelectedFileType('All')} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategory !== 'All' && (
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory('All')} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedSubject !== 'All' && (
                      <span className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full text-sm">
                        Subject: {selectedSubject}
                        <button onClick={() => setSelectedSubject('All')} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFileType('All');
                        setSelectedCategory('All');
                        setSelectedSubject('All');
                      }}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredFiles.length !== userFiles.length && (
                      <span>Showing {filteredFiles.length} of {userFiles.length} resources</span>
                    )}
                  </div>
                  <button
                    onClick={fetchUserFiles}
                    disabled={loadingFiles}
                    className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingFiles ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Resources Display */}
              {loadingFiles ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">Loading Your Resources</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Searching through collections for User ID: {currentUser.uid}
                  </p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 rounded-2xl p-16 text-center">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6">
                    <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {userFiles.length === 0 ? 'No Resources Found' : 'No Matching Resources'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {userFiles.length === 0 
                      ? `No resources found for User ID: ${currentUser.uid}. Start uploading to share your knowledge!`
                      : `No resources match your current filters. Try adjusting your search criteria.`
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push('/upload')}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload New Resource
                    </button>
                    {userFiles.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedFileType('All');
                          setSelectedCategory('All');
                          setSelectedSubject('All');
                        }}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={fetchUserFiles}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Refresh Search
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Responsive Grid: 3 cards on desktop, 1 on mobile */}
                  <div className={
                    fileViewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-3 gap-6' // 1 card on mobile, 3 on desktop
                      : 'space-y-4'
                  }>
                    {filteredFiles.map((file) => (
                      <EnhancedFileCard 
                        key={`${file.collectionName}-${file.id}`} 
                        file={file} 
                        isListView={fileViewMode === 'list'} 
                      />
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {filteredFiles.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 dark:text-gray-400 space-y-2 sm:space-y-0">
                        <div>
                          Showing {filteredFiles.length} of {userFiles.length} total resources
                          {filteredFiles.length !== userFiles.length && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400">
                              (filtered)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span>Last updated:</span>
                            <span className="font-medium">2025-07-11 04:28:32</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            User: {currentUserLogin}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Dashboard */}
          {userFiles.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-3" />
                  Resource Analytics & Insights
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Categories Distribution */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Categories</h3>
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        userFiles.reduce((acc, file) => {
                          acc[file.mainCategory] = (acc[file.mainCategory] || 0) + 1;
                          return acc;
                        }, {})
                      ).slice(0, 4).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{category}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Types Distribution */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Content Types</h3>
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        userFiles.reduce((acc, file) => {
                          acc[file.contentType] = (acc[file.contentType] || 0) + 1;
                          return acc;
                        }, {})
                      ).slice(0, 4).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{type}</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subjects Distribution */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">Subjects</h3>
                      <School className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        userFiles.filter(f => f.subject && f.subject !== 'General').reduce((acc, file) => {
                          acc[file.subject] = (acc[file.subject] || 0) + 1;
                          return acc;
                        }, {})
                      ).slice(0, 4).map(([subject, count]) => (
                        <div key={subject} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{subject}</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collections Used */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300">Collections</h3>
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        userFiles.reduce((acc, file) => {
                          acc[file.collectionName] = (acc[file.collectionName] || 0) + 1;
                          return acc;
                        }, {})
                      ).slice(0, 4).map(([collection, count]) => (
                        <div key={collection} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{collection}</span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.round(stats.totalViews / Math.max(stats.totalUploads, 1))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Views/Resource</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(stats.totalDownloads / Math.max(stats.totalUploads, 1))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Downloads/Resource</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {stats.rating}★
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {[...new Set(userFiles.map(f => f.collectionName))].length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Collections Used</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          {userFiles.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Activity className="h-6 w-6 mr-3" />
                  Recent Upload Activity
                </h2>
                
                <div className="space-y-4">
                  {userFiles.slice(0, 5).map((file, index) => (
                    <div key={`activity-${file.id}`} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex-shrink-0">
                        {getResourceTypeIcon(file.resourceType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          Uploaded "{file.title}"
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{file.contentType}</span>
                          <span>•</span>
                          <span className="truncate">{file.collectionName}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {file.views}
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {file.downloads}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditFile(file)}
                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit Resource"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal />

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </>
  );
};

export default Profile;
