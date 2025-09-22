import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC_D82abt5-ctidnSenK2_i-fRqSoUu3E8",
  authDomain: "edu-nft-1e358.firebaseapp.com",
  projectId: "edu-nft-1e358",
  storageBucket: "edu-nft-1e358.firebasestorage.app",
  messagingSenderId: "285745583837",
  appId: "1:285745583837:web:f90d9b6db7554d009a6d34",
  measurementId: "G-Y4RCRYY7TJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
