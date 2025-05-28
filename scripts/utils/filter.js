function filterDropdown() {
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            const isExpanded = button.getAttribute("aria-expanded") === "true";
            const dropdownContent = button.nextElementSibling;

            if (dropdownContent) {
                if (isExpanded) {
                    // Fermeture
                    button.setAttribute("aria-expanded", "false");
                    dropdownContent.classList.remove("open");

                } else {
                    // Ouverture
                    button.setAttribute("aria-expanded", "true");
                    dropdownContent.classList.add("open");
                }
            }
        });
    });
}

export default filterDropdown;
