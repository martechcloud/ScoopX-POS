document.addEventListener("DOMContentLoaded", () => {
  const addRowBtn = document.getElementById("addRowBtn");
  const productRows = document.getElementById("productRows");

  // ✅ Add Row
  addRowBtn.addEventListener("click", () => {
    const newRow = document.createElement("div");
    newRow.classList.add("product-row");

    newRow.innerHTML = `
        <div class="row-content">
          <div class="input-group">
            <label>Product</label>
            <div class="dropdown-container">
              <input type="text" class="productSearch" placeholder="Search Product" autocomplete="off" />
              <div class="dropdown-list"></div>
            </div>
          </div>

          <div class="input-group">
            <label>Product Name</label>
            <div class="dropdown-container4">
              <input type="text" class="productSearch4" placeholder="Product Name" autocomplete="off" / disabled>
            </div>
          </div>

          <div class="input-group">
            <label>Deduction Quantity</label>
            <div class="quantity-wrapper">
              <input class="quantityValue" type="number" step="0.01" placeholder="Enter Quantity" required />
              <input class="quantityUnit" type="text" placeholder="Unit" disabled />
            </div>
          </div>
        </div>
        
        <button type="button" class="remove-row-btn">🗑</button>
      `;

    productRows.appendChild(newRow);

    // ✅ Attach remove event to the new button
    newRow.querySelector(".remove-row-btn").addEventListener("click", () => {
      newRow.remove();
    });
  });

  // ✅ Attach remove event to initial row
  document
    .querySelector(".remove-row-btn")
    .addEventListener("click", (e) =>
      e.target.closest(".product-row").remove()
    );
});
