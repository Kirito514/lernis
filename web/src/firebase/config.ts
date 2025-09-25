import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyC_D82abt5-ctidnSenK2_i-fRqSoUu3E8",
  authDomain: "edu-nft-1e358.firebaseapp.com",
  projectId: "edu-nft-1e358",
  storageBucket: "edu-nft-1e358.firebasestorage.app",
  messagingSenderId: "285745583837",
  appId: "1:285745583837:web:f90d9b6db7554d009a6d34",
  measurementId: "G-Y4RCRYY7TJ"
};

// Firebase'ni initialize qilish
const app = initializeApp(firebaseConfig);

// Firebase xizmatlarini export qilish
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
