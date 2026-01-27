import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBTEuWu17SpgGpD3hXWQPifoRW8_lfOvAQ",
    authDomain: "somali-student-hub.firebaseapp.com",
    projectId: "somali-student-hub",
    storageBucket: "somali-student-hub.firebasestorage.app",
    messagingSenderId: "337915773865",
    appId: "1:337915773865:web:9c744e6760daa989b37ab8",
    measurementId: "G-T589TQ45S4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
