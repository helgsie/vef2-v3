document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("categories");

    if (!list) {
        console.error("Hlutur með ID 'categories' ekki fundinn!");
        return;
    }

    try {
        const response = await fetch("/categories");
        if (!response.ok) {
            throw new Error(`HTTP villa! Staða: ${response.status}`);
        }

        const categories = await response.json();
        
        list.innerHTML = categories.map(cat => `<a href=categories/${cat.name.toLowerCase()}><li class="category">${cat.name}</li>`).join('');

    } catch (error) {
        console.error("Villa við að sækja flokka:", error);
        list.innerHTML = "<li>Villa við að sækja flokka</li>";
    }
});