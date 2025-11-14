// 🔥 This js actually fetch the data from firebare system and stored the data into globle variable for future reference

import {
  getFirestore,
  collection,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const db = window.firebaseDB; // ✅ use global reference

// 🧠 Global array to store all saved tables
window.savedTables = [];

// 🔥 Real-time listener for POS collection
const posCollection = collection(db, "POS");

onSnapshot(posCollection, (snapshot) => {
  window.savedTables = []; // Clear before updating

  snapshot.forEach((doc) => {
    const data = doc.data();
    window.savedTables.push({
      id: doc.id,
      ...data,
    });
  });

  console.log("📡 Real-time updated savedTables:", window.savedTables);
  highlightActiveTables();
});

// From the drafted orders from the globle variable it highlights the table number

function highlightActiveTables() {
  const allTableButtons = document.querySelectorAll("[id^='table-btn-']");
  const now = new Date();

  allTableButtons.forEach((btn) => {
    const tableNum = btn.id.replace("table-btn-", "");

    // 🔍 Find drafted data
    const draftData = savedTables.find((t) => t.tableNumber === tableNum);

    // 🔍 Check if locked record exists in savedTables
    const isLocked = savedTables.some(
      (t) => t.id === `table_${tableNum}_locked`
    );

    // 🧠 CASE 1: Locked (but no draft)
    if (isLocked && !draftData) {
      btn.classList.add("locked-table");
      btn.classList.remove("active-table");
      btn.innerHTML = `🔒 ${tableNum}`;
      btn.title = "Locked by another user";
      return; // ✅ Stop further processing
    }

    // 🧠 CASE 2: Has a draft and locked
    if (draftData && isLocked) {
      btn.classList.add("active-table");
      btn.classList.remove("locked-table");

      // 🕒 Calculate time difference
      const draftedTime = draftData?.draftedAt?.iso;
      let minutesAgo = null;
      if (draftedTime) {
        const draftDate = new Date(draftedTime);
        const diffMs = now - draftDate;
        minutesAgo = Math.floor(diffMs / 60000);
      }

      const subtotal = draftData.subtotal || "0.00";

      // 🏷️ Time label
      let timeDiv = btn.querySelector(".time-label");
      if (!timeDiv) {
        timeDiv = document.createElement("div");
        timeDiv.className = "time-label";
        timeDiv.style.fontSize = "13px";
        timeDiv.style.color = "#fff";
        timeDiv.style.fontWeight = "500";
        btn.prepend(timeDiv);
      }
      timeDiv.textContent = minutesAgo !== null ? `${minutesAgo} min ago` : "";

      // 💰 Subtotal label
      let subtotalDiv = btn.querySelector(".subtotal-amount");
      if (!subtotalDiv) {
        subtotalDiv = document.createElement("div");
        subtotalDiv.className = "subtotal-amount";
        subtotalDiv.style.fontSize = "12px";
        subtotalDiv.style.color = "#fff";
        subtotalDiv.style.fontWeight = "400";
        btn.appendChild(subtotalDiv);
      }
      subtotalDiv.textContent = `₹${subtotal}`;

      if (draftData?.draftedAt?.local) {
        btn.title = `Drafted at: ${draftData.draftedAt.local}`;
      }

      return; // ✅ Stop further processing
    }

    // 🧠 CASE 3: Has a draft (not locked)
    if (draftData && !isLocked) {
      btn.classList.add("active-table");
      btn.classList.remove("locked-table");

      const draftedTime = draftData?.draftedAt?.iso;
      let minutesAgo = null;
      if (draftedTime) {
        const draftDate = new Date(draftedTime);
        const diffMs = now - draftDate;
        minutesAgo = Math.floor(diffMs / 60000);
      }

      const subtotal = draftData.subtotal || "0.00";

      let timeDiv = btn.querySelector(".time-label");
      if (!timeDiv) {
        timeDiv = document.createElement("div");
        timeDiv.className = "time-label";
        timeDiv.style.fontSize = "13px";
        timeDiv.style.color = "#fff";
        timeDiv.style.fontWeight = "500";
        btn.prepend(timeDiv);
      }
      timeDiv.textContent = minutesAgo !== null ? `${minutesAgo} min ago` : "";

      let subtotalDiv = btn.querySelector(".subtotal-amount");
      if (!subtotalDiv) {
        subtotalDiv = document.createElement("div");
        subtotalDiv.className = "subtotal-amount";
        subtotalDiv.style.fontSize = "12px";
        subtotalDiv.style.color = "#fff";
        subtotalDiv.style.fontWeight = "400";
        btn.appendChild(subtotalDiv);
      }
      subtotalDiv.textContent = `₹${subtotal}`;

      if (draftData?.draftedAt?.local) {
        btn.title = `Drafted at: ${draftData.draftedAt.local}`;
      }

      return;
    }

    // 🧠 CASE 4: Neither locked nor drafted
    btn.classList.remove("locked-table", "active-table");
    btn.innerHTML = tableNum;
    btn.removeAttribute("title");
  });
}

// ⏱️ Run every 1 minute
setInterval(highlightActiveTables, 60000);
