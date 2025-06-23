/**
 * Classe simplifiée pour créer les items HTML des filtres
 */
class Filtertag {
    constructor(type, itemsArray) {
        this.type = type;
        this.items = itemsArray;
        this.config = {
            ingredient: {
                containerSelector: '#ingredients-list',
                cssClass: ''
            },
            ustensils: {
                containerSelector: '#ustensiles-list',
                cssClass: ''
            },
            appliance: {
                containerSelector: '#appareils-list',
                cssClass: ''
            }
        };
    }

    /**
     * Crée les éléments HTML pour la liste de filtres
     * @returns {HTMLElement[]} - Liste des éléments HTML créés
     */
    createFilterItems() {

        return this.items.map(item => {
            const li = document.createElement('li');
            li.innerHTML = `<button>${item}</button>`;
            return li;
        });
    }
}

export default Filtertag;
