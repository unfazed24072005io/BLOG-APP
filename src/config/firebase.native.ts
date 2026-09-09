import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAzLkCDF5fcuuI8EJvfgDEpieH0mEZICAU",
  authDomain: "blog-app-55355.firebaseapp.com",
  projectId: "blog-app-55355",
  storageBucket: "blog-app-55355.firebasestorage.app",
  messagingSenderId: "170320183967",
  appId: "1:170320183967:android:f8c818bdeb03364cd698aa"
};

const app = initializeApp(firebaseConfig);

export const auth = auth(app);
export const db = firestore(app);
export const storage = storage(app);
export default app;