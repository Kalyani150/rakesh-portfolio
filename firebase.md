// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNOAE4GGuEpI-t_qYnL45fL1jSDOoi8_E",
  authDomain: "portfolio-7d1ed.firebaseapp.com",
  databaseURL: "https://portfolio-7d1ed-default-rtdb.firebaseio.com",
  projectId: "portfolio-7d1ed",
  storageBucket: "portfolio-7d1ed.firebasestorage.app",
  messagingSenderId: "465140880633",
  appId: "1:465140880633:web:5b96162261b80c81d77e28",
  measurementId: "G-D94T0MCYKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);