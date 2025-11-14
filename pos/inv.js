// 🧩 Update Inventory quantities based on recipe
async function updateInventoryFromRecipe(draftData) {
  const recipe = JSON.parse(sessionStorage.getItem("recipe")) || [];

  if (!recipe.length) {
    console.warn("⚠️ No recipe data found in sessionStorage");
    return;
  }

  for (const item of draftData) {
    // Find all recipe rows for this sold product
    const productRecipes = recipe.filter(
      (r) => r.PRODUCT_ID === item.productId
    );

    for (const recipeItem of productRecipes) {
      const ingredientId = recipeItem.INGREDIENT_ID;
      const deductionPerUnit = parseFloat(recipeItem.DEDUCTION_QUANTITY) || 0;
      const totalDeduction = deductionPerUnit * (item.quantity || 0);

      try {
        // Get the ingredient document
        const ingredientRef = doc(db, "INVENTORY_DATA_TABLE", ingredientId);
        const ingredientSnap = await getDoc(ingredientRef);

        if (ingredientSnap.exists()) {
          const currentStock =
            parseFloat(ingredientSnap.data().CURRENT_STOCK) || 0;
          const updatedStock = Math.max(currentStock - totalDeduction, 0);

          await updateDoc(ingredientRef, {
            CURRENT_STOCK: updatedStock,
            UPDATED_AT: new Date().toLocaleString("en-IN"),
          });

          console.log(
            `✅ Updated inventory for ${ingredientId}: -${totalDeduction} (New: ${updatedStock})`
          );
        } else {
          console.warn(`⚠️ Ingredient not found: ${ingredientId}`);
        }
      } catch (error) {
        console.error(
          `❌ Error updating ingredient ${recipeItem.INGREDIENT_ID}:`,
          error
        );
      }
    }
  }
  console.log("🍳 Inventory updated based on recipe successfully!");
}
