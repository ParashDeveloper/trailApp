import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCuh58vl-euQCxMauunPgKywDxHisdrq18",
  authDomain: "rajumarwadi-d079b.firebaseapp.com",
  projectId: "rajumarwadi-d079b",
  storageBucket: "rajumarwadi-d079b.appspot.com",
  messagingSenderId: "10704285338",
  appId: "1:10704285338:web:92b750397ad0656bcf7923",
  measurementId: "G-YYM1PGCJRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { app, db, auth };
