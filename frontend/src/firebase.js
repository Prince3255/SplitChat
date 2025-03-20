// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "splitchat-158f7.firebaseapp.com",
  projectId: "splitchat-158f7",
  storageBucket: "splitchat-158f7.firebasestorage.app",
  messagingSenderId: "554150039228",
  appId: "1:554150039228:web:3bbe260585adf4a28d0ab9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);