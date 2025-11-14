window.updateQuantityFields = function () {
  const unitInput = document.getElementById("quantityUnit");
  const quantityValue = document.getElementById("quantityValue");

  // ✅ Ensure required inputs exist
  if (!unitInput || !quantityValue) {
    console.warn("⚠️ quantityUnit or quantityValue field not found.");
    return;
  }

  // 🧩 Get selected product ID from global variable
  const selectedId = window.selectedProductId;
  console.log("🟢 updateQuantityFields() called");
  console.log("Selected Product ID:", selectedId);

  if (!selectedId || !Array.isArray(window.productTable)) {
    unitInput.value = "";
    quantityValue.placeholder = "Enter Quantity";
    console.warn("⚠️ No selectedId or productTable not available");
    return;
  }

  // 🔍 Find matching product
  const product = window.productTable.find(
    (p) => String(p.PRODUCT_ID) === String(selectedId)
  );

  if (product && product.PRODUCT_UNIT) {
    unitInput.value = product.PRODUCT_UNIT;
    quantityValue.placeholder = `Enter quantity in ${product.PRODUCT_UNIT}`;
    console.log("✅ Quantity field updated for:", product.PRODUCT_NAME);
  } else {
    unitInput.value = "";
    quantityValue.placeholder = "Enter Quantity";
    console.warn("⚠️ Product unit not found for selected product");
  }
};
