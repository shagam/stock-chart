import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBOkIZfHvdrJmuaPFPFdwQgoEYDsJD7ptI",
  authDomain: "stocks-663a6.firebaseapp.com",
  projectId: "stocks-663a6",
  storageBucket: "stocks-663a6.appspot.com",
  messagingSenderId: "750108366853",
  appId: "1:750108366853:web:4c55452920b28d5ecee46c",
  measurementId: "G-TLKF8JLME0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);