import {
  getFirestore,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB || getFirestore();

// ========== DELETE PRODUCT FUNCTION ==========
async function deleteProduct() {
  const { value: formValues } = await Swal.fire({
    html: `
            <style>
              .swal2-product-form {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
                margin-top: 10px;
                background: #f9fafc;
                padding: 18px;
                border-radius: 14px;
                box-shadow: inset 0 0 6px rgba(0,0,0,0.05);
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
                border-color: #D94B86;
                box-shadow: 0 0 10px #D94B86;
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
            <h3>Delete Existing Product</h3>
            <div class="swal2-product-form">
              <input id="delete-product-id" type="text" placeholder="Enter Product ID">
            </div>
          `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Delete Product",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "custom-swal-width",
    },
    preConfirm: () => {
      const productId = document
        .getElementById("delete-product-id")
        .value.trim();
      if (!productId) {
        Swal.showValidationMessage("Please enter a valid Product ID");
        return false;
      }
      return { productId };
    },
  });

  if (formValues) {
    const productId = formValues.productId;
    try {
      await deleteDoc(doc(db, "PRODUCT_DATA_TABLE", productId));
      await Swal.fire({
        icon: "success",
        title: "Deleted ✅",
        text: `Product (ID: ${productId}) has been successfully deleted.`,
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete product. Check console for details.",
      });
    }
  }
}

// ========== DELETE BUTTON EVENT ==========
document.querySelector(".delete-product-btn").addEventListener("click", (e) => {
  e.preventDefault();
  deleteProduct();
});
