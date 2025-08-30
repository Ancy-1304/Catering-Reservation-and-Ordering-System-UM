import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4fsKBJ3HhCxtnUdViU_XaSZwd3IWJa34",
  authDomain: "catering-app-93c04.firebaseapp.com",
  projectId: "catering-app-93c04",
  storageBucket: "catering-app-93c04.appspot.com",
  messagingSenderId: "697779187652",
  appId: "1:697779187652:web:7f40df15efd0f2b642fe91",
  measurementId: "G-QWJ1SCC931"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);