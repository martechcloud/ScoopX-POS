// This de-locks the table at firebase

import {
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB;

async function _unlockTable(tableNum) {
  try {
    const lockDocRef = doc(db, "POS", `table_${tableNum}_locked`);
    await deleteDoc(lockDocRef);
    console.log(`✅ Table ${tableNum} unlocked (lock document deleted)`);
  } catch (error) {
    console.error("❌ Error unlocking table:", error);
  }
}

// 🌍 Expose globally so you can call unlockTable(tableNum)
window.unlockTable = _unlockTable;
