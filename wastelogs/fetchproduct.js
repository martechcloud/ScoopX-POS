import {
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB; // ✅ use your global Firestore instance

// Global variable to store fetched data
window.productTable = [];

async function fetchProductTable() {
  try {
    console.log("📦 Fetching product table from Firestore...");
    const querySnapshot = await getDocs(collection(db, "PRODUCT_DATA_TABLE")); // 🔁 Replace 'products' with your collection name

    window.productTable = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Product table fetched:", window.productTable);
  } catch (error) {
    console.error("❌ Error fetching product table:", error);
  }
}

// Fetch once when page loads
document.addEventListener("DOMContentLoaded", fetchProductTable);
