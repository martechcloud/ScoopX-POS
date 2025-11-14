// This fetched product data table

// ✅ Import Firebase Firestore functions
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Use your globally initialized Firestore instance
const db = window.firebaseDB || getFirestore();

let allProducts = []; // All products loaded
let activeCategory = ""; // Currently selected category

// 🟢 Listen to real-time updates from Firestore
function listenToProducts() {
  try {
    const colRef = collection(db, "PRODUCT_DATA_TABLE");

    // 👂 Listen for changes in real-time
    onSnapshot(colRef, (snapshot) => {
      const products = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // ✅ Include only active products
        .filter((product) => product.IS_ACTIVE === "Active");

      // 🧠 Cache locally for faster reloads
      sessionStorage.setItem("products", JSON.stringify(products));

      // 🔁 Update global variable
      allProducts = products;

      console.log("✅ Real-time products updated:", products);
    });
  } catch (err) {
    console.error("🔥 Error listening to products from Firestore:", err);
  }
}

// 🚀 Start listening immediately
listenToProducts();

// ✅ Create product card UI
function createProductCard(product) {
  const quantity = parseFloat(product.PRODUCT_QUANTITY) || 0;
  const borderClass = quantity > 0 ? "border-top-green" : "border-top-red";

  return `
                <div class="product-card ${borderClass}">
                    <div class="product-img-wrapper">
                        <img src="${product.PRODUCT_IMAGE}" alt="${product.PRODUCT_NAME}" class="product-img" />
                    </div>
                    <p class="product-name">${product.PRODUCT_NAME}</p>
                </div>
            `;
}

// ✅ Render products to the container
function renderProducts(filteredProducts) {
  const container = document.querySelector(".product-section .d-flex");

  if (!filteredProducts.length) {
    container.innerHTML = `<p class="text-muted">No products found.</p>`;
    return;
  }

  container.innerHTML = filteredProducts.map(createProductCard).join("");
}

// ✅ Display all products on load
async function displayProducts() {
  const container = document.querySelector(".product-section .d-flex");
  container.innerHTML = `<p>Loading products...</p>`;

  allProducts = JSON.parse(sessionStorage.getItem("products") || "[]");

  renderProducts(allProducts);
}

// ✅ Search filter
function searchItems() {
  const query = document
    .getElementById("search-bar")
    .value.toLowerCase()
    .trim();
  let filtered = [...allProducts];

  // Filter by active category
  if (activeCategory && activeCategory !== "all") {
    filtered = filtered.filter(
      (p) => p.PRODUCT_CATEGORY?.toLowerCase() === activeCategory
    );
  }

  // Filter by search text
  if (query) {
    filtered = allProducts.filter((p) =>
      p.PRODUCT_NAME?.toLowerCase().includes(query)
    );
  }

  renderProducts(filtered);
}

// ✅ Category filter
function showItems(category) {
  activeCategory = category.toLowerCase();

  // Highlight active button
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase() === activeCategory
    );
  });

  const query = document
    .getElementById("search-bar")
    .value.toLowerCase()
    .trim();
  let filtered = [...allProducts];

  if (activeCategory !== "all") {
    filtered = filtered.filter(
      (p) => p.PRODUCT_CATEGORY?.toLowerCase() === activeCategory
    );
  }

  if (query) {
    filtered = filtered.filter((p) =>
      p.PRODUCT_NAME?.toLowerCase().includes(query)
    );
  }

  renderProducts(filtered);
}

// ✅ Make functions globally accessible for inline HTML events
window.showItems = showItems;
window.searchItems = searchItems;

// ✅ Run when page loads
document.addEventListener("DOMContentLoaded", displayProducts);
