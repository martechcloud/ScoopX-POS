// From the drafted orders as soon as table is selected it automatically populates the billing table of drafted table

document.addEventListener("DOMContentLoaded", function () {
  const tableSelection = document.getElementById("table-selection");
  const orderInfo = document.getElementById("order-info");
  const tableButtons = document.querySelectorAll(".table-btn");
  const billingTableBody = document.querySelector(".styled-table tbody");
  const discountSelect = document.getElementById("bill-discount");
  const roundOffInput = document.getElementById("round-off");
  const subtotalEl = document.getElementById("subtotal");

  // Show table selection first
  tableSelection.style.display = "block";
  orderInfo.style.display = "none";

  // 🧭 Helper: populate billing table with saved draft
  function populateBillingTable(draftData) {
    billingTableBody.innerHTML = "";

    draftData.products.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${item.productName}</td>
                <td>
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="changeQty(this, -1)">−</button>
                    <input type="text" class="qty-value text-center" value="${parseFloat(
                      item.quantity
                    )}" style="width:20px;" readonly>
                    <button class="btn btn-sm btn-outline-secondary qty-btn" onclick="changeQty(this, 1)">+</button>
                </div>
                </td>
                <td class="total">₹${parseFloat(item.total).toFixed(2)}</td>
                <td class="text-center">
                <input type="checkbox" class="freewill-checkbox" ${
                  item.freewill ? "checked" : ""
                } onchange="toggleFreewill(this)">
                </td>
                <td>
                <select class="form-select form-select-sm wave-select" onchange="updateSubtotal()">
                    <option value="0" ${
                      item.wave == "0" ? "selected" : ""
                    }>0%</option>
                    <option value="5" ${
                      item.wave == "5" ? "selected" : ""
                    }>5%</option>
                    <option value="10" ${
                      item.wave == "10" ? "selected" : ""
                    }>10%</option>
                    <option value="15" ${
                      item.wave == "15" ? "selected" : ""
                    }>15%</option>
                    <option value="20" ${
                      item.wave == "20" ? "selected" : ""
                    }>20%</option>
                </select>
                </td>
            `;
      billingTableBody.appendChild(row);
    });

    discountSelect.value = draftData.discount || "0";
    roundOffInput.value = draftData.roundOff || "0";
    subtotalEl.innerText = draftData.subtotal || "0.00";
    updateSubtotal();
  }

  // ✅ Step 1: If a table was already selected earlier (session)
  const savedTable = sessionStorage.getItem("tableNumber");
  if (savedTable) {
    const draftData = savedTables.find((t) => t.tableNumber === savedTable);
    if (draftData) {
      populateBillingTable(draftData);
      tableSelection.style.display = "none";
      orderInfo.style.display = "block";
      console.log(`✅ Loaded Firestore draft for Table ${savedTable}`);
      document.getElementById("search-bar").value = "";
      showItems("all");
    }

    if (!draftData) {
      unlockTable(savedTable);
    }
  }

  // ✅ Step 2: When user clicks a table button
  tableButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tableNum = this.getAttribute("data-table");
      console.log("🪑 Selected Table:", tableNum);

      // Store selection in session
      sessionStorage.setItem("tableNumber", tableNum);
      lockTable(tableNum);

      // Try to find existing draft in Firebase (savedTables)
      const draftData = savedTables.find((t) => t.tableNumber === tableNum);

      if (draftData) {
        populateBillingTable(draftData);
        console.log(`✅ Loaded existing Firestore draft for Table ${tableNum}`);
      } else {
        // No draft found → reset billing
        billingTableBody.innerHTML = "";
        discountSelect.value = "0";
        roundOffInput.value = "0";
        subtotalEl.innerText = "0.00";
        console.log(`🆕 Starting new order for Table ${tableNum}`);
      }

      // Switch UI
      tableSelection.style.display = "none";
      orderInfo.style.display = "block";
      document.getElementById("search-bar").value = "";
      showItems("all");
    });
  });
});

// --- Calculate subtotal considering discount & round-off ---
function updateSubtotal() {
  const rows = document.querySelectorAll(".styled-table tbody tr");
  let subtotal = 0;

  rows.forEach((row) => {
    const totalText = row.querySelector(".total").textContent.replace("₹", "");
    subtotal += parseFloat(totalText) || 0;
  });

  const discount = parseFloat(document.getElementById("bill-discount").value);
  const roundOff = parseFloat(document.getElementById("round-off").value) || 0;

  subtotal = subtotal - (subtotal * discount) / 100;
  subtotal = subtotal + roundOff;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
}
