// ✅ Import Firestore
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Assuming Firebase is already initialized in your app
const db = window.firebaseDB || getFirestore();

async function addProduct() {
  const { value: formValues } = await Swal.fire({
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
                .swal2-product-form input[type="file"],
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
                  border-color: #D94B86;
                  box-shadow: 0 0 10px #D94B86;
                  outline: none;
                }
                .swal2-product-form input[type="file"] {
                  background: #f0f4f8;
                  cursor: pointer;
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
              <h3>Add New Product</h3>
              <div class="swal2-product-form">
                <input id="prod-name" type="text" placeholder="Product Name">
                <input id="prod-category" type="text" placeholder="Product Category">

                <input id="prod-price" type="number" placeholder="Product Price (₹)" min="0">
                <input id="prod-quantity" type="number" placeholder="Product Quantity" min="0">

                <select id="swal-quantity-unit">
                  <option value="">Select Unit</option>
                  <option value="KG">KG</option>
                  <option value="Pieces">PIECES</option>
                  <option value="Liters">LITERS</option>
                </select>
              </div>
            `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Add Product",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "custom-swal-width",
    },
    preConfirm: async () => {
      const name = document.getElementById("prod-name").value.trim();
      const category = document.getElementById("prod-category").value.trim();
      const price = document.getElementById("prod-price").value.trim();
      const quantity = document.getElementById("prod-quantity").value.trim();
      const unit = document.getElementById("swal-quantity-unit").value.trim();

      if (!name || !price || !quantity || !unit || !category) {
        Swal.showValidationMessage("Please fill all required fields");
        return false;
      }

      return { name, category, price, quantity, unit };
    },
  });

  if (formValues) {
    console.log("🛍️ Product Details:", formValues);

    // ✅ Create formatted timestamps
    const now = new Date();
    const formattedDate = now.toLocaleString("en-IN");

    // ✅ Prepare Firestore schema object
    const productData = {
      BARCODE: "",
      CREATED_AT: formattedDate,
      IS_ACTIVE: "Deactive",
      LAST_PURCHASE_DATE: "",
      LAST_SOLD_DATE: "",
      PRODUCT_CATEGORY: formValues.category || "",
      PRODUCT_COST_PRICE: "",
      PRODUCT_IMAGE:
        "https://drive.google.com/thumbnail?id=10_lbNhWVNNAdXYt6OLCxqK8rJeHzAzCS" ||
        "",
      PRODUCT_NAME: formValues.name,
      PRODUCT_PRICE: formValues.price || "",
      PRODUCT_QUANTITY: formValues.quantity || "",
      PRODUCT_UNIT: formValues.unit || "",
      REORDER_LEVEL: "",
      SUPPLIER_ID: "",
      TAX_PERCENTAGE: "",
      UPDATED_AT: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "PRODUCT_DATA_TABLE"), productData);

      await Swal.fire({
        icon: "success",
        title: "✅ Product Added to Firestore",
        html: `
                  <b>Activate your product from Product Page</b>
                `,
      });
    } catch (error) {
      console.error("❌ Firestore Error:", error);
      Swal.fire(
        "Error",
        "Failed to add product. Check console for details.",
        "error"
      );
    }
  }
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// Button click event
document.querySelector(".add-product-btn").addEventListener("click", (e) => {
  e.preventDefault();
  addProduct();
});
