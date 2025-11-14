import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB; // ✅ use your global Firestore instance

// Global variable to store live data
window.recipeTable = [];

// 🔄 Real-time listener for RECIPE_DATA_TABLE
function listenToRecipeTable() {
  console.log("👂 Listening for live recipe table updates...");

  const recipeRef = collection(db, "RECIPE_DATA_TABLE");

  onSnapshot(
    recipeRef,
    (snapshot) => {
      window.recipeTable = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Live recipe table updated:", window.recipeTable);
    },
    (error) => {
      console.error("❌ Error listening to recipe table:", error);
    }
  );
}

// Start listener when page loads
document.addEventListener("DOMContentLoaded", listenToRecipeTable);
