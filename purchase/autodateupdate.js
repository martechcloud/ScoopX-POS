document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("created-at");

  // 🕒 Get current date-time in local format suitable for datetime-local input
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // ✅ Set as default value
  dateInput.value = localISOTime;
});
