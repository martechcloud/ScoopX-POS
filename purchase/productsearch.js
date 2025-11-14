document.addEventListener("DOMContentLoaded", () => {
  window.selectedProductId = "";

  // 🧠 Generic dropdown renderer for any product search input
  function setupProductSearch(row) {
    const input = row.querySelector(".productSearch");
    const dropdown = row.querySelector(".dropdown-list");

    if (!input || !dropdown) return;

    // 🧩 Render dropdown options
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

        option.addEventListener("click", () => {
          // ✅ On product select
          input.value = product.PRODUCT_NAME;
          input.dataset.productId = product.PRODUCT_ID;
          dropdown.style.display = "none";

          // Store globally if needed
          window.selectedProductId = product.PRODUCT_ID;

          console.log("✅ Selected Product:", product.PRODUCT_NAME);
          console.log("✅ Product ID:", product.PRODUCT_ID);

          // ✅ Update Quantity Unit (if available)
          const unitInput = row.querySelector(".quantityUnit");
          const quantityValue = row.querySelector(".quantityValue");
          if (unitInput && product.PRODUCT_UNIT) {
            unitInput.value = product.PRODUCT_UNIT;
            quantityValue.placeholder = `Enter quantity in ${product.PRODUCT_UNIT}`;
          } else if (unitInput) {
            unitInput.value = "";
            quantityValue.placeholder = "Enter Quantity";
          }
        });

        dropdown.appendChild(option);
      });

      dropdown.style.display = "block";
    }

    // 🔍 Filter products on typing
    input.addEventListener("input", () => {
      const search = input.value.toLowerCase();
      const filtered = (window.productTable || []).filter((p) =>
        p.PRODUCT_NAME.toLowerCase().includes(search)
      );
      renderDropdown(filtered);
    });

    // 👆 Show dropdown when input is focused (even before typing)
    input.addEventListener("focus", () => {
      if (window.productTable && window.productTable.length > 0) {
        renderDropdown(window.productTable);
      }
    });

    // 🕵️ Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown-container")) {
        dropdown.style.display = "none";
      }
    });
  }

  // ✅ Initial setup for first row
  const initialRows = document.querySelectorAll(".product-row");
  initialRows.forEach((row) => setupProductSearch(row));

  // ✅ Observe for new rows being added dynamically
  const productRows = document.getElementById("productRows");
  const observer = new MutationObserver(() => {
    const allRows = document.querySelectorAll(".product-row");
    allRows.forEach((row) => {
      if (!row.dataset.initialized) {
        setupProductSearch(row);
        row.dataset.initialized = "true";
      }
    });
  });

  observer.observe(productRows, { childList: true });
});
