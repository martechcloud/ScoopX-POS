document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("supplierSearch");
  const dropdown = document.getElementById("dropdownListsupplier");

  // 🧠 Render dropdown
  function renderDropdown(filteredList) {
    dropdown.innerHTML = "";
    if (!filteredList.length) {
      dropdown.style.display = "none";
      return;
    }

    filteredList.forEach((supplier) => {
      const option = document.createElement("div");
      option.className = "dropdown-item";
      option.textContent = `${supplier.SUPPLIER_NAME} (${supplier.SUPPLIER_ID})`;
      option.dataset.value = supplier.SUPPLIER_ID;

      option.addEventListener("click", () => {
        // ✅ Set selected supplier
        input.value = supplier.SUPPLIER_NAME;
        input.dataset.supplierId = supplier.SUPPLIER_ID;
        dropdown.style.display = "none";

        console.log("✅ Selected Supplier:", supplier.SUPPLIER_NAME);
        console.log("✅ Supplier ID:", supplier.SUPPLIER_ID);
      });

      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  }

  // 🔍 Filter as user types
  input.addEventListener("input", () => {
    const search = input.value.toLowerCase();
    const filtered = window.supplierTable.filter((s) =>
      s.SUPPLIER_NAME.toLowerCase().includes(search)
    );
    renderDropdown(filtered);
  });

  // 👆 Show dropdown when input is focused (even before typing)
  input.addEventListener("focus", () => {
    if (window.supplierTable && window.supplierTable.length > 0) {
      renderDropdown(window.supplierTable);
    }
  });

  // ❌ Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown-container1")) {
      dropdown.style.display = "none";
    }
  });
});
