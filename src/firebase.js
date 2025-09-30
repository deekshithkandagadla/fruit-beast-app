// Firebase config and initialization for fruit logging
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: Replace with your actual Firebase config
  apiKey: "AIzaSyC_ANIDvhtIu5aHu0osIvCBtAt8auqx9Xw",
  authDomain: "fruit-beast.firebaseapp.com",
  projectId: "fruit-beast",
  storageBucket: "fruit-beast.firebasestorage.app",
  messagingSenderId: "1013290434742",
  appId: "1:1013290434742:web:556be76b3c0dac390d2617",
  measurementId: "G-KXQZC58NE4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };