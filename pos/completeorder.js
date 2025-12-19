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
        position: relative;
        overflow: visible !important;
      }

      .swal2-product-form input[type="text"] {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d0d7de;
        border-radius: 8px;
        font-size: 14px;
        background: #fff;
        transition: all 0.25s ease;
      }

      .swal2-product-form input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        outline: none;
      }

      /* WRAPPER AROUND INPUTS MUST ALLOW OVERFLOW */
      .swal2-product-form > div {
        position: relative !important;
        overflow: visible !important;
      }

      /* DROPDOWN FIXED */
      .suggestion-box {
        position: absolute !important;
        top: 100%;          /* Always below input */
        left: 0;
        width: 100%;
        z-index: 999999999 !important;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        max-height: 150px;
        overflow-y: auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .suggestion-item {
        padding: 8px 10px;
        cursor: pointer;
      }

      .suggestion-item:hover {
        background: #f4f4f4;
      }

      @media (max-width: 600px) {
        .swal2-product-form {
          grid-template-columns: 1fr;
        }
      }

      /* SweetAlert must allow overflow outside the popup */
      .swal2-popup.custom-swal-width,
      .swal2-popup.swal2-modal,
      .swal2-container,
      .swal2-html-container {
        overflow: visible !important;
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
        <div style="position:relative;">
          <input id="swal-name" type="text" placeholder="Customer Name (optional)" autocomplete="off">
          <div id="name-suggestions" class="suggestion-box"></div>
        </div>

        <div style="position:relative;">
          <input id="swal-phone" type="text" placeholder="Phone Number (optional)" maxlength="10" autocomplete="off">
          <div id="phone-suggestions" class="suggestion-box"></div>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "💾 Submit",
    cancelButtonText: "Cancel",
    customClass: { popup: "custom-swal-width" },

    didOpen: () => {
      const nameInput = document.getElementById("swal-name");
      const phoneInput = document.getElementById("swal-phone");
      const nameBox = document.getElementById("name-suggestions");
      const phoneBox = document.getElementById("phone-suggestions");

      // Search Helpers
      const searchByName = (text) =>
        window.customerTable.filter((c) =>
          c.CUSTOMER_NAME.toLowerCase().includes(text.toLowerCase())
        );

      const searchByPhone = (text) =>
        window.customerTable.filter((c) => c.CUSTOMER_PHONE.includes(text));

      const renderSuggestions = (list, box, type) => {
        box.innerHTML = "";
        if (!list.length) return;

        list.forEach((customer) => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.textContent =
            type === "name"
              ? `${customer.CUSTOMER_NAME} (${customer.CUSTOMER_PHONE})`
              : `${customer.CUSTOMER_PHONE} (${customer.CUSTOMER_NAME})`;

          div.addEventListener("click", () => {
            nameInput.value = customer.CUSTOMER_NAME;
            phoneInput.value = customer.CUSTOMER_PHONE;
            box.innerHTML = "";
          });

          box.appendChild(div);
        });
      };

      // Name Input Typing
      nameInput.addEventListener("input", () => {
        const val = nameInput.value.trim();
        if (!val) return (nameBox.innerHTML = "");
        const results = searchByName(val);
        renderSuggestions(results, nameBox, "name");
      });

      // Phone Input Typing
      phoneInput.addEventListener("input", () => {
        const val = phoneInput.value.trim();
        if (!val) return (phoneBox.innerHTML = "");
        const results = searchByPhone(val);
        renderSuggestions(results, phoneBox, "phone");
      });

      // Clicking outside hides dropdown
      document.addEventListener("click", (e) => {
        if (!nameInput.contains(e.target)) nameBox.innerHTML = "";
        if (!phoneInput.contains(e.target)) phoneBox.innerHTML = "";
      });
    },

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
  const name = document.getElementById("swal-name").value.trim();
  const phone = document.getElementById("swal-phone").value.trim();

  window.transactionId = null;

  try {
    let customerId = null;

    // 🔍 Check if customer already exists
    const existingCustomer = window.customerTable.find(
      (c) => c.CUSTOMER_PHONE === phone
    );

    if (existingCustomer) {
      // ✔ Existing customer
      customerId = existingCustomer.CUSTOMER_ID;
      console.log("Existing customer → ID:", customerId);
    } else {
      // ✔ New customer → Create ID
      customerId =
        "CUST_" + Math.random().toString(36).substring(2, 10).toUpperCase();

      // ⭐ Save NEW customer (Document ID = customerId)
      await setDoc(doc(db, "CUSTOMER_DATA_TABLE", customerId), {
        CUSTOMER_ID: customerId,
        CUSTOMER_NAME: name || "N/A",
        CUSTOMER_PHONE: phone || "N/A",
        REGISTERED_AT: serverTimestamp(),
      });

      console.log("New customer added → ID:", customerId);
    }

    // 🔹 Create unique order/transaction ID
    transactionId =
      "TRX_" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // ⭐ Save ORDER with Document ID = transactionId (to avoid overwriting)
    await setDoc(doc(db, "TRANSACTIONS_DATA_TABLE", transactionId), {
      TRANSACTION_ID: transactionId,
      CUSTOMER_ID: customerId,
      ITEMS: draftData,
      DISCOUNT_AMOUNT: discount,
      ADJUSTMENT_AMOUNT: roundOff,
      TOTAL_AMOUNT: subtotal,
      CREATED_AT: serverTimestamp(),
    });

    // 🔄 Upload items separately if required
    await uploadDraftDataToFirestore(draftData);

    // 🎉 Success alert
    await Swal.fire({
      icon: "success",
      title: "Order Complete ✅",
      html: `
      <b>Name:</b> ${name || "N/A"}<br>
      <b>Phone:</b> ${phone || "N/A"}<br>
      <b>Customer ID:</b> ${customerId}<br>
      <b>Transaction ID:</b> ${transactionId}
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
        INVENTORY_LOG_ID: generateRandomId(),
        PRODUCT_ID: item.productId || "",
        TRANSACTION_TYPE: "sale",
        PRODUCT_QUANTITY: item.quantity || 0,
        DIRECTION: "out",
        SOURCE: "TRANSACTION_DATA_TABLE",
        SOURCE_ID: transactionId,
        CREATED_AT: date,
      };

      await setDoc(
        doc(db, "INVENTORY_LOGS_DATA_TABLE", record.INVENTORY_LOG_ID),
        record
      );
    } catch (error) {
      console.error("❌ Error uploading record:", error);
    }
  }
  console.log("🔥 All records uploaded successfully!");
}
// ✅ Make function globally accessible
window.completeOrder = completeOrder;
