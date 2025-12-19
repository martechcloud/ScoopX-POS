import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const db = window.firebaseDB || getFirestore();
  const poForm = document.getElementById("poForm");

  // 🧩 Generate random IDs
  function generateWastageID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WST-${random}`;
  }

  function generateRandomId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${random}`;
  }

  const recordID = generateWastageID();

  // 🧾 Function to store record in Inventory Logs
  async function saveInventoryLog(item) {
    const logId = generateRandomId();
    const date = new Date().toISOString();

    try {
      await setDoc(doc(collection(db, "INVENTORY_LOGS_DATA_TABLE"), logId), {
        INVENTORY_LOG_ID: logId,
        PRODUCT_ID: item.productId || "",
        TRANSACTION_TYPE: "waste",
        PRODUCT_QUANTITY: item.quantity || 0,
        DIRECTION: "out",
        SOURCE: "WASTAGE_DATA_TABLE",
        sourceId: recordID,
        CREATED_AT: date,
      });

      console.log("✅ Inventory log added:", logId);
    } catch (error) {
      console.error("❌ Error adding inventory log:", error);
    }
  }

  // 💾 Handle wastage form submission
  poForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productID = document.querySelector(".productSearch3").value.trim();
    const productName = document.getElementById("supplierSearch").value.trim();
    const quantityLost = parseFloat(
      document.querySelector(".quantityValue").value
    );
    const quantityUnit = document.getElementById("quantityUnit").value.trim();
    const reason = document.getElementById("reason").value.trim();
    const userName = document.getElementById("username").value.trim();

    if (!productID || !quantityLost || !reason || !userName) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields before saving.",
      });
      return;
    }

    try {
      // 📄 Save to Wastage Table
      const recordRef = doc(collection(db, "WASTAGE_DATA_TABLE"), recordID);
      await setDoc(recordRef, {
        RECORD_ID: recordID,
        PRODUCT_ID: productID,
        PRODUCT_NAME: productName,
        QUANTITY_LOST: quantityLost,
        PRODUCT_UNIT: quantityUnit,
        WASTAGE_REASON: reason,
        USER_NAME: userName,
        CREATED_AT: serverTimestamp(),
      });

      // 📦 Also log into Inventory Logs
      await saveInventoryLog({
        productId: productID,
        quantity: quantityLost,
      });

      // 🎉 Success alert
      await Swal.fire({
        icon: "success",
        title: "Wastage Logged!",
        text: `Record ${recordID} has been saved & logged in inventory.`,
        timer: 2000,
        showConfirmButton: false,
      });

      poForm.reset();
      document.getElementById("po-id").value = recordID;
    } catch (error) {
      console.error("❌ Error saving record:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save wastage record. Please try again.",
      });
    }
  });
});
