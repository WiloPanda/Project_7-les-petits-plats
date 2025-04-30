class Recipe {
    /**
     * Crée une nouvelle instance de recette
     * @constructor
     * @param {Object} recipeData - Données de la recette
     */
    constructor(recipeData) {
        const { id, image, name, servings, ingredients, time, description, appliance, ustensils } = recipeData;
        this.id = id;
        this.image = `../../assets/images_recipes/${image}`;
        this.name = name;
        this.servings = servings;
        this.ingredients = ingredients;
        this.time = time;
        this.description = description;
        this.appliance = appliance;
        this.ustensils = ustensils;
    }

    /**
     * Crée et retourne l'élément HTML de la carte de recette
     * @returns {HTMLElement} - L'élément article représentant la recette
     */
    createRecipeCard() {
        const article = document.createElement('article');
        article.classList.add('recipe-card');
        article.setAttribute('data-recipe-id', this.id);

        // Construction de la liste d'ingrédients
        let ingredientsHTML = '';
        this.ingredients.forEach(ing => {
            let ingredientText = `<li><strong>${ing.ingredient}</strong>`;
            if (ing.quantity) {
                ingredientText += ` <br>${ing.quantity}`;
                if (ing.unit) {
                    ingredientText += ` ${ing.unit}`;
                }
            }
            ingredientText += '</li>';
            ingredientsHTML += ingredientText;
        });

        // Construction de la carte complète
        article.innerHTML = `
            <div class="recipe-img">
                <img src="${this.image}" alt="${this.name}" />
                <span class="recipe-time">${this.time} min</span>
            </div>
            <div class="recipe-content">
                <h2 class="recipe-title">${this.name}</h2>
                <div class="recipe-details">
                    <div class="recipe-section">
                        <h3>RECETTE</h3>
                        <p class="recipe-description">${this.description}</p>
                    </div>
                    <div class="recipe-section">
                        <h3>INGRÉDIENTS</h3>
                        <ul class="recipe-ingredients">
                            ${ingredientsHTML}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        return article;
    }
};

export default Recipe;