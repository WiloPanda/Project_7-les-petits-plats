import recipes from '../../data/recipes.js';
import Recipe from '../models/Recipe.js';

document.addEventListener("DOMContentLoaded", function () {

    /**
         * Main function calling all the other functions.
         * @function [<init>]
         */
    async function init() {
        const recipesData = await getData();
        console.log(recipesData);
        displayRecipes(recipesData);

    }

    init();

    /**
    * Get data from the JSON file.
    * @function [<getData>]
    * @returns {object} Data of the photographers.
    */
    function getData() {
        return Promise.resolve(recipes);
    }


    /**
     * Display recipes data on the page.
     * @function [<displayRecipes>]
     * @param {Array} recipesData - Données des recettes
     */
    function displayRecipes(recipesData) {
        const recipesContainer = document.querySelector('.recipes-container');
        recipesContainer.innerHTML = '';

        if (recipesData.length === 0) {
            recipesContainer.innerHTML = `
                <div class="no-results">
                    <p>Aucune recette ne correspond à votre recherche.</p>
                    <p>Vous pouvez chercher "tarte aux pommes", "poisson", etc.</p>
                </div>
            `;
            return;
        }

        recipesData.forEach(recipeData => {
            const recipe = new Recipe(recipeData);
            const recipeCard = recipe.createRecipeCard();
            recipesContainer.appendChild(recipeCard);
        });


    };
});
