// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmgXbT57B18rYP8ASZrOEm98JpoNW-Awo",
  authDomain: "keychains-by-bogy.firebaseapp.com",
  projectId: "keychains-by-bogy",
  storageBucket: "keychains-by-bogy.firebasestorage.app",
  messagingSenderId: "425704462613",
  appId: "1:425704462613:web:e08ffbb7cb1a08d68e311c",
  measurementId: "G-301LJMR1FF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
console.log(analytics);
