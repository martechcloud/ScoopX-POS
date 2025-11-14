// ✅ Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAOjTCwbLka0sfO6eEnfXZmGcwE2yMJwSA",
  authDomain: "scoopx-ice-cream-cafe.firebaseapp.com",
  projectId: "scoopx-ice-cream-cafe",
  storageBucket: "scoopx-ice-cream-cafe.firebasestorage.app",
  messagingSenderId: "800499847619",
  appId: "1:800499847619:web:8008e9016d125f924c2d76",
};

// ✅ Initialize Firebase App and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Expose globally for other scripts
window.firebaseApp = app;
window.firebaseDB = db;

console.log("🔥 Firebase (App + Firestore) initialized globally");
