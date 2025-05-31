import recipes from '../../data/recipes.js';
import Recipe from '../models/Recipe.js';
import Filtertag from '../models/Filter.js';
import filterDropdown from '../utils/filter.js';

document.addEventListener("DOMContentLoaded", function () {

    /**
     * Main function calling all the other functions.
     * @function [<init>]
     */
    async function init() {
        const recipesData = await getData();
        initVisuel(recipesData);
    }

    init();

    /**
     * Get data from the JSON file.
     * @function [<getData>]
     * @returns {object} Data of the recipes.
     */
    function getData() {
        return Promise.resolve(recipes);
    }

    function initVisuel(Data) {
        displayRecipes(Data);
        filterDropdown();
        displayFilters('ingredient', Data);
        displayFilters('ustensils', Data);
        displayFilters('appliance', Data);
    }

    /**
     * Display recipes data on the page.
     * @function [<displayRecipes>]
     * @param {Objet} recipesData - Recipes data
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

    /**
     * Display filters tags on each filters buttons.
     * @function [<displayFilters>]
     * @param {string} type - Type of filter (ingredient, ustensils, appliance)
     * @param {Objet} recipesData - Recipes data
     */
    function displayFilters(type, recipesData) {
        const filter = new Filtertag(type, recipesData);
        const config = filter.config[type];

        const filtersList = document.querySelector(config.containerSelector);

        filtersList.innerHTML = '';

        const filterItems = filter.createFilterItems();
        filterItems.forEach(li => {
            filtersList.appendChild(li);

            const button = li.querySelector('button');
            button.addEventListener('click', function (event) {

                const clickedElement = event.target;
                const clickedText = clickedElement.textContent.trim();

                console.log(`Filtre cliqué: ${type} - ${clickedText}`);

                handleFilterSelection(type, clickedText, clickedElement);
            });
        });
    }

    /**
     * Apply 'selected' to the selected filter.
     * @function [<handleFilterSelection>]
     * @param {string} filterType - Type of filter (ingredient, ustensils, appliance)
     * @param {string} selectedValue - Selected value of the filter
     * @param {HTMLElement} element - DOM element cliqued
     */
    function handleFilterSelection(filterType, selectedValue, element) {
        // Ajouter une classe pour indiquer que l'élément est sélectionné
        element.classList.toggle('selected');

        // Créer ou supprimer un tag sélectionné
        if (element.classList.contains('selected')) {
            createSelectedTag(filterType, selectedValue);
        } else {
            removeSelectedTag(filterType, selectedValue);
        }

        // Appeler applyFilters pour mettre à jour la recherche
        searchInstance.applyFilters();
    }

    /**
     * Create a tag for the selected filter.
     * @function [<createSelectedTag>]
     * @param {string} filterType - Type of filter (ingredient, ustensils, appliance)
     * @param {string} value - Value of the selected filter
     */
    function createSelectedTag(filterType, value) {
        const container = document.querySelector(`#selected-${filterType}-container`);

        // Check if the tag already exists
        if (container.querySelector(`[data-value="${value}"]`)) {
            return;
        }

        const tag = document.createElement('div');
        tag.className = 'selected-tag';
        tag.setAttribute('data-type', filterType);
        tag.setAttribute('data-value', value);
        tag.innerHTML = `
            ${value}
            <img src="./assets/close_tag.svg" class="remove-tag" alt="Supprimer ${value}">
        `;

        // Ajouter l'événement pour supprimer le tag
        const removeButton = tag.querySelector('.remove-tag');
        removeButton.addEventListener('click', () => {
            removeSelectedTag(filterType, value);
        });

        container.appendChild(tag);
    }

    /**
     * Remove a selected tag from the filters.
     * @function [<removeSelectedTag>]
     * @param {string} filterType - Type of filter
     * @param {string} value - Value of the selected filter
     */
    function removeSelectedTag(filterType, value) {
        const container = document.querySelector(`#selected-${filterType}-container`);
        const tag = container.querySelector(`[data-value="${value}"]`);

        if (tag) {
            tag.remove();
        }

        // Retirer la classe selected du bouton correspondant
        const config = {
            ingredient: '#ingredients-list',
            ustensils: '#ustensiles-list',
            appliance: '#appareils-list'
        };

        const filtersList = document.querySelector(config[filterType]);
        const buttons = filtersList.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent.trim() === value) {
                button.classList.remove('selected');
            }
        });

        // Appeler applyFilters pour mettre à jour la recherche
        searchInstance.applyFilters();
    }

    /**
    * Search function to filter recipes based on user input.
    * @function [<search>]
    */
    const searchInstance = (function () {
        let searchInput = document.querySelector('.search-input');
        let form = document.querySelector('.search-form');
        let arraySearch = [];

        function applyFilters() {
            /* dropdowns */
            /* récupération des tags sélectionnés */
            arraySearch = []; // Réinitialiser le tableau à chaque appel

            // Ajouter la valeur de la barre de recherche si elle existe
            if (searchInput.value.length > 2) {
                let searchValue = searchInput.value.toLowerCase();
                arraySearch.push(["searchBar", searchValue]);
            }

            const selectedIngredients = Array.from(document.querySelectorAll('#selected-ingredient-container .selected-tag'))
                .map(tag => tag.getAttribute('data-value').toLowerCase());
            const selectedUstensils = Array.from(document.querySelectorAll('#selected-ustensils-container .selected-tag'))
                .map(tag => tag.getAttribute('data-value').toLowerCase());
            const selectedAppliance = Array.from(document.querySelectorAll('#selected-appliance-container .selected-tag'))
                .map(tag => tag.getAttribute('data-value').toLowerCase());

            // N'ajouter les filtres que s'ils contiennent des éléments
            if (selectedIngredients.length > 0) {
                arraySearch.push(['ingredients', selectedIngredients]);
            }
            if (selectedUstensils.length > 0) {
                arraySearch.push(['ustensils', selectedUstensils]);
            }
            if (selectedAppliance.length > 0) {
                arraySearch.push(['appliance', selectedAppliance]);
            }

            filterArray();
        }

        // Gestionnaire d'événement pour la soumission du formulaire
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilters();
        });

        // Gestionnaire d'événement pour la saisie
        searchInput.addEventListener('input', () => {
            applyFilters();
        });

        // Return le tableau et la fonction applyFilters
        return {
            getArraySearch: function () {
                return arraySearch;
            },
            applyFilters: applyFilters // Exposer la fonction applyFilters
        };
    })();

    function filterArray() {
        let arraySearch = searchInstance.getArraySearch();
        console.log(arraySearch);
        // Ici logique de filtrage

        // Exemple de logique de filtrage (à compléter selon vos besoins) :
        // const filteredRecipes = recipes.filter(recipe => {
        //     let matchesAllCriteria = true;
        //     
        //     for (const [filterType, filterValues] of arraySearch) {
        //         // Logique de filtrage selon le type
        //         // ...
        //     }
        //     
        //     return matchesAllCriteria;
        // });
        // 
        // displayRecipes(filteredRecipes);
    }
});