import {
  doc,
  onSnapshot,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = window.firebaseDB || getFirestore();

function listenToSubscriptionStatus(billingId) {
  const docRef = doc(db, "BILLING_AUTHENTICATION_DATA_TABLE", billingId);

  console.log("👀 Listening for updates on:", billingId);

  onSnapshot(
    docRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        console.log("❌ Document not found:", billingId);
        return;
      }

      const data = docSnap.data();
      const subscriptionStatus = data.subscriptionStatus;

      console.log("🔄 Real-time update received:", data);
      console.log("📦 subscriptionStatus:", subscriptionStatus);

      // Save latest status into sessionStorage
      sessionStorage.setItem("subscriptionStatus", subscriptionStatus);

      console.log(
        "💾 Updated in sessionStorage:",
        sessionStorage.getItem("subscriptionStatus")
      );

      // 🔍 Redirect Logic
      if (subscriptionStatus === "expired") {
        console.log("⛔ Subscription expired — redirecting...");
        window.location.href = "billing.html";
      } else {
        console.log("✅ Subscription active:", subscriptionStatus);
      }
    },
    (error) => {
      console.error("❌ Error in listener:", error);
    }
  );
}

// 🔥 Start listener when page loads
document.addEventListener("DOMContentLoaded", () => {
  listenToSubscriptionStatus("BILL-123");
});
