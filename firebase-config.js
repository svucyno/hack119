// HealthNexus Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKROA1gOoQa3Sb6-K8hfzZSZZmeDK2PXk",
  authDomain: "healthnexus-e8a62.firebaseapp.com",
  projectId: "healthnexus-e8a62",
  storageBucket: "healthnexus-e8a62.firebasestorage.app",
  messagingSenderId: "734401986104",
  appId: "1:734401986104:web:4bb060925632ccb1e0b0cd",
  measurementId: "G-93SLTPLK3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use in script.js
export { db, auth, collection, getDocs, doc, setDoc, getDoc, updateDoc, query, orderBy, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword };
