import {
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB; // ✅ use your global Firestore instance

// Global variable to store fetched data
window.supplierTable = [];

async function fetchSupplier() {
  try {
    const querySnapshot = await getDocs(collection(db, "SUPPLIER_DATA_TABLE"));
    window.supplierTable = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ supplierTable fetched:", window.supplierTable);
  } catch (error) {
    console.error("❌ Error fetching supplierTable:", error);
  }
}

// Fetch once when page loads
document.addEventListener("DOMContentLoaded", fetchSupplier);
