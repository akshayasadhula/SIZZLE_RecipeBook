document.addEventListener('DOMContentLoaded', () => {

    // Guard: only run if recipeForm exists on this page
    const recipeForm = document.getElementById('recipeForm');
    if (!recipeForm) return;

    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recipe = {
            name: document.getElementById('recipeName').value.trim(),
            category: document.getElementById('category').value,
            ingredients: document.getElementById('ingredients').value.split(',').map(ing => ing.trim()).filter(ing => ing !== ""),
            instructions: document.getElementById('instructions').value.trim(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!recipe.name || !recipe.category || recipe.ingredients.length === 0 || !recipe.instructions) {
            displayMessage('Please fill in all fields properly.', 'error');
            return;
        }

        try {
            const docRef = await db.collection("recipes").add(recipe);
            console.log("✅ Recipe added! ID:", docRef.id);
            displayMessage('Recipe added successfully!', 'success');
            recipeForm.reset();
        } catch (error) {
            console.error("❌ Error adding recipe:", error);
            displayMessage('Error adding recipe: ' + error.message, 'error');
        }
    });

    function displayMessage(message, type) {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.className = `message ${type}`;
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
    }
});
