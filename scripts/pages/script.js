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

    /**
     * Initialize the visual part of the page with recipes and filters.
     * @function [<initVisuel>]
     * @param {object} data - Data of the recipes.
     */
    function initVisuel(data) {
        displayRecipes(data);
        const availableFilters = getAllFiltersFromRecipes(data);
        displayFilters('ingredient', availableFilters.ingredients);
        displayFilters('ustensils', availableFilters.ustensils);
        displayFilters('appliance', availableFilters.appliance);
    }

    /**
     * Update the recipe counter displayed on the page.
     * @function [<updateRecipeCounter>]
     */
    function updateRecipeCounter() {
        const recipesSection = document.querySelector('.recipes-container');
        const recipeCards = recipesSection.querySelectorAll('.recipe-card');

        const visibleCount = Array.from(recipeCards)
            .filter(card => card.style.display !== 'none')
            .length;

        const counterElement = document.querySelector('.recipe-counter');
        const formattedCount = visibleCount.toString().padStart(2, '0');

        counterElement.textContent = `${formattedCount} recette${visibleCount > 1 ? 's' : ''}`;
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

        updateRecipeCounter();
    };

    /**
     * Get all filters from the recipes data.
     * @function [<getAllFiltersFromRecipes>]
     * @param {Objet} recipes - Recipes data
     */
    function getAllFiltersFromRecipes(recipes) {
        const ingredientsSet = new Set();
        const ustensilsSet = new Set();
        const appliancesSet = new Set();

        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => ingredientsSet.add(ing.ingredient.toLowerCase()));
            recipe.ustensils.forEach(ust => ustensilsSet.add(ust.toLowerCase()));
            appliancesSet.add(recipe.appliance.toLowerCase());
        });

        return {
            ingredients: Array.from(ingredientsSet),
            ustensils: Array.from(ustensilsSet),
            appliance: Array.from(appliancesSet)
        };
    }

    /**
     * Display filters tags on each filters buttons.
     * @function [<displayFilters>]
     * @param {string} type - Type of filter (ingredient, ustensils, appliance)
     * @param {Objet} recipesData - Recipes data
     */
    function displayFilters(type, itemsArray) {
        const filter = new Filtertag(type, itemsArray);
        const config = filter.config[type];
        const filtersList = document.querySelector(config.containerSelector);
        filtersList.innerHTML = '';

        const filterItems = filter.createFilterItems();
        filterItems.forEach(li => {
            filtersList.appendChild(li);
            const button = li.querySelector('button');
            button.addEventListener('click', function (event) {
                const clickedText = event.target.textContent.trim();
                handleFilterSelection(type, clickedText, event.target);
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
     * Search function for the filters search bars.
     * @function [<searchFilterButton>]
     */
    const searchFilterButton = (function () {
        let searchInputFilter = document.querySelectorAll('.search-input-filter');
        let arraySearchFilter = [];

        function searchFilter() {
            let ingredientsSearch = document.querySelector('#ingredients-search');
            let ustensilsSearch = document.querySelector('#ustensiles-search');
            let applianceSearch = document.querySelector('#appareils-search');

            arraySearchFilter = [];

            if (ingredientsSearch.value.length > 2) {
                let ingredientsValue = ingredientsSearch.value.toLowerCase();
                arraySearchFilter.push(["ingredients", ingredientsValue]);
            }

            if (ustensilsSearch.value.length > 2) {
                let ustensilsValue = ustensilsSearch.value.toLowerCase();
                arraySearchFilter.push(["ustensils", ustensilsValue]);
            }

            if (applianceSearch.value.length > 2) {
                let applianceValue = applianceSearch.value.toLowerCase();
                arraySearchFilter.push(["appliance", applianceValue]);
            }

            if (arraySearchFilter.length > 0) {

                filterArrayFilter();
            } else {
                // If no search input is provided, display all available filters
                const filteredRecipes = getFilteredRecipes();
                const updatedFilters = getAllFiltersFromRecipes(filteredRecipes);
                displayFilters('ingredient', updatedFilters.ingredients);
                displayFilters('ustensils', updatedFilters.ustensils);
                displayFilters('appliance', updatedFilters.appliance);
            }
        }

        searchInputFilter.forEach(input => {
            input.addEventListener('input', function () {
                searchFilter();
            });
        });

        return {
            getArraySearch: function () {
                return arraySearchFilter;
            },
            searchFilter: searchFilter //Expose the searchFilter function
        };
    })();


    /** 
     * Get the filtered recipes based on the selected filters.
     ** @function [<getFilteredRecipes>]
     */
    function getFilteredRecipes() {
        const allFilters = searchInstance.getArraySearch();
        return recipes.filter(recipe => {

            let matchesAllCriteria = true;

            allFilters.forEach(([filterType, filterValues]) => {
                if (!matchesAllCriteria) return;

                switch (filterType) {
                    case 'searchBar':
                        const regex = new RegExp(filterValues.trim());
                        let match = false;
                        if (regex.test(recipe.name.toLowerCase())) match = true;
                        recipe.ingredients.forEach(({ ingredient }) => {
                            if (regex.test(ingredient.toLowerCase())) match = true;
                        });
                        recipe.ustensils.forEach(ust => {
                            if (regex.test(ust.toLowerCase())) match = true;
                        });
                        if (regex.test(recipe.appliance.toLowerCase())) match = true;
                        matchesAllCriteria = matchesAllCriteria && match;
                        break;

                    case 'ingredients':
                        const ingredients = recipe.ingredients.map(i => i.ingredient.toLowerCase());
                        matchesAllCriteria = matchesAllCriteria && filterValues.every(v =>
                            ingredients.some(i => i.includes(v))
                        );
                        break;

                    case 'ustensils':
                        const ustensils = recipe.ustensils.map(u => u.toLowerCase());
                        matchesAllCriteria = matchesAllCriteria && filterValues.every(v =>
                            ustensils.some(u => u.includes(v))
                        );
                        break;

                    case 'appliance':
                        const appliance = recipe.appliance.toLowerCase();
                        matchesAllCriteria = matchesAllCriteria && filterValues.every(v =>
                            appliance.includes(v)
                        );
                        break;
                }
            });
            return matchesAllCriteria;
        });
    }

    /**
     * Filter the recipes based on the search input and selected tags.
     * @function [<filterArrayFilter>]
     */
    function filterArrayFilter() {
        const filterSearch = searchFilterButton.getArraySearch();

        // Take the filtered recipes based on selected tags
        const selectedIngredients = Array.from(document.querySelectorAll('#selected-ingredient-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());
        const selectedUstensils = Array.from(document.querySelectorAll('#selected-ustensils-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());
        const selectedAppliance = Array.from(document.querySelectorAll('#selected-appliance-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());

        //filter the recipes based on the selected tags
        let filteredRecipes = recipes.filter(recipe => {
            let matches = true;

            if (selectedIngredients.length > 0) {
                const recipeIngredients = recipe.ingredients.map(i => i.ingredient.toLowerCase());
                const allFound = selectedIngredients.every(sel =>
                    recipeIngredients.some(ing => ing.includes(sel))
                );
                matches = matches && allFound;
            }

            if (selectedUstensils.length > 0) {
                const recipeUstensils = recipe.ustensils.map(u => u.toLowerCase());
                const allFound = selectedUstensils.every(sel =>
                    recipeUstensils.some(u => u.includes(sel))
                );
                matches = matches && allFound;
            }

            if (selectedAppliance.length > 0) {
                const recipeAppliance = recipe.appliance.toLowerCase();
                const allFound = selectedAppliance.every(sel =>
                    recipeAppliance.includes(sel)
                );
                matches = matches && allFound;
            }

            return matches;
        });

        // Take the available filters from the filtered recipes
        const allFilters = getAllFiltersFromRecipes(filteredRecipes);

        // If no search input is provided, display all available filters
        if (filterSearch.length === 0) {
            displayFilters('ingredient', allFilters.ingredients);
            displayFilters('ustensils', allFilters.ustensils);
            displayFilters('appliance', allFilters.appliance);
            return;
        }

        // Else, filter each type on the research
        filterSearch.forEach(([type, value]) => {
            const lowerValue = value.toLowerCase();

            switch (type) {
                case "ingredients":
                    const filteredIngredients = allFilters.ingredients.filter(ingredient =>
                        ingredient.includes(lowerValue)
                    );
                    displayFilters("ingredient", filteredIngredients);
                    break;

                case "ustensils":
                    const filteredUstensils = allFilters.ustensils.filter(ustensil =>
                        ustensil.includes(lowerValue)
                    );
                    displayFilters("ustensils", filteredUstensils);
                    break;

                case "appliance":
                    const filteredAppliance = allFilters.appliance.filter(appliance =>
                        appliance.includes(lowerValue)
                    );
                    displayFilters("appliance", filteredAppliance);
                    break;
            }
        });
    }

    const searchInstance = (function () {
        let searchInput = document.querySelector('.search-input');
        let form = document.querySelector('.search-form');
        let arraySearch = [];

        function applyFilters() {
            arraySearch = [];

            if (searchInput.value.length > 2) {
                let searchValue = searchInput.value.toLowerCase();
                arraySearch.push(["searchBar", searchValue]);
            }

            let selectedIngredients = [];
            let ingTags = document.querySelectorAll('#selected-ingredient-container .selected-tag');
            for (let i = 0; i < ingTags.length; i++) {
                selectedIngredients.push(ingTags[i].getAttribute('data-value').toLowerCase());
            }

            let selectedUstensils = [];
            let ustTags = document.querySelectorAll('#selected-ustensils-container .selected-tag');
            for (let i = 0; i < ustTags.length; i++) {
                selectedUstensils.push(ustTags[i].getAttribute('data-value').toLowerCase());
            }

            let selectedAppliance = [];
            let appTags = document.querySelectorAll('#selected-appliance-container .selected-tag');
            for (let i = 0; i < appTags.length; i++) {
                selectedAppliance.push(appTags[i].getAttribute('data-value').toLowerCase());
            }

            if (selectedIngredients.length > 0) arraySearch.push(['ingredients', selectedIngredients]);
            if (selectedUstensils.length > 0) arraySearch.push(['ustensils', selectedUstensils]);
            if (selectedAppliance.length > 0) arraySearch.push(['appliance', selectedAppliance]);

            filterArray();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });

        searchInput.addEventListener('input', function () {
            applyFilters();
        });

        return {
            getArraySearch: function () {
                return arraySearch;
            },
            applyFilters: applyFilters
        };
    })();

    function filterArray() {
        let arraySearch = searchInstance.getArraySearch();
        let filteredRecipes = [];

        for (let i = 0; i < recipes.length; i++) {
            let recipe = recipes[i];
            let matchesAllCriteria = true;

            for (let j = 0; j < arraySearch.length && matchesAllCriteria; j++) {
                let filterType = arraySearch[j][0];
                let filterValues = arraySearch[j][1];

                switch (filterType) {
                    case 'searchBar':
                        let regex = new RegExp(filterValues.trim());
                        let match = false;

                        if (regex.test(recipe.name.toLowerCase())) match = true;

                        for (let k = 0; k < recipe.ingredients.length && !match; k++) {
                            if (regex.test(recipe.ingredients[k].ingredient.toLowerCase())) match = true;
                        }

                        for (let k = 0; k < recipe.ustensils.length && !match; k++) {
                            if (regex.test(recipe.ustensils[k].toLowerCase())) match = true;
                        }

                        if (regex.test(recipe.appliance.toLowerCase())) match = true;

                        matchesAllCriteria = match;
                        break;

                    case 'ingredients':
                        let recipeIngs = [];
                        for (let k = 0; k < recipe.ingredients.length; k++) {
                            recipeIngs.push(recipe.ingredients[k].ingredient.toLowerCase());
                        }

                        for (let k = 0; k < filterValues.length; k++) {
                            let found = false;
                            for (let m = 0; m < recipeIngs.length; m++) {
                                if (recipeIngs[m].includes(filterValues[k])) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                matchesAllCriteria = false;
                                break;
                            }
                        }
                        break;

                    case 'ustensils':
                        let recipeUsts = [];
                        for (let k = 0; k < recipe.ustensils.length; k++) {
                            recipeUsts.push(recipe.ustensils[k].toLowerCase());
                        }

                        for (let k = 0; k < filterValues.length; k++) {
                            let found = false;
                            for (let m = 0; m < recipeUsts.length; m++) {
                                if (recipeUsts[m].includes(filterValues[k])) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                matchesAllCriteria = false;
                                break;
                            }
                        }
                        break;

                    case 'appliance':
                        let app = recipe.appliance.toLowerCase();
                        for (let k = 0; k < filterValues.length; k++) {
                            if (!app.includes(filterValues[k])) {
                                matchesAllCriteria = false;
                                break;
                            }
                        }
                        break;
                }
            }

            if (matchesAllCriteria) {
                filteredRecipes.push(recipe);
            }
        }

        displayRecipes(filteredRecipes);
        const updatedFilters = getAllFiltersFromRecipes(filteredRecipes);
        displayFilters('ingredient', updatedFilters.ingredients);
        displayFilters('ustensils', updatedFilters.ustensils);
        displayFilters('appliance', updatedFilters.appliance);
    }
});