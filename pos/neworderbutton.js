// As soon as click on new order button - it reverts back to front page

document.addEventListener("DOMContentLoaded", function () {
  const newOrderBtn = document.getElementById("newOrderBtn");
  const tableSelection = document.getElementById("table-selection");
  const orderInfo = document.getElementById("order-info");

  // Event listener for New Order button
  if (newOrderBtn) {
    newOrderBtn.addEventListener("click", function (e) {
      e.preventDefault(); // prevent page jump

      // Clear table selection from session
      const lockedtable = sessionStorage.getItem("tableNumber");
      unlockTable(lockedtable);
      sessionStorage.removeItem("tableNumber");

      // Hide order-info and show table-selection
      orderInfo.style.display = "none";
      tableSelection.style.display = "block";
    });
  }
});
