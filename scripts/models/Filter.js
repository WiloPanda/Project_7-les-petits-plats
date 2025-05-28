/**
 * Classe générique pour gérer les filtres (ingrédients, ustensiles, appareils)
 */
class Filtertag {
    /**
     * Crée un nouveau gestionnaire de filtres
     * @constructor
     * @param {string} type - Type de filtre ('ingredient', 'ustensil', ou 'appliance')
     * @param {Object[]} recipesData - Données des recettes
     */
    constructor(type, recipesData) {
        this.type = type;
        this.recipesData = recipesData;
        this.items = [];

        // Configuration spécifiques à chaque type de filtre
        this.config = {
            ingredient: {
                containerSelector: '#ingredients-list',
                dataProperty: 'ingredients',
                itemProperty: 'ingredient',
                cssClass: ''
            },
            ustensils: {
                containerSelector: '#ustensiles-list',
                dataProperty: 'ustensils',
                cssClass: ''
            },
            appliance: {
                containerSelector: '#appareils-list',
                dataProperty: 'appliance',
                cssClass: ''
            }
        };

        // Extraction des items selon le type
        this.extractItems();
    }

    /**
     * Extrait les items uniques à partir des données des recettes
     */
    extractItems() {
        const config = this.config[this.type];
        const uniqueItems = new Set();

        if (this.type === 'ingredient') {
            // Pour les ingrédients
            this.recipesData.forEach(recipe => {
                if (recipe[config.dataProperty]) {
                    recipe[config.dataProperty].forEach(item => {
                        if (item && item[config.itemProperty]) {
                            const itemValue = String(item[config.itemProperty]).toLowerCase();
                            if (!uniqueItems.has(itemValue)) {
                                uniqueItems.add(itemValue);
                                this.items.push(item);
                            }
                        }
                    });
                }
            });
        } else if (this.type === 'ustensils') {
            // Traitement spécial pour les ustensiles
            this.recipesData.forEach(recipe => {
                if (recipe[config.dataProperty]) {
                    // Convertir en tableau, que ce soit déjà un tableau ou une chaîne à diviser
                    const ustensilsArray = Array.isArray(recipe[config.dataProperty])
                        ? recipe[config.dataProperty]
                        : recipe[config.dataProperty].split(',');

                    // Traiter chaque ustensile
                    ustensilsArray.forEach(ustensil => {
                        const ustensilValue = String(ustensil).toLowerCase().trim();
                        if (ustensilValue && !uniqueItems.has(ustensilValue)) {
                            uniqueItems.add(ustensilValue);
                            this.items.push({ ustensil: ustensil.trim() });
                        }
                    });
                }
            });
        } else {
            // Pour les valeurs simples (appareils)
            this.recipesData.forEach(recipe => {
                if (recipe[config.dataProperty]) {
                    const itemValue = String(recipe[config.dataProperty]).toLowerCase();
                    if (!uniqueItems.has(itemValue)) {
                        uniqueItems.add(itemValue);
                        this.items.push({ [config.itemProperty]: recipe[config.dataProperty] });
                    }
                }
            });
        }
    }

    /**
     * Crée les éléments HTML pour la liste de filtres
     * @returns {HTMLElement[]} - Liste des éléments HTML créés
     */
    createFilterItems() {
        const config = this.config[this.type];

        return this.items.map(item => {
            const li = document.createElement('li');
            if (this.type === 'ustensils') {
                li.innerHTML = `<button class="${config.cssClass}">${item.ustensil}</button>`;
            } else {
                li.innerHTML = `<button class="${config.cssClass}">${item[config.itemProperty]}</button>`;
            }
            return li;
        });
    }
}

export default Filtertag;