// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFjNzywyq6C-MjgBIFJLCr-tT73LDTDVU",
    authDomain: "cpinventory-8b833.firebaseapp.com",
    projectId: "cpinventory-8b833",
    storageBucket: "cpinventory-8b833.firebasestorage.app",
    messagingSenderId: "6897849274",
    appId: "1:6897849274:web:027455691a9b6e197c0383",
    measurementId: "G-FXEC1H10QP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);