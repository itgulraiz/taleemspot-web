import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID
};

// Initialize Firebase properly
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // ADDED EXPORT
export const db = getFirestore(app); // REMOVED auth parameter
