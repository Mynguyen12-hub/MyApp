import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4",
  authDomain: "flower-30f60.firebaseapp.com",
  projectId: "flower-30f60",
  storageBucket: "flower-30f60.firebasestorage.app",
  messagingSenderId: "899582071314",
  appId: "1:899582071314:web:897c29f1c48e85d12dfecb",
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);