// This reset order from the server

import {
  getFirestore,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB; // ✅ use global reference

document.getElementById("reset-btn").addEventListener("click", confirmReset);

function confirmReset() {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger me-2",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "This will reset the current bill!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        resetBill();
        swalWithBootstrapButtons.fire({
          title: "Reset!",
          text: "The bill has been cleared.",
          icon: "success",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your bill is safe 🙂",
          icon: "error",
        });
      }
    });
}

// 🔹 Reset function with Firestore delete
async function resetBill() {
  const tableNumber = sessionStorage.getItem("tableNumber");

  const billingTableBody = document.querySelector(".styled-table tbody");
  billingTableBody.innerHTML = "";

  document.getElementById("bill-discount").value = "0";
  document.getElementById("round-off").value = "";
  document.getElementById("subtotal").innerText = "0.00";

  // 🔸 Remove local draft
  if (tableNumber && sessionStorage.getItem(`draft_${tableNumber}`)) {
    sessionStorage.removeItem(`draft_${tableNumber}`);
    console.log(`Removed draft for Table ${tableNumber}`);

    const btn = document.getElementById(`table-btn-${tableNumber}`);
    if (btn) btn.classList.remove("active-table");
  }

  // 🔸 Delete from Firestore
  try {
    const docRef = doc(db, "POS", tableNumber);
    await deleteDoc(docRef);
    console.log(`🗑️ Firestore: Deleted draft for Table ${tableNumber}`);
  } catch (error) {
    console.error("❌ Error deleting Firestore document:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to delete draft from database. Check console for details.",
    });
  }
}
window.resetBill = resetBill;
