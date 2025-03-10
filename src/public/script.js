document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("categories");

    if (!list) {
        console.error("Element with ID 'categories' not found!");
        return;
    }

    try {
        const response = await fetch("/categories");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const categories = await response.json();
        
        list.innerHTML = categories.map(cat => `<a href=categories/${cat.name.toLowerCase()}><li class="category">${cat.name}</li>`).join('');

    } catch (error) {
        console.error("Failed to fetch categories:", error);
        list.innerHTML = "<li>Error loading categories</li>";
    }
});