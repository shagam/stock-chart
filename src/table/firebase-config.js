import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { getFirestore } from '@firebase/firestore'
// require ('dotenv').config();
const firebaseConfig = {
  apiKey:  process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain:  process.env.REACT_APP_FIREBASE_authDomain,
  projectId:  process.env.REACT_APP_FIREBASE_projectId,
  storageBucket:  process.env.REACT_APP_FIREBASE_storageBucket,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_messagingSenderId,
  appId:  process.env.REACT_APP_FIREBASE_appId,
  measurementId:  process.env.REACT_APP_FIREBASE_measurementId
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
