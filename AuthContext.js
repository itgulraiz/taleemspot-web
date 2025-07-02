import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Register user with email and password
  const register = async (email, password, userData) => {
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile (displayName)
      await updateProfile(user, {
        displayName: userData.fullName
      });

      // Send email verification
      await sendEmailVerification(user);

      // Save additional user data in Firestore
      await setDoc(doc(db, "Authors", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: userData.fullName,
        username: userData.username,
        role: userData.role,
        province: userData.province,
        education: userData.education,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        bio: ""
      });

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userRef = doc(db, "Authors", user.uid);
      const userDoc = await getDoc(userRef);

      // If user doesn't exist in Firestore, create a new document
      if (!userDoc.exists()) {
        // Get the username from email (before @)
        const username = user.email.split('@')[0];

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || "",
          username: username,
          role: "",  // Need to collect this after Google sign-in
          province: "",  // Need to collect this after Google sign-in
          education: "",  // Need to collect this after Google sign-in
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified,
          bio: ""
        });
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Log out
  const logout = () => {
    return signOut(auth);
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (!currentUser) throw new Error("No authenticated user");
      
      const userRef = doc(db, "Authors", currentUser.uid);
      
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update the local state
      setUserProfile(prevState => ({
        ...prevState,
        ...data
      }));
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, "Authors", uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserProfile(userData);
        return userData;
      } else {
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    signInWithGoogle,
    logout,
    updateUserProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
