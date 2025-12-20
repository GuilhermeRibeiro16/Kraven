import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMTrJvYzw1AycKgvf4nGwjtTdH8JitQlM",
  authDomain: "kraven-1b615.firebaseapp.com",
  projectId: "kraven-1b615",
  storageBucket: "kraven-1b615.firebasestorage.app",
  messagingSenderId: "733130039648",
  appId: "1:733130039648:web:ad6f0e08e9f040c6b5fe05"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;