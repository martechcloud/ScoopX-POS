document.addEventListener("DOMContentLoaded", () => {
  // 🧩 Global Product Table (Assumed available globally)
  // Example: window.productTable = [{ PRODUCT_ID: 'PROD-123', PRODUCT_NAME: 'Milk', PRODUCT_UNIT: 'Litre' }];
  window.selectedProductId = "";

  // 🔹 Setup Product Search
  function setupProductSearch() {
    const input = document.querySelector(".productSearch3");
    const dropdown = document.querySelector(".dropdown-list3");
    const nameInput = document.getElementById("supplierSearch");
    const unitInput = document.getElementById("quantityUnit");

    if (!input || !dropdown) return;

    // 🧠 Render dropdown results
    function renderDropdown(filteredList) {
      dropdown.innerHTML = "";
      if (!filteredList.length) {
        dropdown.style.display = "none";
        return;
      }

      filteredList.forEach((product) => {
        const option = document.createElement("div");
        option.className = "dropdown-item";
        option.textContent = `${product.PRODUCT_NAME} (${product.PRODUCT_ID})`;
        option.dataset.value = product.PRODUCT_ID;

        // 🖱️ On select
        option.addEventListener("click", () => {
          input.value = product.PRODUCT_ID;
          dropdown.style.display = "none";

          // Store selected product globally
          window.selectedProductId = product.PRODUCT_ID;

          // ✅ Auto-fill Product Name
          if (nameInput) {
            nameInput.value = product.PRODUCT_NAME || "";
          }

          // ✅ Auto-fill Unit
          if (unitInput) {
            unitInput.value = product.PRODUCT_UNIT || "";
          }

          console.log("✅ Selected Product:", product);
        });

        dropdown.appendChild(option);
      });

      dropdown.style.display = "block";
    }

    // 🔍 Filter results while typing
    input.addEventListener("input", () => {
      const search = input.value.toLowerCase();
      const filtered = (window.productTable || []).filter(
        (p) =>
          p.PRODUCT_ID.toLowerCase().includes(search) ||
          p.PRODUCT_NAME.toLowerCase().includes(search)
      );
      renderDropdown(filtered);
    });

    // 👆 Show all on focus
    input.addEventListener("focus", () => {
      if (window.productTable && window.productTable.length > 0) {
        renderDropdown(window.productTable);
      }
    });

    // 🕵️ Hide dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown-container3")) {
        dropdown.style.display = "none";
      }
    });
  }

  // 🔹 Initialize search
  setupProductSearch();
});
