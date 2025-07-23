'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, BookOpen, Users, Star, TrendingUp, Calendar, Award, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import SidebarSection from '../components/SidebarSection';
import ViewAllButton from '../components/ViewAllButton';

// Helper function to extract Drive ID from URL
function extractDriveId(url) {
  try {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

// Sample authors data
const authors = [
  'Muhammad Ali Khan', 'Fatima Ahmed', 'Ahmed Hassan', 'Ayesha Malik', 'Hassan Raza',
  'Zainab Sheikh', 'Omar Farooq', 'Rabia Nawaz', 'Bilal Ahmad', 'Sana Tariq',
];

// Function to get random author
const getRandomAuthor = () => {
  return authors[Math.floor(Math.random() * authors.length)];
};

// All collections from Selection.txt
const allCollections = [
  'AJKPSCNotes', 'AJKPSCPastPapers', 'AJKPSCQuiz', 'AJKPSCSyllabus', 'AJKPSCTest', 'AJKPSCTextBooks',
  'ALevelLectures', 'ALevelNotes', 'ALevelPastPapers', 'ALevelQuiz', 'ALevelSyllabus', 'ALevelTest', 'ALevelTextBooks',
  'AMCLectures', 'AMCNotes', 'AMCPastPapers', 'AMCQuiz', 'AMCRollNoSlip', 'AMCSyllabus', 'AMCTest', 'AMCTextBooks',
  'AllamaIqbalOpenUniversityLectures', 'AllamaIqbalOpenUniversityNotes', 'AllamaIqbalOpenUniversityPastPapers',
  'AllamaIqbalOpenUniversityQuiz', 'AllamaIqbalOpenUniversitySyllabus', 'AllamaIqbalOpenUniversityTest',
  'AllamaIqbalOpenUniversityTextBooks', 'AzadJammuKashmir10thDateSheet', 'AzadJammuKashmir10thGazette',
  'AzadJammuKashmir10thGuessPapers', 'AzadJammuKashmir10thLectures', 'AzadJammuKashmir10thNotes',
  'AzadJammuKashmir10thPairingScheme', 'AzadJammuKashmir10thPastPapers', 'AzadJammuKashmir10thQuiz',
  'AzadJammuKashmir10thResult', 'AzadJammuKashmir10thRollNoSlip', 'AzadJammuKashmir10thSyllabus',
  'AzadJammuKashmir10thTest', 'AzadJammuKashmir10thTextBooks', 'AzadJammuKashmir11thDateSheet',
  'AzadJammuKashmir11thGazette', 'AzadJammuKashmir11thGuessPapers', 'AzadJammuKashmir11thLectures',
  'AzadJammuKashmir11thNotes', 'AzadJammuKashmir11thPairingScheme', 'AzadJammuKashmir11thPastPapers',
  'AzadJammuKashmir11thQuiz', 'AzadJammuKashmir11thResult', 'AzadJammuKashmir11thRollNoSlip',
  'AzadJammuKashmir11thSyllabus', 'AzadJammuKashmir11thTest', 'AzadJammuKashmir11thTextBooks',
  'AzadJammuKashmir12thDateSheet', 'AzadJammuKashmir12thGazette', 'AzadJammuKashmir12thGuessPapers',
  'AzadJammuKashmir12thLectures', 'AzadJammuKashmir12thNotes', 'AzadJammuKashmir12thPairingScheme',
  'AzadJammuKashmir12thPastPapers', 'AzadJammuKashmir12thQuiz', 'AzadJammuKashmir12thResult',
  'AzadJammuKashmir12thRollNoSlip', 'AzadJammuKashmir12thSyllabus', 'AzadJammuKashmir12thTest',
  'AzadJammuKashmir12thTextBooks', 'AzadJammuKashmir9thDateSheet', 'AzadJammuKashmir9thGazette',
  'AzadJammuKashmir9thGuessPapers', 'AzadJammuKashmir9thLectures', 'AzadJammuKashmir9thNotes',
  'AzadJammuKashmir9thPairingScheme', 'AzadJammuKashmir9thPastPapers', 'AzadJammuKashmir9thQuiz',
  'AzadJammuKashmir9thResult', 'AzadJammuKashmir9thRollNoSlip', 'AzadJammuKashmir9thSyllabus',
  'AzadJammuKashmir9thTest', 'AzadJammuKashmir9thTextBooks', 'AzadJammuKashmirMDCATLectures',
  'AzadJammuKashmirMDCATNotes', 'AzadJammuKashmirMDCATPastPapers', 'AzadJammuKashmirMDCATQuiz',
  'AzadJammuKashmirMDCATResult', 'AzadJammuKashmirMDCATRollNoSlip', 'AzadJammuKashmirMDCATSyllabus',
  'AzadJammuKashmirMDCATTest', 'AzadJammuKashmirMDCATTextBooks', 'AzadJammuKashmirOtherUniversityGuessPapers',
  'AzadJammuKashmirOtherUniversityNotes', 'AzadJammuKashmirOtherUniversityPastPapers',
  'AzadJammuKashmirOtherUniversityQuiz', 'AzadJammuKashmirOtherUniversitySyllabus',
  'AzadJammuKashmirOtherUniversityTest', 'AzadJammuKashmirOtherUniversityTextBooks',
  'AzadJammuKashmirUniversityEntryTestGuessPapers', 'AzadJammuKashmirUniversityEntryTestNotes',
  'AzadJammuKashmirUniversityEntryTestPastPapers', 'AzadJammuKashmirUniversityEntryTestQuiz',
  'AzadJammuKashmirUniversityEntryTestSyllabus', 'AzadJammuKashmirUniversityEntryTestTest', 'BDSGuessPapers',
  'BDSNotes', 'BDSPastPapers', 'BDSQuiz', 'BDSSyllabus', 'BDSTest', 'BPSCNotes', 'BPSCPastPapers',
  'BPSCQuiz', 'BPSCSyllabus', 'BPSCTest', 'BPSCTextBooks', 'Balochistan10thDateSheet', 'Balochistan10thGazette',
  'Balochistan10thGuessPapers', 'Balochistan10thLectures', 'Balochistan10thNotes', 'Balochistan10thPairingScheme',
  'Balochistan10thPastPapers', 'Balochistan10thQuiz', 'Balochistan10thResult', 'Balochistan10thRollNoSlip',
  'Balochistan10thSyllabus', 'Balochistan10thTest', 'Balochistan10thTextBooks', 'Balochistan11thDateSheet',
  'Balochistan11thGazette', 'Balochistan11thGuessPapers', 'Balochistan11thLectures', 'Balochistan11thNotes',
  'Balochistan11thPairingScheme', 'Balochistan11thPastPapers', 'Balochistan11thQuiz', 'Balochistan11thResult',
  'Balochistan11thRollNoSlip', 'Balochistan11thSyllabus', 'Balochistan11thTest', 'Balochistan11thTextBooks',
  'Balochistan12thDateSheet', 'Balochistan12thGazette', 'Balochistan12thGuessPapers', 'Balochistan12thLectures',
  'Balochistan12thNotes', 'Balochistan12thPairingScheme', 'Balochistan12thPastPapers', 'Balochistan12thQuiz',
  'Balochistan12thResult', 'Balochistan12thRollNoSlip', 'Balochistan12thSyllabus', 'Balochistan12thTest',
  'Balochistan12thTextBooks', 'Balochistan9thDateSheet', 'Balochistan9thGazette', 'Balochistan9thGuessPapers',
  'Balochistan9thLectures', 'Balochistan9thNotes', 'Balochistan9thPairingScheme', 'Balochistan9thPastPapers',
  'Balochistan9thQuiz', 'Balochistan9thResult', 'Balochistan9thRollNoSlip', 'Balochistan9thSyllabus',
  'Balochistan9thTest', 'Balochistan9thTextBooks', 'BalochistanMDCATLectures', 'BalochistanMDCATNotes',
  'BalochistanMDCATPastPapers', 'BalochistanMDCATQuiz', 'BalochistanMDCATResult', 'BalochistanMDCATRollNoSlip',
  'BalochistanMDCATSyllabus', 'BalochistanMDCATTest', 'BalochistanMDCATTextBooks',
  'BalochistanOtherUniversityGuessPapers', 'BalochistanOtherUniversityNotes', 'BalochistanOtherUniversityPastPapers',
  'BalochistanOtherUniversityQuiz', 'BalochistanOtherUniversitySyllabus', 'BalochistanOtherUniversityTest',
  'BalochistanOtherUniversityTextBooks', 'BalochistanUniversityEntryTestGuessPapers',
  'BalochistanUniversityEntryTestNotes', 'BalochistanUniversityEntryTestPastPapers',
  'BalochistanUniversityEntryTestQuiz', 'BalochistanUniversityEntryTestSyllabus',
  'BalochistanUniversityEntryTestTest', 'CSSNotes', 'CSSPastPapers', 'CSSQuiz', 'CSSSyllabus', 'CSSTest',
  'CSSTextBooks', 'ECATLectures', 'ECATNotes', 'ECATPastPapers', 'ECATQuiz', 'ECATResult', 'ECATSyllabus',
  'ECATTest', 'ECATTextBooks', 'EnglishCalligraphy', 'EnglishLanguage', 'FPSCNotes', 'FPSCPastPapers',
  'FPSCQuiz', 'FPSCSyllabus', 'FPSCTest', 'Federal10thDateSheet', 'Federal10thGazette', 'Federal10thGuessPapers',
  'Federal10thLectures', 'Federal10thNotes', 'Federal10thPairingScheme', 'Federal10thPastPapers', 'Federal10thQuiz',
  'Federal10thResult', 'Federal10thRollNoSlip', 'Federal10thSyllabus', 'Federal10thTest', 'Federal10thTextBooks',
  'Federal11thDateSheet', 'Federal11thGazette', 'Federal11thGuessPapers', 'Federal11thLectures', 'Federal11thNotes',
  'Federal11thPairingScheme', 'Federal11thPastPapers', 'Federal11thQuiz', 'Federal11thResult', 'Federal11thRollNoSlip',
  'Federal11thSyllabus', 'Federal11thTest', 'Federal11thTextBooks', 'Federal12thDateSheet', 'Federal12thGazette',
  'Federal12thGuessPapers', 'Federal12thLectures', 'Federal12thNotes', 'Federal12thPairingScheme',
  'Federal12thPastPapers', 'Federal12thQuiz', 'Federal12thResult', 'Federal12thRollNoSlip', 'Federal12thSyllabus',
  'Federal12thTest', 'Federal12thTextBooks', 'Federal9thDateSheet', 'Federal9thGazette', 'Federal9thGuessPapers',
  'Federal9thLectures', 'Federal9thNotes', 'Federal9thPairingScheme', 'Federal9thPastPapers', 'Federal9thQuiz',
  'Federal9thResult', 'Federal9thRollNoSlip', 'Federal9thSyllabus', 'Federal9thTest', 'Federal9thTextBooks',
  'FederalMDCATLectures', 'FederalMDCATNotes', 'FederalMDCATPastPapers', 'FederalMDCATQuiz', 'FederalMDCATResult',
  'FederalMDCATRollNoSlip', 'FederalMDCATSyllabus', 'FederalMDCATTest', 'FederalMDCATTextBooks',
  'FederalOtherUniversityGuessPapers', 'FederalOtherUniversityNotes', 'FederalOtherUniversityPastPapers',
  'FederalOtherUniversityQuiz', 'FederalOtherUniversitySyllabus', 'FederalOtherUniversityTest',
  'FederalOtherUniversityTextBooks', 'FederalUniversityEntryTestGuessPapers', 'FederalUniversityEntryTestNotes',
  'FederalUniversityEntryTestPastPapers', 'FederalUniversityEntryTestQuiz', 'FederalUniversityEntryTestSyllabus',
  'FederalUniversityEntryTestTest', 'General', 'GilgitBaltistan10thDateSheet', 'GilgitBaltistan10thGazette',
  'GilgitBaltistan10thGuessPapers', 'GilgitBaltistan10thLectures', 'GilgitBaltistan10thNotes',
  'GilgitBaltistan10thPairingScheme', 'GilgitBaltistan10thPastPapers', 'GilgitBaltistan10thQuiz',
  'GilgitBaltistan10thResult', 'GilgitBaltistan10thRollNoSlip', 'GilgitBaltistan10thSyllabus',
  'GilgitBaltistan10thTest', 'GilgitBaltistan10thTextBooks', 'GilgitBaltistan11thDateSheet',
  'GilgitBaltistan11thGazette', 'GilgitBaltistan11thGuessPapers', 'GilgitBaltistan11thLectures',
  'GilgitBaltistan11thNotes', 'GilgitBaltistan11thPairingScheme', 'GilgitBaltistan11thPastPapers',
  'GilgitBaltistan11thQuiz', 'GilgitBaltistan11thResult', 'GilgitBaltistan11thRollNoSlip',
  'GilgitBaltistan11thSyllabus', 'GilgitBaltistan11thTest', 'GilgitBaltistan11thTextBooks',
  'GilgitBaltistan12thDateSheet', 'GilgitBaltistan12thGazette', 'GilgitBaltistan12thGuessPapers',
  'GilgitBaltistan12thLectures', 'GilgitBaltistan12thNotes', 'GilgitBaltistan12thPairingScheme',
  'GilgitBaltistan12thPastPapers', 'GilgitBaltistan12thQuiz', 'GilgitBaltistan12thResult',
  'GilgitBaltistan12thRollNoSlip', 'GilgitBaltistan12thSyllabus', 'GilgitBaltistan12thTest',
  'GilgitBaltistan12thTextBooks', 'GilgitBaltistan9thDateSheet', 'GilgitBaltistan9thGazette',
  'GilgitBaltistan9thGuessPapers', 'GilgitBaltistan9thLectures', 'GilgitBaltistan9thNotes',
  'GilgitBaltistan9thPairingScheme', 'GilgitBaltistan9thPastPapers', 'GilgitBaltistan9thQuiz',
  'GilgitBaltistan9thResult', 'GilgitBaltistan9thRollNoSlip', 'GilgitBaltistan9thSyllabus',
  'GilgitBaltistan9thTest', 'GilgitBaltistan9thTextBooks', 'GilgitBaltistanMDCATLectures',
  'GilgitBaltistanMDCATNotes', 'GilgitBaltistanMDCATPastPapers', 'GilgitBaltistanMDCATQuiz',
  'GilgitBaltistanMDCATResult', 'GilgitBaltistanMDCATRollNoSlip', 'GilgitBaltistanMDCATSyllabus',
  'GilgitBaltistanMDCATTest', 'GilgitBaltistanMDCATTextBooks', 'GilgitBaltistanOtherUniversityGuessPapers',
  'GilgitBaltistanOtherUniversityNotes', 'GilgitBaltistanOtherUniversityPastPapers',
  'GilgitBaltistanOtherUniversityQuiz', 'GilgitBaltistanOtherUniversitySyllabus',
  'GilgitBaltistanOtherUniversityTest', 'GilgitBaltistanOtherUniversityTextBooks',
  'GilgitBaltistanUniversityEntryTestGuessPapers', 'GilgitBaltistanUniversityEntryTestNotes',
  'GilgitBaltistanUniversityEntryTestPastPapers', 'GilgitBaltistanUniversityEntryTestQuiz',
  'GilgitBaltistanUniversityEntryTestSyllabus', 'GilgitBaltistanUniversityEntryTestTest',
  'KPSCNotes', 'KPSCPastPapers', 'KPSCQuiz', 'KPSCSyllabus', 'KPSCTest', 'KPSCTextBooks',
  'KhyberPakhtunkhwa10thDateSheet', 'KhyberPakhtunkhwa10thGazette', 'KhyberPakhtunkhwa10thGuessPapers',
  'KhyberPakhtunkhwa10thLectures', 'KhyberPakhtunkhwa10thNotes', 'KhyberPakhtunkhwa10thPairingScheme',
  'KhyberPakhtunkhwa10thPastPapers', 'KhyberPakhtunkhwa10thQuiz', 'KhyberPakhtunkhwa10thResult',
  'KhyberPakhtunkhwa10thRollNoSlip', 'KhyberPakhtunkhwa10thSyllabus', 'KhyberPakhtunkhwa10thTest',
  'KhyberPakhtunkhwa10thTextBooks', 'KhyberPakhtunkhwa11thDateSheet', 'KhyberPakhtunkhwa11thGazette',
  'KhyberPakhtunkhwa11thGuessPapers', 'KhyberPakhtunkhwa11thLectures', 'KhyberPakhtunkhwa11thNotes',
  'KhyberPakhtunkhwa11thPairingScheme', 'KhyberPakhtunkhwa11thPastPapers', 'KhyberPakhtunkhwa11thQuiz',
  'KhyberPakhtunkhwa11thResult', 'KhyberPakhtunkhwa11thRollNoSlip', 'KhyberPakhtunkhwa11thSyllabus',
  'KhyberPakhtunkhwa11thTest', 'KhyberPakhtunkhwa11thTextBooks', 'KhyberPakhtunkhwa12thDateSheet',
  'KhyberPakhtunkhwa12thGazette', 'KhyberPakhtunkhwa12thGuessPapers', 'KhyberPakhtunkhwa12thLectures',
  'KhyberPakhtunkhwa12thNotes', 'KhyberPakhtunkhwa12thPairingScheme', 'KhyberPakhtunkhwa12thPastPapers',
  'KhyberPakhtunkhwa12thQuiz', 'KhyberPakhtunkhwa12thResult', 'KhyberPakhtunkhwa12thRollNoSlip',
  'KhyberPakhtunkhwa12thSyllabus', 'KhyberPakhtunkhwa12thTest', 'KhyberPakhtunkhwa12thTextBooks',
  'KhyberPakhtunkhwa9thDateSheet', 'KhyberPakhtunkhwa9thGazette', 'KhyberPakhtunkhwa9thGuessPapers',
  'KhyberPakhtunkhwa9thLectures', 'KhyberPakhtunkhwa9thNotes', 'KhyberPakhtunkhwa9thPairingScheme',
  'KhyberPakhtunkhwa9thPastPapers', 'KhyberPakhtunkhwa9thQuiz', 'KhyberPakhtunkhwa9thResult',
  'KhyberPakhtunkhwa9thRollNoSlip', 'KhyberPakhtunkhwa9thSyllabus', 'KhyberPakhtunkhwa9thTest',
  'KhyberPakhtunkhwa9thTextBooks', 'KhyberPakhtunkhwaMDCATLectures', 'KhyberPakhtunkhwaMDCATNotes',
  'KhyberPakhtunkhwaMDCATPastPapers', 'KhyberPakhtunkhwaMDCATQuiz', 'KhyberPakhtunkhwaMDCATResult',
  'KhyberPakhtunkhwaMDCATRollNoSlip', 'KhyberPakhtunkhwaMDCATSyllabus', 'KhyberPakhtunkhwaMDCATTest',
  'KhyberPakhtunkhwaOtherUniversityGuessPapers', 'KhyberPakhtunkhwaOtherUniversityNotes',
  'KhyberPakhtunkhwaOtherUniversityPastPapers', 'KhyberPakhtunkhwaOtherUniversityQuiz',
  'KhyberPakhtunkhwaOtherUniversitySyllabus', 'KhyberPakhtunkhwaOtherUniversityTest',
  'KhyberPakhtunkhwaOtherUniversityTextBooks', 'KhyberPakhtunkhwaUniversityEntryTestGuessPapers',
  'KhyberPakhtunkhwaUniversityEntryTestNotes', 'KhyberPakhtunkhwaUniversityEntryTestPastPapers',
  'KhyberPakhtunkhwaUniversityEntryTestQuiz', 'KhyberPakhtunkhwaUniversityEntryTestSyllabus',
  'KhyberPakhtunkhwaUniversityEntryTestTest', 'MBBSGuessPapers', 'MBBSLectures', 'MBBSNotes',
  'MBBSPastPapers', 'MBBSQuiz', 'MBBSSyllabus', 'MBBSTest', 'NTSNotes', 'NTSPastPapers', 'NTSQuiz',
  'NTSSyllabus', 'NTSTest', 'NTSTextBooks', 'NUMSLectures', 'NUMSNotes', 'NUMSPastPapers', 'NUMSQuiz',
  'NUMSResult', 'NUMSRollNoSlip', 'NUMSSyllabus', 'NUMSTest', 'NUMSTextBooks', 'OLevelLectures',
  'OLevelNotes', 'OLevelPastPapers', 'OLevelQuiz', 'OLevelSyllabus', 'OLevelTest', 'OLevelTextBooks',
  'PMAPastPapers', 'PMAQuiz', 'PMASyllabus', 'PMATest', 'PMSNotes', 'PMSPastPapers', 'PMSQuiz',
  'PMSSyllabus', 'PMSTest', 'PMSTextBooks', 'PPSCNotes', 'PPSCPastPapers', 'PPSCQuiz', 'PPSCSyllabus',
  'PPSCTest', 'Punjab10thDateSheet', 'Punjab10thGazette', 'Punjab10thGuessPapers', 'Punjab10thLectures',
  'Punjab10thNotes', 'Punjab10thPairingScheme', 'Punjab10thPastPapers', 'Punjab10thQuiz', 'Punjab10thResult',
  'Punjab10thRollNoSlip', 'Punjab10thSyllabus', 'Punjab10thTest', 'Punjab10thTextBooks', 'Punjab11thDateSheet',
  'Punjab11thGazette', 'Punjab11thGuessPapers', 'Punjab11thLectures', 'Punjab11thNotes', 'Punjab11thPairingScheme',
  'Punjab11thPastPapers', 'Punjab11thQuiz', 'Punjab11thResult', 'Punjab11thRollNoSlip', 'Punjab11thSyllabus',
  'Punjab11thTest', 'Punjab11thTextBooks', 'Punjab12thDateSheet', 'Punjab12thGazette', 'Punjab12thGuessPapers',
  'Punjab12thLectures', 'Punjab12thNotes', 'Punjab12thPairingScheme', 'Punjab12thPastPapers', 'Punjab12thQuiz',
  'Punjab12thResult', 'Punjab12thRollNoSlip', 'Punjab12thSyllabus', 'Punjab12thTest', 'Punjab12thTextBooks',
  'Punjab9thDateSheet', 'Punjab9thGazette', 'Punjab9thGuessPapers', 'Punjab9thLectures', 'Punjab9thNotes',
  'Punjab9thPairingScheme', 'Punjab9thPastPapers', 'Punjab9thQuiz', 'Punjab9thResult', 'Punjab9thRollNoSlip',
  'Punjab9thSyllabus', 'Punjab9thTest', 'Punjab9thTextBooks', 'PunjabECATPastPapers', 'PunjabMDCATLectures',
  'PunjabMDCATNotes', 'PunjabMDCATPastPapers', 'PunjabMDCATQuiz', 'PunjabMDCATResult', 'PunjabMDCATRollNoSlip',
  'PunjabMDCATSyllabus', 'PunjabMDCATTest', 'PunjabMDCATTextBooks', 'PunjabOtherUniversityGuessPapers',
  'PunjabOtherUniversityNotes', 'PunjabOtherUniversityPastPapers', 'PunjabOtherUniversityQuiz',
  'PunjabOtherUniversitySyllabus', 'PunjabOtherUniversityTest', 'PunjabOtherUniversityTextBooks',
  'PunjabUniversityEntryTestGuessPapers', 'PunjabUniversityEntryTestNotes', 'PunjabUniversityEntryTestPastPapers',
  'PunjabUniversityEntryTestQuiz', 'PunjabUniversityEntryTestSyllabus', 'PunjabUniversityEntryTestTest',
  'SPSCNotes', 'SPSCPastPapers', 'SPSCQuiz', 'SPSCSyllabus', 'SPSCTest', 'SPSCTextBooks',
  'Sindh10thDateSheet', 'Sindh10thGazette', 'Sindh10thGuessPapers', 'Sindh10thLectures', 'Sindh10thNotes',
  'Sindh10thPairingScheme', 'Sindh10thPastPapers', 'Sindh10thQuiz', 'Sindh10thResult', 'Sindh10thRollNoSlip',
  'Sindh10thSyllabus', 'Sindh10thTest', 'Sindh10thTextBooks', 'Sindh11thDateSheet', 'Sindh11thGazette',
  'Sindh11thGuessPapers', 'Sindh11thLectures', 'Sindh11thNotes', 'Sindh11thPairingScheme', 'Sindh11thPastPapers',
  'Sindh11thQuiz', 'Sindh11thResult', 'Sindh11thRollNoSlip', 'Sindh11thSyllabus', 'Sindh11thTest',
  'Sindh11thTextBooks', 'Sindh12thDateSheet', 'Sindh12thGazette', 'Sindh12thGuessPapers', 'Sindh12thLectures',
  'Sindh12thNotes', 'Sindh12thPairingScheme', 'Sindh12thPastPapers', 'Sindh12thQuiz', 'Sindh12thResult',
  'Sindh12thRollNoSlip', 'Sindh12thSyllabus', 'Sindh12thTest', 'Sindh12thTextBooks', 'Sindh9thDateSheet',
  'Sindh9thGazette', 'Sindh9thGuessPapers', 'Sindh9thLectures', 'Sindh9thNotes', 'Sindh9thPairingScheme',
  'Sindh9thPastPapers', 'Sindh9thQuiz', 'Sindh9thResult', 'Sindh9thRollNoSlip', 'Sindh9thSyllabus',
  'Sindh9thTest', 'Sindh9thTextBooks', 'SindhMDCATLectures', 'SindhMDCATNotes', 'SindhMDCATPastPapers',
  'SindhMDCATQuiz', 'SindhMDCATResult', 'SindhMDCATRollNoSlip', 'SindhMDCATSyllabus', 'SindhMDCATTest',
  'SindhMDCATTextBooks', 'SindhOtherUniversityGuessPapers', 'SindhOtherUniversityNotes',
  'SindhOtherUniversityPastPapers', 'SindhOtherUniversityQuiz', 'SindhOtherUniversitySyllabus',
  'SindhOtherUniversityTest', 'SindhOtherUniversityTextBooks', 'SindhUniversityEntryTestGuessPapers',
  'SindhUniversityEntryTestNotes', 'SindhUniversityEntryTestPastPapers', 'SindhUniversityEntryTestQuiz',
  'SindhUniversityEntryTestSyllabus', 'SindhUniversityEntryTestTest', 'UrduCalligraphy', 'VirtualUniversityGuessPapers',
  'VirtualUniversityLectures', 'VirtualUniversityNotes', 'VirtualUniversityPastPapers', 'VirtualUniversityQuiz',
  'VirtualUniversityRollNoSlip', 'VirtualUniversitySyllabus', 'VirtualUniversityTest', 'VirtualUniversityTextBooks',
];

// Category definitions
const categoryDefinitions = {
  School: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['9th', '10th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Result', 'RollNoSlip', 'Gazette', 'PairingScheme'],
  },
  College: {
    provinces: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    classes: ['11th', '12th'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Result', 'RollNoSlip', 'Gazette', 'PairingScheme'],
  },
  Cambridge: {
    classes: ['OLevel', 'ALevel'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus'],
  },
  'Entry Test': {
    classes: ['PMA', 'UniversityEntryTest', 'MDCAT', 'ECAT', 'NUMS', 'AMC'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'Result', 'RollNoSlip'],
    provincesFor: {
      MDCAT: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
      UniversityEntryTest: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    },
  },
  University: {
    classes: ['BDS', 'MBBS', 'AllamaIqbalOpenUniversity', 'VirtualUniversity', 'OtherUniversity'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'RollNoSlip'],
    provincesFor: {
      OtherUniversity: ['Punjab', 'Sindh', 'KhyberPakhtunkhwa', 'Balochistan', 'AzadJammuKashmir', 'GilgitBaltistan', 'Federal'],
    },
  },
  'Competition Exam': {
    classes: ['CSS', 'NTS', 'AJKPSC', 'KPSC', 'BPSC', 'SPSC', 'FPSC', 'PPSC', 'PMS'],
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Quiz', 'Test', 'Syllabus', 'Result'],
  },
  General: {
    contentTypes: ['Notes', 'TextBooks', 'PastPapers', 'Lectures', 'Quiz', 'Test', 'Syllabus', 'GuessPapers', 'DateSheet', 'Gazette', 'PairingScheme', 'UrduCalligraphy', 'EnglishCalligraphy', 'EnglishLanguage'],
  },
};

// Helper function to parse collection name and extract metadata
const parseCollectionName = (collectionName) => {
  let category, province, classLevel, contentType;

  // General collections
  if (categoryDefinitions.General.contentTypes.includes(collectionName)) {
    return { category: 'General', province: null, classLevel: null, contentType: collectionName };
  }

  // Competition Exam collections
  const compExams = categoryDefinitions['Competition Exam'].classes;
  if (compExams.some((exam) => collectionName.startsWith(exam))) {
    const exam = compExams.find((e) => collectionName.startsWith(e));
    contentType = collectionName.replace(exam, '');
    return { category: 'Competition Exam', province: null, classLevel: exam, contentType };
  }

  // Cambridge collections
  const cambridgeClasses = categoryDefinitions.Cambridge.classes;
  if (cambridgeClasses.some((cls) => collectionName.startsWith(cls))) {
    const cls = cambridgeClasses.find((c) => collectionName.startsWith(c));
    contentType = collectionName.replace(cls, '');
    return { category: 'Cambridge', province: null, classLevel: cls, contentType };
  }

  // University collections
  const uniClasses = categoryDefinitions.University.classes;
  if (uniClasses.some((cls) => collectionName.startsWith(cls))) {
    const cls = uniClasses.find((c) => collectionName.startsWith(c));
    contentType = collectionName.replace(cls, '');
    return { category: 'University', province: null, classLevel: cls, contentType };
  }

  // Entry Test collections
  const entryTestClasses = categoryDefinitions['Entry Test'].classes;
  if (entryTestClasses.some((cls) => collectionName.startsWith(cls))) {
    const cls = entryTestClasses.find((c) => collectionName.startsWith(c));
    contentType = collectionName.replace(cls, '');
    return { category: 'Entry Test', province: null, classLevel: cls, contentType };
  }

  // School and College collections
  const provinces = categoryDefinitions.School.provinces;
  const schoolClasses = categoryDefinitions.School.classes;
  const collegeClasses = categoryDefinitions.College.classes;
  const contentTypes = [...categoryDefinitions.School.contentTypes, ...categoryDefinitions.College.contentTypes];

  for (const province of provinces) {
    if (collectionName.startsWith(province)) {
      const remaining = collectionName.replace(province, '');
      const cls = [...schoolClasses, ...collegeClasses].find((c) => remaining.startsWith(c));
      if (cls) {
        contentType = remaining.replace(cls, '');
        category = schoolClasses.includes(cls) ? 'School' : 'College';
        return { category, province, classLevel: cls, contentType };
      }
    }
  }

  return { category: 'General', province: null, classLevel: null, contentType: collectionName };
};

export async function getStaticProps() {
  try {
    let allData = [];
    let classCategories = [];
    let boardCategories = [];
    let subjectCategories = [];
    let categoryCounts = {
      School: { count: 0, classes: {} },
      College: { count: 0, classes: {} },
      Cambridge: { count: 0, classes: {} },
      'Entry Test': { count: 0, classes: {} },
      University: { count: 0, classes: {} },
      'Competition Exam': { count: 0, classes: {} },
      General: { count: 0, contentTypes: {} },
    };

    for (const collectionName of allCollections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);

        if (!snapshot.empty) {
          const { category, province, classLevel, contentType } = parseCollectionName(collectionName);

          // Update category counts
          if (category in categoryCounts) {
            categoryCounts[category].count += snapshot.size;
            if (classLevel) {
              categoryCounts[category].classes[classLevel] = (categoryCounts[category].classes[classLevel] || 0) + snapshot.size;
            } else if (category === 'General') {
              categoryCounts[category].contentTypes[contentType] = (categoryCounts[category].contentTypes[contentType] || 0) + snapshot.size;
            }
          }

          snapshot.forEach((doc) => {
            const data = doc.data();

            // Handle resources with subjects array (e.g., PastPapers, Notes)
            if (data.metadata?.resourceType === 'PDF' && data.academicInfo?.subject) {
              const subjects = Array.isArray(data.academicInfo.subject) ? data.academicInfo.subject : [data.academicInfo.subject];
              subjects.forEach((subject, index) => {
                if (data.content?.fileUrl) {
                  const driveId = extractDriveId(data.content.fileUrl);
                  const resource = {
                    id: `${collectionName}-${doc.id}-${index}`,
                    title: data.content.title || `${category} ${classLevel || ''} ${contentType} - ${subject}`,
                    description: data.content.description || `Access ${contentType} for ${subject} ${classLevel || ''} ${province || ''}`,
                    subject: subject,
                    class: classLevel || 'General',
                    board: data.academicInfo.board || 'N/A',
                    year: data.academicInfo.year || 'N/A',
                    type: contentType,
                    url: data.content.fileUrl,
                    downloadUrl: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : data.content.fileUrl,
                    driveId,
                    collection: collectionName,
                    documentId: doc.id,
                    itemIndex: index,
                    // Updated path to class/type/documentId format
                    path: `/${classLevel || 'general'}/${contentType.toLowerCase()}/${doc.id}`,
                    author: data.userInfo?.authorName || getRandomAuthor(),
                    category,
                    province,
                    authorImage: data.userInfo?.authorImage || null, // Added for potential author image
                  };
                  allData.push(resource);
                }
              });
            } else if (data.metadata?.resourceType === 'Lecture' && data.content?.youtubeUrl) {
              // Handle lecture resources
              const resource = {
                id: `${collectionName}-${doc.id}`,
                title: data.content.title || `${category} ${classLevel || ''} ${contentType}`,
                description: data.content.description || `Watch ${contentType} for ${classLevel || ''} ${province || ''}`,
                subject: data.academicInfo?.subject || 'General',
                class: classLevel || 'General',
                board: data.academicInfo?.board || 'N/A',
                year: data.academicInfo?.year || 'N/A',
                type: contentType,
                url: data.content.youtubeUrl,
                downloadUrl: null,
                driveId: null,
                collection: collectionName,
                documentId: doc.id,
                itemIndex: 0,
                // Updated path to class/type/documentId format
                path: `/${classLevel || 'general'}/${contentType.toLowerCase()}/${doc.id}`,
                author: data.userInfo?.authorName || getRandomAuthor(),
                category,
                province,
                authorImage: data.userInfo?.authorImage || null, // Added for potential author image
              };
              allData.push(resource);
            } else if (data.metadata?.resourceType === 'Quiz' && data.academicInfo?.quiz) {
              // Handle quiz resources
              const resource = {
                id: `${collectionName}-${doc.id}`,
                title: data.content.title || `${category} ${classLevel || ''} Quiz`,
                description: data.content.description || `Take a quiz for ${classLevel || ''} ${province || ''}`,
                subject: data.academicInfo?.subject || 'General',
                class: classLevel || 'General',
                board: data.academicInfo?.board || 'N/A',
                year: data.academicInfo?.year || 'N/A',
                type: contentType,
                url: data.content.quizImageUrl || '#',
                downloadUrl: null,
                driveId: null,
                collection: collectionName,
                documentId: doc.id,
                itemIndex: 0,
                // Updated path to class/type/documentId format
                path: `/${classLevel || 'general'}/${contentType.toLowerCase()}/${doc.id}`,
                author: data.userInfo?.authorName || getRandomAuthor(),
                category,
                province,
                authorImage: data.userInfo?.authorImage || null, // Added for potential author image
                quiz: data.academicInfo.quiz,
              };
              allData.push(resource);
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
      }
    }

    // Generate class categories for School and College
    for (const category of ['School', 'College']) {
      const classes = categoryDefinitions[category].classes;
      for (const cls of classes) {
        const count = categoryCounts[category].classes[cls] || 0;
        if (count > 0) {
          classCategories.push({
            id: `${category}-${cls}`,
            name: `${cls} Class`,
            count,
            category,
          });
        }
      }
    }

    // Generate class categories for Cambridge, Entry Test, and University
    for (const category of ['Cambridge', 'Entry Test', 'University']) {
      const classes = categoryDefinitions[category].classes;
      for (const cls of classes) {
        const count = categoryCounts[category].classes[cls] || 0;
        if (count > 0) {
          classCategories.push({
            id: `${category}-${cls}`,
            name: cls.replace(/([A-Z])/g, ' $1').trim(),
            count,
            category,
          });
        }
      }
    }

    // Generate board categories
    const boardsSet = new Set();
    allData.forEach((item) => {
      if (item.board && item.board !== 'N/A') boardsSet.add(item.board);
    });
    boardCategories = Array.from(boardsSet).map((board, index) => ({
      id: index + 1,
      name: `${board} Board`,
      count: allData.filter((item) => item.board === board).length,
    }));

    // Generate subject categories
    const subjectsSet = new Set();
    allData.forEach((item) => {
      if (item.subject && item.subject !== 'General') subjectsSet.add(item.subject);
    });
    subjectCategories = Array.from(subjectsSet).map((subject, index) => ({
      id: index + 1,
      name: subject,
      count: allData.filter((item) => item.subject === subject).length,
      icon: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9',
    }));

    // Generate counts for specific entry tests
    const ecatCount = allData.filter((item) => item.collection.includes('ECAT')).length;
    const mdcatCount = allData.filter((item) => item.collection.includes('MDCAT')).length;
    const numsCount = allData.filter((item) => item.collection.includes('NUMS')).length;
    const amcCount = allData.filter((item) => item.collection.includes('AMC')).length;
    const pmaCount = allData.filter((item) => item.collection.includes('PMA')).length;

    // Generate counts for competition exams
    const cssCount = allData.filter((item) => item.collection.includes('CSS')).length;
    const ntsCount = allData.filter((item) => item.collection.includes('NTS')).length;
    const ppscCount = allData.filter((item) => item.collection.includes('PPSC')).length;

    // Featured data: Latest 8 resources sorted by upload date
    const featuredData = allData
      .sort((a, b) => (b.year || '9999') - (a.year || '9999'))
      .slice(0, 8);

    return {
      props: {
        resources: featuredData,
        allResources: allData,
        classCategories,
        boardCategories,
        subjectCategories,
        ecatCount,
        mdcatCount,
        numsCount,
        amcCount,
        pmaCount,
        cssCount,
        ntsCount,
        ppscCount,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        resources: [],
        allResources: [],
        classCategories: [],
        boardCategories: [],
        subjectCategories: [],
        ecatCount: 0,
        mdcatCount: 0,
        numsCount: 0,
        amcCount: 0,
        pmaCount: 0,
        cssCount: 0,
        ntsCount: 0,
        ppscCount: 0,
      },
      revalidate: 3600,
    };
  }
}

// Enhanced News Card Component
const NewsCard = memo(({ news, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg'
        : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md'
    }`}
  >
    <div className="flex items-start space-x-3">
      <div className={`w-3 h-3 rounded-full mt-2 animate-pulse ${isActive ? 'bg-red-500' : 'bg-gray-300'}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-semibold leading-tight ${isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}>
          {news.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {news.date}
        </p>
      </div>
    </div>
  </div>
));

NewsCard.displayName = 'NewsCard';

// Main Component
const TaleemSpot = ({
  resources,
  allResources,
  classCategories,
  boardCategories,
  subjectCategories,
  ecatCount,
  mdcatCount,
  numsCount,
  amcCount,
  pmaCount,
  cssCount,
  ntsCount,
  ppscCount,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [filteredData, setFilteredData] = useState(resources || []);
  const [activeNews, setActiveNews] = useState(0);

  // Updated news data to reflect broader categories
  const latestNews = useMemo(() => [
    {
      id: 1,
      title: '9th Class Biology 2024 - Lahore Board',
      date: 'Just Now',
      content: 'Latest 9th Class Biology past paper from Lahore Board for 2024 examination is now available for download.',
      type: 'trending',
    },
    {
      id: 2,
      title: 'CSS 2024 General Knowledge Notes',
      date: '2 hours ago',
      content: 'Comprehensive notes for CSS 2024 General Knowledge section now available.',
      type: 'new',
    },
    {
      id: 3,
      title: 'MDCAT 2024 Preparation Guide',
      date: '5 hours ago',
      content: 'Complete preparation guide and past papers for MDCAT 2024 entrance test.',
      type: 'popular',
    },
    {
      id: 4,
      title: 'O Level Mathematics Past Papers 2024',
      date: '1 day ago',
      content: 'Access the latest O Level Mathematics past papers for 2024.',
      type: 'new',
    },
  ], []);

  // Search functionality
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredData(resources);
        setSearchSuggestions([]);
      } else {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        const filtered = allResources.filter((item) =>
          searchTerms.every(
            (term) =>
              item.title.toLowerCase().includes(term) ||
              item.subject.toLowerCase().includes(term) ||
              item.class.toLowerCase().includes(term) ||
              item.board.toLowerCase().includes(term) ||
              item.year.toString().includes(term) ||
              item.author.toLowerCase().includes(term) ||
              item.category.toLowerCase().includes(term) ||
              item.province?.toLowerCase().includes(term)
          )
        );

        setFilteredData(filtered);

        if (searchTerm.length > 2) {
          const suggestions = [];

          // Subject suggestions
          subjectCategories.forEach((subject) => {
            if (subject.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: subject.name, type: 'subject' });
            }
          });

          // Board suggestions
          boardCategories.forEach((board) => {
            if (board.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: board.name, type: 'board' });
            }
          });

          // Category suggestions
          Object.keys(categoryDefinitions).forEach((category) => {
            if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.push({ text: category, type: 'category' });
            }
          });

          // Author suggestions
          const authorSuggestions = [...new Set(allResources.map((item) => item.author))]
            .filter((author) => author.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3);
          authorSuggestions.forEach((author) => {
            suggestions.push({ text: author, type: 'author' });
          });

          setSearchSuggestions(suggestions.slice(0, 8));
        } else {
          setSearchSuggestions([]);
        }
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, resources, allResources, subjectCategories, boardCategories]);

  // Auto-rotate news
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % latestNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [latestNews.length]);

  return (
    <>
      <Head>
        <title>TaleemSpot - Pakistan's #1 Educational Resource Platform | Past Papers, Notes & Study Materials</title>
        <meta
          name="description"
          content="Access comprehensive educational resources including past papers, notes, guess papers, lectures, quizzes, and study materials for 9th-12th classes, ECAT, MDCAT, CSS, NTS, and more from all Pakistani boards and institutions. Download free educational content."
        />
        <meta
          name="keywords"
          content="past papers, Punjab board, Sindh board, KPK board, Balochistan board, AJK board, Federal board, Cambridge, O Level, A Level, MDCAT, ECAT, CSS, NTS, PPSC, study notes, guess papers, pairing scheme, quizzes, lectures"
        />
        <meta property="og:title" content="TaleemSpot - Pakistan's Premier Educational Platform" />
        <meta
          property="og:description"
          content="Download past papers, notes, lectures, quizzes, and study materials for all Pakistani boards, Cambridge, and competitive exams. Free educational resources for students."
        />
        <meta property="og:url" content="https://taleemspot.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TaleemSpot - Educational Resources" />
        <meta name="twitter:description" content="Access past papers, notes, lectures, and study materials for Pakistani students" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://taleemspot.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'TaleemSpot',
              description: "Pakistan's premier educational resource platform",
              url: 'https://taleemspot.com',
              logo: 'https://firebasestorage.googleapis.com/v0/b/proskill-db056.appspot.com/o/logo.jpg?alt=media&token=77f87120-e2bd-420e-b2bd-a25f840cb3b9',
              sameAs: ['https://www.facebook.com/taleemspot', 'https://www.twitter.com/taleemspot'],
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchSuggestions={searchSuggestions}
          classCategories={classCategories}
          subjectCategories={subjectCategories}
          boardCategories={boardCategories}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              {/* Latest News Section */}
              <SidebarSection
                title="Latest News"
                subtitle={`Stay Up to Date with TaleemSpot - ${new Date().getDate()}`}
                icon={TrendingUp}
                colorScheme="red"
                showSerialNumbers={true}
                items={latestNews.map((news, index) => ({
                  name: news.title,
                  badge: index === 0 ? 'Trending News' : null,
                  href: '#',
                }))}
                viewAllLink="/all-news"
                badgeColors={{
                  'Trending News': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
                }}
              />

              {/* Classes Section */}
              <SidebarSection
                title="Classes"
                subtitle="Explore School & College Resources"
                icon={BookOpen}
                colorScheme="green"
                showSerialNumbers={true}
                items={classCategories
                  .filter((cat) => ['School', 'College'].includes(cat.category))
                  .map((cat) => ({
                    name: cat.name,
                    count: cat.count,
                    href: `/${cat.id}`,
                  }))}
                viewAllLink="/all-classes"
              />

              {/* Entry Test Section */}
              <SidebarSection
                title="Entry Test"
                subtitle="Prepare for Entry Tests"
                icon={Award}
                colorScheme="purple"
                showSerialNumbers={true}
                items={[
                  { name: 'MDCAT', count: mdcatCount, href: '/MDCAT' },
                  { name: 'ECAT', count: ecatCount, href: '/ECAT' },
                  { name: 'NUMS', count: numsCount, href: '/NUMS' },
                  { name: 'AMC', count: amcCount, href: '/AMC' },
                  { name: 'PMA', count: pmaCount, href: '/PMA' },
                ]}
                viewAllLink="/entry-tests"
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Search Results Header */}
              {searchTerm && (
                <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 text-lg">
                        Search results for: <span className="font-bold text-blue-600 dark:text-blue-400">"{searchTerm}"</span>
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Found {filteredData.length} results
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Grid - Exactly 8 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {(searchTerm ? filteredData.slice(0, 12) : filteredData.slice(0, 8)).map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}

                {filteredData.length === 0 && searchTerm && (
                  <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
                      <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-3">No results found</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">Try using different keywords or browse categories</p>
                    </div>
                  </div>
                )}

                {!searchTerm && allResources.length > 8 && <ViewAllButton href="/all-resources" />}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Competitive Exams Section */}
              <SidebarSection
                title="Competitive Exams"
                subtitle="Prepare for Competitive Exams"
                icon={Star}
                colorScheme="yellow"
                showSerialNumbers={true}
                items={[
                  { name: 'CSS', count: cssCount, href: '/CSS' },
                  { name: 'NTS', count: ntsCount, href: '/NTS' },
                  { name: 'PPSC', count: ppscCount, href: '/PPSC' },
                  { name: 'FPSC', count: '50+', href: '/FPSC' },
                  { name: 'PMS', count: '30+', href: '/PMS' },
                ]}
                viewAllLink="/competitive-exams"
              />

              {/* University Section */}
              <SidebarSection
                title="University"
                subtitle="Resources for Higher Education"
                icon={Users}
                colorScheme="blue"
                showSerialNumbers={true}
                items={classCategories
                  .filter((cat) => cat.category === 'University')
                  .map((cat) => ({
                    name: cat.name,
                    count: cat.count,
                    href: `/${cat.id}`,
                  }))}
                viewAllLink="/university"
              />

              {/* General Section */}
              <SidebarSection
                title="General"
                subtitle="Miscellaneous Resources"
                icon={BookOpen}
                colorScheme="gray"
                showSerialNumbers={true}
                items={[
                  { name: 'Urdu Calligraphy', count: '10+', href: '/UrduCalligraphy' },
                  { name: 'English Calligraphy', count: '15+', href: '/EnglishCalligraphy' },
                  { name: 'English Language', count: '20+', href: '/EnglishLanguage' },
                  { name: 'General Resources', count: '50+', href: '/general' },
                ]}
                viewAllLink="/general"
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TaleemSpot;
