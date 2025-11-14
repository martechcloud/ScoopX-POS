document.addEventListener("DOMContentLoaded", () => {
  const productIdInput = document.querySelector(".productSearch3");
  const dropdown = document.querySelector(".dropdown-list3");
  const productNameInput = document.getElementById("supplierSearch");
  const productRowsContainer = document.getElementById("productRows");

  // 🧠 Function to render product dropdown
  function renderDropdown(filteredList) {
    dropdown.innerHTML = "";
    if (!filteredList.length) {
      dropdown.style.display = "none";
      return;
    }

    filteredList.forEach((product) => {
      const option = document.createElement("div");
      option.className = "dropdown-item";
      option.textContent = `${product.PRODUCT_ID} - ${product.PRODUCT_NAME}`;
      option.dataset.value = product.PRODUCT_ID;

      option.addEventListener("click", () => {
        // ✅ Fill Product ID & Name
        productIdInput.value = product.PRODUCT_ID;
        productNameInput.value = product.PRODUCT_NAME;
        productNameInput.disabled = true;
        dropdown.style.display = "none";

        console.log("✅ Selected Product ID:", product.PRODUCT_ID);

        // 🔹 Load related recipe rows
        loadRecipeIngredients(product.PRODUCT_ID);
      });

      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  }

  // 🔍 Filter Product Dropdown
  productIdInput.addEventListener("input", () => {
    const search = productIdInput.value.toLowerCase();
    const filtered = (window.productTable || []).filter(
      (p) =>
        p.PRODUCT_ID.toLowerCase().includes(search) ||
        p.PRODUCT_NAME.toLowerCase().includes(search)
    );
    renderDropdown(filtered);
  });

  // 👆 Show dropdown when input is focused
  productIdInput.addEventListener("focus", () => {
    if (window.productTable && window.productTable.length > 0) {
      renderDropdown(window.productTable);
    }
  });

  // 🕵️ Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-container3")) {
      dropdown.style.display = "none";
    }
  });

  // 🧩 Function: Load Ingredients from Recipe
  function loadRecipeIngredients(selectedProductId) {
    if (!window.recipeTable || !Array.isArray(window.recipeTable)) {
      console.warn("⚠️ recipeTable not found or invalid.");
      return;
    }

    // Filter recipes for the selected Product ID
    const recipeRows = window.recipeTable.filter(
      (r) => r.PRODUCT_ID === selectedProductId
    );

    // Clear existing ingredient rows
    productRowsContainer.innerHTML = "";

    if (!recipeRows.length) {
      console.log("⚠️ No recipe found for this product.");
      return;
    }

    // Generate dynamic rows for each ingredient
    recipeRows.forEach((recipe) => {
      const ingredientId = recipe.INGREDIENT_ID;
      const deductionQty = recipe.DEDUCTION_QUANTITY || "";
      const unit = recipe.UNIT || "";

      // Find matching product name from productTable
      const productData = (window.productTable || []).find(
        (p) => p.PRODUCT_ID === ingredientId
      );

      const ingredientName = productData ? productData.PRODUCT_NAME : "";
      const ingredientUnit = productData ? productData.PRODUCT_UNIT : unit;

      // Create new row
      const newRow = document.createElement("div");
      newRow.className = "product-row";
      newRow.innerHTML = `
          <div class="row-content">
            <div class="input-group">
              <label>Product ID</label>
              <div class="dropdown-container">
                <input type="text" class="productSearch" value="${ingredientId}" disabled />
              </div>
            </div>

            <div class="input-group">
              <label>Product Name</label>
              <div class="dropdown-container4">
                <input type="text" class="productSearch4" value="${ingredientName}" disabled />
              </div>
            </div>

            <div class="input-group">
              <label>Deduction Quantity</label>
              <div class="quantity-wrapper">
                <input class="quantityValue" type="number" step="0.01" value="${deductionQty}" />
                <input class="quantityUnit" type="text" value="${ingredientUnit}" disabled />
              </div>
            </div>
          </div>
          <button type="button" class="remove-row-btn">🗑</button>
        `;

      // 🗑 Handle Remove Row
      newRow.querySelector(".remove-row-btn").addEventListener("click", () => {
        newRow.remove();
      });

      productRowsContainer.appendChild(newRow);
    });

    console.log("✅ Loaded Recipe Rows:", recipeRows);
  }
});
