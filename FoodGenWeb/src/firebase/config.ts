import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0heootIW6A4L324dNq_w_AWoXtoDimVU",
  authDomain: "foodgen-85dbb.firebaseapp.com",
  projectId: "foodgen-85dbb",
  storageBucket: "foodgen-85dbb.firebasestorage.app",
  messagingSenderId: "703155908420",
  appId: "1:703155908420:web:c557aa9c0b08c803143111"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;