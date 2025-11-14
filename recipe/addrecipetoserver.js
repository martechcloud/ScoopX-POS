import {
  getFirestore,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB;

// ✅ Generate random recipe ID (e.g., RCP-12345)
function generateRecipeID() {
  return `RCP-${Math.floor(10000 + Math.random() * 90000)}`;
}

document
  .getElementById("poForm1")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const recipeIDField = document.getElementById("po-id");
    const productInput = document.querySelector(".productSearch3"); // main product field
    const productId = productInput?.value?.trim();

    if (!productId) {
      Swal.fire("⚠️ Error", "Please select a main Product ID!", "warning");
      return;
    }

    const recipeID =
      recipeIDField.value && recipeIDField.value.startsWith("RCP-")
        ? recipeIDField.value
        : generateRecipeID();
    recipeIDField.value = recipeID;

    const rows = document.querySelectorAll("#productRows .product-row");

    if (!rows.length) {
      Swal.fire("⚠️ Error", "Please add at least one ingredient!", "warning");
      return;
    }

    try {
      const recipeRef = collection(db, "RECIPE_DATA_TABLE");

      // 🧹 Step 1: Delete existing recipe records for this product
      const q = query(recipeRef, where("PRODUCT_ID", "==", productId));
      const existingSnap = await getDocs(q);

      const deletePromises = existingSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "RECIPE_DATA_TABLE", docSnap.id))
      );
      await Promise.all(deletePromises);

      console.log(
        `🗑 Deleted ${deletePromises.length} old recipe records for ${productId}`
      );

      // 🪄 Step 2: Add fresh ingredient records
      const addPromises = [];
      for (const row of rows) {
        const ingredientId =
          row.querySelector(".productSearch")?.value?.trim() || "";
        const ingredientName =
          row.querySelector(".productSearch4")?.value?.trim() || "";
        const deductionQty =
          parseFloat(row.querySelector(".quantityValue")?.value) || 0;
        const unit = row.querySelector(".quantityUnit")?.value?.trim() || "";

        if (!ingredientId || !deductionQty) continue;

        const data = {
          RECIPE_ID: recipeID,
          PRODUCT_ID: productId,
          INGREDIENT_ID: ingredientId,
          INGREDIENT_NAME: ingredientName,
          DEDUCTION_QUANTITY: deductionQty,
          UNIT: unit,
          CREATED_AT: new Date().toLocaleString("en-IN"),
        };

        const customDocId = `${recipeID}_${ingredientId}`;
        const docRef = doc(db, "RECIPE_DATA_TABLE", customDocId);
        addPromises.push(setDoc(docRef, data));
      }

      await Promise.all(addPromises);

      Swal.fire("✅ Success", "Recipe saved successfully!", "success");
      console.log("🍳 All recipe records added:", addPromises.length);
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
      Swal.fire("❌ Error", "Failed to save recipe!", "error");
    }
  });
