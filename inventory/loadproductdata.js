import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB || getFirestore();
const collectionRef = collection(db, "PRODUCT_DATA_TABLE");

// 🎨 Render Table
function renderTable(products) {
  const tableBody = document.getElementById("productTableBody");

  if (!products || products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="12" class="text-muted text-center py-3">No products found</td></tr>`;
    return;
  }

  const rows = products
    .map(
      (prod) => `
                <tr data-id="${prod.id}">
                    <td><img src="${prod.PRODUCT_IMAGE || ""}" alt="${
        prod.PRODUCT_NAME
      }" width="50" class="rounded shadow-sm"></td>
                    <td class="copy-id-cell text-center" data-field="PRODUCT_ID">
                        <i class="lni lni-clipboard copy-icon" title="Copy ID" onclick="copyToClipboard('${
                          prod.id
                        }')"></i>
                    </td>
                    <td class="editable" data-field="PRODUCT_NAME">${
                      prod.PRODUCT_NAME || "-"
                    }</td>
                    <td class="editable" data-field="PRODUCT_CATEGORY">${
                      prod.PRODUCT_CATEGORY || "-"
                    }</td>
                    <td class="editable" data-field="PRODUCT_PRICE">₹${
                      prod.PRODUCT_PRICE || "-"
                    }</td>
                    <td class="" data-field="PRODUCT_QUANTITY">${
                      prod.PRODUCT_QUANTITY || "-"
                    }</td>
                    <td class="editable" data-field="PRODUCT_UNIT">${
                      prod.PRODUCT_UNIT || "-"
                    }</td>
                    <td class="editable" data-field="IS_ACTIVE">${
                      prod.IS_ACTIVE || "-"
                    }</td>
                    <td class="editable" data-field="PRODUCT_INVENTORY_CATEGORY">${
                      prod.PRODUCT_INVENTORY_CATEGORY || "-"
                    }</td>
                    <td class="editable" data-field="REORDER_LEVEL">${
                      prod.REORDER_LEVEL || "-"
                    }</td>
                    <td class="editable" data-field="TAX_PERCENTAGE">${
                      prod.TAX_PERCENTAGE || "-"
                    }</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary fw-semibold edit-btn" data-id="${
                          prod.id
                        }">
                            <i class="lni lni-pencil"></i> Edit
                        </button>
                    </td>
                </tr>`
    )
    .join("");

  tableBody.innerHTML = rows;

  // Attach listeners
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.currentTarget.getAttribute("data-id");
      console.log("🖊 Editing product:", productId);
      const row = e.currentTarget.closest("tr");
      const isEditing = row.classList.contains("editing");

      if (!isEditing) {
        enableRowEdit(row);
      } else {
        saveRowChanges(row, productId);
      }
    });
  });
}

// ✏️ Enable editing for the row
function enableRowEdit(row) {
  row.classList.add("editing");
  row.querySelectorAll(".editable").forEach((cell) => {
    const field = cell.dataset.field;
    const text = cell.textContent.trim().replace(/^₹/, "");

    // Dropdowns for specific fields
    if (field === "PRODUCT_UNIT") {
      const options = ["LITERS", "PIECES", "KG"];
      const selectHTML = `
                        <select class="form-select form-select-sm">
                            ${options
                              .map(
                                (opt) =>
                                  `<option value="${opt}" ${
                                    opt === text ? "selected" : ""
                                  }>${opt}</option>`
                              )
                              .join("")}
                        </select>`;
      cell.innerHTML = selectHTML;
    } else if (field === "IS_ACTIVE") {
      const options = ["Active", "Deactive"];
      const selectHTML = `
                        <select class="form-select form-select-sm">
                            ${options
                              .map(
                                (opt) =>
                                  `<option value="${opt}" ${
                                    opt === text ? "selected" : ""
                                  }>${opt}</option>`
                              )
                              .join("")}
                        </select>`;
      cell.innerHTML = selectHTML;
    } else if (field === "PRODUCT_INVENTORY_CATEGORY") {
      const options = ["Finished", "Ingredient"];
      const selectHTML = `
                        <select class="form-select form-select-sm">
                            ${options
                              .map(
                                (opt) =>
                                  `<option value="${opt}" ${
                                    opt === text ? "selected" : ""
                                  }>${opt}</option>`
                              )
                              .join("")}
                        </select>`;
      cell.innerHTML = selectHTML;
    } else {
      cell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${
        text === "-" ? "" : text
      }">`;
    }
  });

  const editBtn = row.querySelector(".edit-btn");
  editBtn.innerHTML = `<i class="lni lni-save"></i> Save`;
  editBtn.classList.remove("btn-outline-primary");
  editBtn.classList.add("btn-success");
}

// 💾 Save edited data to Firestore
async function saveRowChanges(row, productId) {
  const updatedData = {};
  row.querySelectorAll(".editable").forEach((cell) => {
    const field = cell.dataset.field;
    let value = "";

    const input = cell.querySelector("input, select");
    if (input) value = input.value.trim();

    updatedData[field] = value || "";
  });

  updatedData["UPDATED_AT"] = new Date().toISOString();

  try {
    await updateDoc(doc(db, "PRODUCT_DATA_TABLE", productId), updatedData);
    console.log(`✅ Product ${productId} updated successfully.`);

    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: `Product ${productId} updated successfully.`,
      timer: 1500,
      showConfirmButton: false,
    });

    // Revert to view mode
    row.classList.remove("editing");
    row.querySelectorAll(".editable").forEach((cell) => {
      const field = cell.dataset.field;
      const value = updatedData[field] || "-";
      if (field === "PRODUCT_PRICE") {
        cell.textContent = value ? `₹${value}` : "-";
      } else {
        cell.textContent = value;
      }
    });

    const editBtn = row.querySelector(".edit-btn");
    editBtn.innerHTML = `<i class="lni lni-pencil"></i> Edit`;
    editBtn.classList.remove("btn-success");
    editBtn.classList.add("btn-outline-primary");
  } catch (err) {
    console.error("🔥 Error updating product:", err);
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: err.message,
    });
  }
}

// 🔁 Live Firestore Listener
function setupLiveListener() {
  onSnapshot(
    collectionRef,
    (snapshot) => {
      const liveProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      sessionStorage.setItem("products", JSON.stringify(liveProducts));
      renderTable(liveProducts);
      console.log("🟢 Live data updated.");
    },
    (error) => {
      console.error("🔥 Firestore listener error:", error);
    }
  );
}

// 🚀 Init function
function loadProducts() {
  const cached = sessionStorage.getItem("products");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      renderTable(parsed);
      console.log("⚡ Loaded from session cache.");
    } catch {
      console.warn("⚠️ Failed to parse cached products.");
    }
  }

  setupLiveListener();
}

loadProducts();
