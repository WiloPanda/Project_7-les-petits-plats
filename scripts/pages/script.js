import recipes from '../../data/recipes.js';
import Recipe from '../models/Recipe.js';
import Filtertag from '../models/Filtertag.js';
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
     * Initialize the visual elements with the recipes data.
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
     * Update the recipe counter based on the number of visible recipes.
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
        element.classList.toggle('selected');

        if (element.classList.contains('selected')) {
            createSelectedTag(filterType, selectedValue);
        } else {
            removeSelectedTag(filterType, selectedValue);
        }
        // call applyFilters to update the search results
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

        if (container.querySelector(`[data-value="${value}"]`)) {
            return;
        }

        const tag = document.createElement('div');
        tag.className = 'selected-tag';
        tag.setAttribute('data-type', filterType);
        tag.setAttribute('data-value', value);
        tag.innerHTML = `
            <span>${value}</span>
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

        // remove the 'selected' class from the filter button
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

        // call applyFilters to update the search results
        searchInstance.applyFilters();
    }

    /**
     * Search function to filter recipes based on user input in the search bar.
     * @function [<searchFilterButton>]
     */
    const searchFilterButton = (function () {
        let searchInputFilter = document.querySelectorAll('.search-input-filter');
        let arraySearchFilter = [];

        function searchFilter() {
            let ingredientsSearch = document.querySelector('#ingredients-search');
            let ustensilsSearch = document.querySelector('#ustensils-search');
            let applianceSearch = document.querySelector('#appliances-search');

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
                // Rechercher dynamiquement dans les listes de filtres
                filterArrayFilter();
            } else {
                // Si aucun champ n’a 3 caractères, alors on réaffiche les filtres disponibles selon les recettes filtrées
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
     * Get filtered recipes based on the search criteria.
     * @function [<getFilteredRecipes>]
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
     * Filter the recipes based on the selected tags and search input.
     * @function [<filterArrayFilter>]
     */
    function filterArrayFilter() {
        const filterSearch = searchFilterButton.getArraySearch();

        const selectedIngredients = Array.from(document.querySelectorAll('#selected-ingredient-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());
        const selectedUstensils = Array.from(document.querySelectorAll('#selected-ustensils-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());
        const selectedAppliance = Array.from(document.querySelectorAll('#selected-appliance-container .selected-tag'))
            .map(tag => tag.getAttribute('data-value').toLowerCase());

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

    /**
    * Search function to filter recipes based on user input.
    * @function [<searchMain>]
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

    /**
     * Filter the recipes based on the search criteria.
     * @function [<filterArray>]
     */
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

        displayRecipes(filteredRecipes);
        //Mettre à jour les filtres disponibles selon les recettes filtrées
        const updatedFilters = getAllFiltersFromRecipes(filteredRecipes);

        displayFilters('ingredient', updatedFilters.ingredients);
        displayFilters('ustensils', updatedFilters.ustensils);
        displayFilters('appliance', updatedFilters.appliance);
    }
}
);