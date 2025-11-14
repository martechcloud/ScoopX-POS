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

  // 🧩 Generate random Supplier ID
  function generateSupplierID() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SPL-${random}`;
  }

  // 💾 Handle form submission
  poForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ Collect values
    const supplierID = generateSupplierID();
    const supplierName = document.getElementById("suppliername").value.trim();
    const supplierPhone = document.getElementById("supplierphone").value.trim();
    const supplierAddress = document
      .getElementById("supplieraddress")
      .value.trim();
    const supplierGST = document.getElementById("suppliergst").value.trim();

    // 🧠 Basic Validation
    if (!supplierName || !supplierPhone) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter at least supplier name and phone number!",
      });
      return;
    }

    try {
      // 📄 Create a document reference with custom ID
      const supplierRef = doc(
        collection(db, "SUPPLIER_DATA_TABLE"),
        supplierID
      );

      // 🔥 Add to Firestore
      await setDoc(supplierRef, {
        SUPPLIER_ID: supplierID,
        SUPPLIER_NAME: supplierName,
        SUPPLIER_PHONE: supplierPhone,
        SUPPLIER_ADDRESS: supplierAddress,
        SUPPLIER_GST: supplierGST,
        CREATED_AT: serverTimestamp(),
      });

      // 🎉 Success Swal
      await Swal.fire({
        icon: "success",
        title: "Supplier Added!",
        text: `Supplier ${supplierName} has been successfully added.`,
        timer: 2000,
        showConfirmButton: false,
      });

      // 🔁 Reset form
      poForm.reset();

      // ✅ Show generated ID in the disabled input
      document.getElementById("po-id").value = supplierID;
    } catch (error) {
      console.error("❌ Error adding supplier:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add supplier. Please try again.",
      });
    }
  });
});
