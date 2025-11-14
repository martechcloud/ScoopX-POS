// After complete order this saves the data to server

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Ensure db is properly initialized
const db = window.firebaseDB || getFirestore();

// ✅ Random ID generator (used for inventory logs)
function generateRandomId() {
  const prefix = "INV-";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix + randomPart;
}

async function completeOrder() {
  const { value: formValues } = await Swal.fire({
    title: "🧾 Customer Details",
    html: `
            <style>
              .swal2-product-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px 15px;
                margin-top: 10px;
                background: #f9fafc;
                padding: 18px;
                border-radius: 14px;
                box-shadow: inset 0 0 6px rgba(0,0,0,0.05);
              }
              .swal2-product-form input[type="text"],
              .swal2-product-form input[type="number"],
              .swal2-product-form select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d0d7de;
                border-radius: 8px;
                font-size: 14px;
                background: #fff;
                transition: all 0.25s ease;
              }
              .swal2-product-form input:focus,
              .swal2-product-form select:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                outline: none;
              }
              @media (max-width: 600px) {
                .swal2-product-form {
                  grid-template-columns: 1fr;
                  padding: 12px;
                }
              }
              .swal2-popup.custom-swal-width {
                width: 700px !important;
                max-width: 95%;
                border-radius: 18px;
                padding: 25px !important;
              }

              .swal2-confirm {
                background-color: #D94B86 !important;
                border: none !important;
                font-weight: 600 !important;
              }
            </style>

            <div class="swal2-product-form">
              <input id="swal-name" type="text" placeholder="Customer Name (optional)">
              <input id="swal-phone" type="text" placeholder="Phone Number (optional)" maxlength="10">
            </div>
          `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "💾 Submit",
    cancelButtonText: "Cancel",
    customClass: { popup: "custom-swal-width" },
    preConfirm: () => {
      const name = document.getElementById("swal-name").value.trim();
      const phone = document.getElementById("swal-phone").value.trim();
      if (phone && !/^[0-9]{10}$/.test(phone)) {
        Swal.showValidationMessage(
          "Please enter a valid 10-digit phone number"
        );
        return false;
      }
      return { name, phone };
    },
  });

  if (!formValues) return; // user canceled

  // ✅ Collect billing data
  const billingTable = document.querySelector(".styled-table tbody");
  const rows = billingTable?.querySelectorAll("tr") || [];
  const draftData = [];

  // Get stored products from session
  const storedProducts = JSON.parse(sessionStorage.getItem("products")) || [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      const productName = cells[0]?.innerText.trim() || "";
      const quantity =
        cells[1]?.querySelector("input")?.value ||
        cells[1]?.innerText.trim() ||
        "0";
      const total = cells[2]?.innerText.replace("₹", "").trim() || "0";
      const freewill =
        cells[3]?.querySelector("input[type='checkbox']")?.checked || false;
      const wave = cells[4]?.querySelector("select")?.value || "0";

      const matchedProduct = storedProducts.find(
        (p) => p.PRODUCT_NAME === productName
      );

      const productId =
        matchedProduct?.productId || matchedProduct?.PRODUCT_ID || null;

      draftData.push({
        productId,
        productName,
        quantity: parseInt(quantity) || 0,
        total: parseFloat(total) || 0,
        freewill,
        wave,
      });
    }
  });

  const discount = parseFloat(
    document.getElementById("bill-discount")?.value || "0"
  );
  const roundOff = parseFloat(
    document.getElementById("round-off")?.value || "0"
  );
  const subtotal = parseFloat(
    document.getElementById("subtotal")?.innerText || "0"
  );

  try {
    // ✅ Save complete order to Firestore
    await addDoc(collection(db, "COMPLETE_ORDER_TABLE"), {
      customerName: formValues.name || "N/A",
      customerPhone: formValues.phone || "N/A",
      items: draftData,
      discount,
      roundOff,
      subtotal,
      timestamp: serverTimestamp(),
    });

    // ✅ Upload to inventory logs
    await uploadDraftDataToFirestore(draftData);

    await Swal.fire({
      icon: "success",
      title: "Order Complete ✅",
      html: `
              <b>Name:</b> ${formValues.name || "N/A"}<br>
              <b>Phone:</b> ${formValues.phone || "N/A"}
            `,
      confirmButtonText: "OK",
      customClass: { popup: "custom-swal-width" },
    });

    console.log("✅ Order saved successfully!");
    if (typeof resetBill === "function") resetBill();
  } catch (error) {
    console.error("❌ Error saving order:", error);
    Swal.fire("Error", "Failed to save order. Please try again.", "error");
  }
}

// 🧾 Upload inventory logs
async function uploadDraftDataToFirestore(draftData) {
  if (!Array.isArray(draftData) || draftData.length === 0) return;
  const date = new Date().toISOString();

  for (const item of draftData) {
    try {
      const record = {
        id: generateRandomId(),
        productId: item.productId || "",
        transactionType: "sale",
        quantity: item.quantity || 0,
        direction: "out",
        date,
      };

      await setDoc(doc(db, "INVENTORY_LOGS_DATA_TABLE", record.id), record);
      console.log(`✅ Uploaded: ${record.productId} (${record.id})`);
    } catch (error) {
      console.error("❌ Error uploading record:", error);
    }
  }
  console.log("🔥 All records uploaded successfully!");
}
// ✅ Make function globally accessible
window.completeOrder = completeOrder;
