import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9enEjUHIoSCfyYIpfnBBCUrNyDw5oU38",
  authDomain: "la-llave-del-exito-452c2.firebaseapp.com",
  projectId: "la-llave-del-exito-452c2",
  storageBucket: "la-llave-del-exito-452c2.firebasestorage.app",
  messagingSenderId: "451297126049",
  appId: "1:451297126049:web:9d0f661b59db0ab120f2e0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
