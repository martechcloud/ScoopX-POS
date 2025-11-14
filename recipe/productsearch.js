document.addEventListener("DOMContentLoaded", () => {
  window.selectedProductId = "";

  // 🧠 Generic dropdown setup for any product search field
  function setupProductSearch(
    row,
    inputSelector,
    dropdownSelector,
    containerSelector
  ) {
    const input = row.querySelector(inputSelector);
    const dropdown = row.querySelector(dropdownSelector);
    const nameInput = document.getElementById("supplierSearch");

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
          input.value = product.PRODUCT_ID;
          input.dataset.productId = product.PRODUCT_ID;
          dropdown.style.display = "none";
          window.selectedProductId = product.PRODUCT_ID;

          console.log("✅ Selected Product:", product.PRODUCT_NAME);
          console.log("✅ Product ID:", product.PRODUCT_ID);

          // ✅ Auto-fill Quantity Unit if present
          const unitInput = row.querySelector(".quantityUnit");
          const quantityValue = row.querySelector(".quantityValue");
          if (unitInput && product.PRODUCT_UNIT) {
            unitInput.value = product.PRODUCT_UNIT;
            quantityValue.placeholder = `Enter quantity in ${product.PRODUCT_UNIT}`;
          } else if (unitInput) {
            unitInput.value = "";
            quantityValue.placeholder = "Enter Quantity";
          }

          // ✅ Auto-fill Quantity Unit if present
          const prodname = row.querySelector(".productSearch4");
          if (prodname && product.PRODUCT_NAME) {
            prodname.value = product.PRODUCT_NAME;
          }

          if (nameInput) {
            nameInput.value = product.PRODUCT_NAME;
            nameInput.dataset.productId = product.PRODUCT_ID;
          }
        });

        dropdown.appendChild(option);
      });

      dropdown.style.display = "block";
    }

    // 🔍 Filter on input
    input.addEventListener("input", () => {
      const search = input.value.toLowerCase();
      const filtered = (window.productTable || []).filter((p) =>
        p.PRODUCT_NAME.toLowerCase().includes(search)
      );
      renderDropdown(filtered);
    });

    // 👆 Show all on focus (even before typing)
    input.addEventListener("focus", () => {
      if (window.productTable && window.productTable.length > 0) {
        renderDropdown(window.productTable);
      }
    });

    // 🕵️ Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(containerSelector)) {
        dropdown.style.display = "none";
      }
    });
  }

  // ✅ Apply to all product rows (for .productSearch)
  document.querySelectorAll(".product-row").forEach((row) => {
    setupProductSearch(
      row,
      ".productSearch",
      ".dropdown-list",
      ".dropdown-container"
    );
  });

  // ✅ Apply separately for static Product Name field (.productSearch3)
  document.querySelectorAll(".dropdown-container3").forEach((container) => {
    setupProductSearch(
      container,
      ".productSearch3",
      ".dropdown-list3",
      ".dropdown-container3"
    );
  });

  // ✅ Observe dynamic rows
  const productRows = document.getElementById("productRows");
  if (productRows) {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".product-row").forEach((row) => {
        if (!row.dataset.initialized) {
          setupProductSearch(
            row,
            ".productSearch",
            ".dropdown-list",
            ".dropdown-container"
          );
          row.dataset.initialized = "true";
        }
      });
    });
    observer.observe(productRows, { childList: true });
  }
});
