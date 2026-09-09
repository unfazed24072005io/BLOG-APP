import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAzLkCDF5fcuuI8EJvfgDEpieH0mEZICAU",
  authDomain: "blog-app-55355.firebaseapp.com",
  projectId: "blog-app-55355",
  storageBucket: "blog-app-55355.firebasestorage.app",
  messagingSenderId: "170320183967",
  appId: "1:170320183967:android:f8c818bdeb03364cd698aa"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;