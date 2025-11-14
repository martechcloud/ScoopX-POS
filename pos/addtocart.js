// This does the add to cart and handles all subtotal calculations

// --- Attach click listeners to product cards ---
function attachProductClickHandlers() {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productName = card
        .querySelector(".product-name")
        .textContent.trim();
      addProductToBilling(productName);
    });
  });
}

// --- Add product to billing table ---
function addProductToBilling(productName) {
  const products = JSON.parse(sessionStorage.getItem("products") || "[]");
  const product = products.find((p) => p.PRODUCT_NAME === productName);
  if (!product) return;

  const tableBody = document.querySelector(".styled-table tbody");

  // Check if product already exists
  let existingRow = Array.from(tableBody.querySelectorAll("tr")).find(
    (row) => row.children[0].textContent === productName
  );

  if (existingRow) {
    let qtyInput = existingRow.querySelector(".qty-value");
    qtyInput.value = parseInt(qtyInput.value) + 1;
    updateRowTotal(existingRow, product.PRODUCT_PRICE);
  } else {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
                <td>${product.PRODUCT_NAME}</td>
                <td>
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="changeQty(this, -1)">−</button>
                    <input type="text" class="qty-value text-center" value="1" style="width:20px;" readonly>
                    <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="changeQty(this, 1)">+</button>
                </div>
                </td>
                <td class="total">₹${parseFloat(product.PRODUCT_PRICE).toFixed(
                  2
                )}</td>
                <td class="text-center">
                <input type="checkbox" class="freewill-checkbox" onchange="toggleFreewill(this)">
                </td>
                <td>
                <select class="form-select form-select-sm wave-select" onchange="updateRowTotal(this.closest('tr'), ${
                  product.PRODUCT_PRICE
                })">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                </select>
                </td>
            `;
    tableBody.appendChild(newRow);
  }

  updateSubtotal();
}

// --- Attach product click listeners ---
document.addEventListener("DOMContentLoaded", () =>
  attachProductClickHandlers()
);

// --- Re-attach on product refresh ---
const observer = new MutationObserver(() => attachProductClickHandlers());
observer.observe(document.querySelector(".product-section .d-flex"), {
  childList: true,
});
