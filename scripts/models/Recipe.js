class Recipe {
    /**
     * Crée une nouvelle instance de recette
     * @constructor
     * @param {Object} recipeData - Données de la recette
     */
    constructor(recipeData) {
        const { id, image, name, servings, ingredients, time, description, appliance, ustensils } = recipeData;
        this.id = id;
        this.image = `assets/images_recipes/${image}`;
        this.name = name;
        this.ingredients = ingredients;
        this.time = time;
        this.description = description;
    }

    /**
     * Crée et retourne l'élément HTML de la carte de recette
     * @returns {HTMLElement} - L'élément article représentant la recette
     */
    createRecipeCard() {
        const article = document.createElement('article');
        article.classList.add('recipe-card');
        article.setAttribute('data-recipe-id', this.id);

        // Construction of the ingredients list HTML
        let ingredientsHTML = '';
        this.ingredients.forEach(ing => {
            ingredientsHTML += `
            <li>
                <span class="ingredient-name">${ing.ingredient}</span>
                ${ing.quantity ? `
                    <span class="ingredient-quantity">
                        ${ing.quantity} ${ing.unit || ''}
                    </span>
                ` : ''}
            </li>
        `;
        });

        // Creation of the recipe card HTML
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