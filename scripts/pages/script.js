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
        filterDropdown();
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
            arraySearch = []; // Initialize the arraySearch

            // Add the value of the search input if it has more than 2 characters
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

            // Add filters if not empty
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

        // Listener for form submission
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilters();
        });

        // Listener for input changes in the search bar
        searchInput.addEventListener('input', () => {
            applyFilters();
        });

        // Return the arraySearch and applyFilters function
        return {
            getArraySearch: function () {
                return arraySearch;
            },
            applyFilters: applyFilters //Expose the applyFilters function
        };
    })();

    function filterArray() {
        let arraySearch = searchInstance.getArraySearch();
        console.log(arraySearch);

        // Initialize the array with all recipes 
        let recipesToDisplay = recipes;

        const filteredRecipes = recipesToDisplay.filter(recipe => {
            let matchesAllCriteria = true;

            // Browse through each filter type and its values
            arraySearch.forEach(([filterType, filterValues]) => {
                // If criteria is invalid
                if (!matchesAllCriteria) return;


                switch (filterType) {
                    case 'searchBar':
                        const mainInput = filterValues.toLowerCase();
                        const regex = new RegExp(`${mainInput.trim()}`);
                        let recipeIsMatching = false;

                        // Recipe name matching
                        if (regex.test(recipe.name.toLowerCase())) {
                            recipeIsMatching = true;
                        }

                        // Use forEach to test each element
                        recipe.ingredients.forEach(({ ingredient }) => {
                            if (regex.test(ingredient.toLowerCase())) {
                                recipeIsMatching = true;
                            }
                        });

                        recipe.ustensils.forEach((ustensil) => {
                            if (regex.test(ustensil.toLowerCase())) {
                                recipeIsMatching = true;
                            }
                        });

                        if (regex.test(recipe.appliance.toLowerCase())) {
                            recipeIsMatching = true;
                        }

                        matchesAllCriteria = matchesAllCriteria && recipeIsMatching;
                        break;

                    case 'ingredients':
                        // Map to extract all ingredients from the recipe
                        const recipeIngredients = recipe.ingredients
                            .map(ingredient => ingredient.ingredient.toLowerCase());

                        // Reduce to check if all selected ingredients are present
                        const allIngredientsFound = filterValues.reduce((allFound, selectedIngredient) => {
                            // Filter to find matching ingredients
                            const matchingIngredients = recipeIngredients.filter(recipeIngredient =>
                                recipeIngredient.includes(selectedIngredient)
                            );
                            return allFound && matchingIngredients.length > 0;
                        }, true);

                        matchesAllCriteria = matchesAllCriteria && allIngredientsFound;
                        break;

                    case 'ustensils':
                        // Map to extract all utensils from the recipe
                        const recipeUstensils = recipe.ustensils.map(ustensil =>
                            ustensil.toLowerCase()
                        );

                        // Reduce to check if all selected utensils are present
                        const allUstensilsFound = filterValues.reduce((allFound, selectedUstensil) => {
                            // Filter to find matching utensils
                            const matchingUstensils = recipeUstensils.filter(recipeUstensil =>
                                recipeUstensil.includes(selectedUstensil)
                            );
                            return allFound && matchingUstensils.length > 0;
                        }, true);

                        matchesAllCriteria = matchesAllCriteria && allUstensilsFound;
                        break;

                    case 'appliance':
                        const recipeAppliance = recipe.appliance.toLowerCase();

                        // Reduce to check if all selected appliances are present
                        const allAppliancesFound = filterValues.reduce((allFound, selectedAppliance) => {
                            return allFound && recipeAppliance.includes(selectedAppliance);
                        }, true);

                        matchesAllCriteria = matchesAllCriteria && allAppliancesFound;
                        break;

                    default:
                        // If the filter type is not recognized, we skip it
                        break;
                }
            });

            return matchesAllCriteria;
        });

        // Display the filtered recipes and update the dropdown filters list
        initVisuel(filteredRecipes);
    }

});