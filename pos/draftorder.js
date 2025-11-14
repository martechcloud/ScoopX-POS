// This drafts order to the server

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const db = window.firebaseDB; // ✅ use global reference
  const draftBtn = document.getElementById("draft-btn");
  if (draftBtn) draftBtn.addEventListener("click", saveDraft);

  async function saveDraft() {
    const tableNumber = sessionStorage.getItem("tableNumber");
    unlockTable(tableNumber);
    if (!tableNumber) {
      alert(
        "⚠️ Table number not found. Please select a table before saving draft."
      );
      return;
    }

    const billingTable = document.querySelector(".styled-table tbody");
    if (!billingTable) {
      alert("⚠️ Billing table not found.");
      return;
    }

    const rows = billingTable.querySelectorAll("tr");
    const draftData = [];

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

        draftData.push({
          productName,
          quantity: parseInt(quantity) || 0,
          total: parseFloat(total) || 0,
          freewill,
          wave,
        });
      }
    });

    const discount = document.getElementById("bill-discount")?.value || "0";
    const roundOff = document.getElementById("round-off")?.value || "0";
    const subtotal = document.getElementById("subtotal")?.innerText || "0";

    const now = new Date();
    const draftObject = {
      tableNumber,
      products: draftData,
      discount,
      roundOff,
      subtotal,
      draftedAt: {
        iso: now.toISOString(),
        local: now.toLocaleString(),
      },
      createdAt: serverTimestamp(),
    };

    try {
      // ✅ Save into your Firestore collection `POS` under the database `ScoopX Ice Cream Cafe`
      await setDoc(doc(db, "POS", tableNumber), draftObject);

      console.log("💾 Draft saved to Firestore:", draftObject);

      // ✅ SweetAlert Confirmation
      let timerInterval;
      Swal.fire({
        title: "We're saving your order!",
        html: "Your order will get saved in <b></b>.",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => clearInterval(timerInterval),
      });
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      Swal.fire("Error", "Failed to save order. Check console.", "error");
    }
  }
});
