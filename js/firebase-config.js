import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, onSnapshot, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkC4JI5zC5HbNZ9ryaNicrTjjgP1VQWtw",
  authDomain: "student-council-6d488.firebaseapp.com",
  projectId: "student-council-6d488",
  storageBucket: "student-council-6d488.firebasestorage.app",
  messagingSenderId: "682214432800",
  appId: "1:682214432800:web:a9f9ac756ea7c61b1d9c45",
  measurementId: "G-0VKP5368VF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  db, auth, 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, 
  onSnapshot, query, where, orderBy, limit, 
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
};
