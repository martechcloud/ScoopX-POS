import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB || getFirestore();

// 🔹 Helper: Generate random alphanumeric ID
function generateRandomId(prefix) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-btn");

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // 🧾 Collect Supplier Details
    const poId = document.getElementById("po-id")?.value.trim() || "";
    const supplierInput = document.getElementById("supplierSearch");
    const supplierName = supplierInput?.value.trim() || "";
    const supplierId = supplierInput?.dataset.supplierId || "";
    const orderDate = document.getElementById("created-at")?.value.trim() || "";

    if (!supplierName || !supplierId || !orderDate) {
      alert(
        "Please fill Supplier (with valid ID) and Order Date before submitting."
      );
      return;
    }

    // 🧩 Collect Product Rows
    const productRows = document.querySelectorAll(".product-row");
    const items = [];

    productRows.forEach((row) => {
      const productInput = row.querySelector(".productSearch");
      const quantityValue = row.querySelector(".quantityValue");
      const quantityUnit = row.querySelector(".quantityUnit");
      const unitCost = row.querySelector(".unit-cost");

      const productId =
        productInput?.dataset.productId || productInput?.value?.trim();
      const quantity = parseFloat(quantityValue?.value || 0);
      const unit = quantityUnit?.value?.trim() || "";
      const cost = parseFloat(unitCost?.value || 0);

      if (productId && quantity > 0 && cost > 0) {
        items.push({ productId, quantity, unit, cost });
      }
    });

    if (!items.length) {
      alert("Please add at least one product row before submitting.");
      return;
    }

    const PURId = generateRandomId("PUR");

    try {
      // ✅ Add each item to Purchase + Inventory logs
      for (const item of items) {
        const purchaseDocId = generateRandomId("PUR");

        const purchaseRecord = {
          poId: PURId,
          supplierId,
          supplierName,
          orderDate,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          cost: item.cost,
          total: item.quantity * item.cost,
          createdAt: serverTimestamp(),
        };

        // 🔹 Save Purchase Record
        await setDoc(
          doc(collection(db, "PURCHASE_DATA_TABLE"), purchaseDocId),
          purchaseRecord
        );

        // 🔹 Add matching Inventory Log
        const inventoryLogId = generateRandomId("INV");

        const inventoryRecord = {
          id: inventoryLogId,
          productId: item.productId,
          quantity: item.quantity,
          direction: "in",
          transactionType: "purchase",
          source: "Purchase",
          sourceId: PURId,
          date: new Date().toISOString(),
        };

        await setDoc(
          doc(collection(db, "INVENTORY_LOGS_DATA_TABLE"), inventoryLogId),
          inventoryRecord
        );
      }

      console.log("✅ Purchase + Inventory Logs Added Successfully");

      // ✅ SweetAlert confirmation
      await Swal.fire({
        icon: "success",
        title: "Purchase Saved!",
        text: "All Purchase and Inventory Logs have been created.",
        confirmButtonColor: "#d94b86",
      });

      // 🧹 Reset everything
      document.getElementById("po-id").value = "";
      supplierInput.value = "";
      supplierInput.dataset.supplierId = "";
      document.getElementById("created-at").value = "";

      const allRows = document.querySelectorAll(".product-row");
      allRows.forEach((row, index) => {
        if (index === 0) {
          row.querySelector(".productSearch").value = "";
          row.querySelector(".productSearch").dataset.productId = "";
          row.querySelector(".quantityValue").value = "";
          row.querySelector(".quantityUnit").value = "";
          row.querySelector(".unit-cost").value = "";
        } else {
          row.remove();
        }
      });
    } catch (error) {
      console.error("❌ Error adding records:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add records. Check console for details.",
      });
    }
  });
});
