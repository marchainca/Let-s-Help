import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
    apiKey: "AIzaSyBiaWOJY3ezMeZFzDFOjskuzuazwqNqJOE",
    authDomain: "let-s-help-433a1.firebaseapp.com",
    projectId: "let-s-help-433a1",
    storageBucket: "let-s-help-433a1.firebasestorage.app",
    messagingSenderId: "426593397894",
    appId: "1:426593397894:web:cb35cd7f94fc683b6ef507",
    measurementId: "G-JYN5QDSTZH"
  };

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
