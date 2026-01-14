import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "xxxxx",
  appId: "1:xxxxx:web:xxxxx",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
