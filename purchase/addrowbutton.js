document.addEventListener("DOMContentLoaded", () => {
  // ✅ Auto-fill current date in the Order Date field
  const dateInput = document.getElementById("created-at");
  const now = new Date();
  const localDatetime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
  dateInput.value = localDatetime;

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
            <label>Quantity</label>
            <div class="quantity-wrapper">
              <input class="quantityValue" type="number" step="0.01" placeholder="Enter Quantity" required />
              <input class="quantityUnit" type="text" placeholder="Unit" disabled />
            </div>
          </div>

          <div class="input-group">
            <label>Cost per Unit (₹)</label>
            <input class="unit-cost" type="number" step="0.01" placeholder="Cost per Unit (₹)" required />
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
