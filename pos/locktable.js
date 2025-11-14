import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const db = window.firebaseDB;

async function _lockTable(tableNum) {
  try {
    const lockDocRef = doc(db, "POS", `table_${tableNum}_locked`);
    await setDoc(lockDocRef, {
      locked: true,
      lockedBy: sessionStorage.getItem("userName") || "Anonymous",
      lockedAt: serverTimestamp(),
    });
    console.log(`🔒 Table ${tableNum} locked`);
  } catch (e) {
    console.error("Lock error:", e);
  }
}

// expose globally
window.lockTable = _lockTable;
