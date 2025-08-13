// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: 'recruitassist-ai-knbnk',
  appId: '1:798548224026:web:fae9ac51adbeb04256c9a3',
  storageBucket: 'recruitassist-ai-knbnk.appspot.com',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'recruitassist-ai-knbnk.firebaseapp.com',
  measurementId: 'G-VP8D5Y9W9J',
  messagingSenderId: '798548224026',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, firestore, storage, auth };
