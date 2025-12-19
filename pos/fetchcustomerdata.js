import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB; // ✅ Global Firestore instance

// Global variable to store fetched data
window.customerTable = [];

function listenToCustomerTable() {
  console.log("👂 Setting up real-time listener for CUSTOMER_DATA_TABLE...");

  const colRef = collection(db, "CUSTOMER_DATA_TABLE");

  onSnapshot(
    colRef,
    (snapshot) => {
      window.customerTable = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("🔄 Real-time customer table updated:", window.customerTable);
    },
    (error) => {
      console.error("❌ Real-time listener error:", error);
    }
  );
}

// Start real-time listener when page loads
document.addEventListener("DOMContentLoaded", listenToCustomerTable);
