// Class to access the basket and update/ retrieve items
class Basket {

    // Default empty constructor for the class
    constructor() {}

    // Method to add an item to the basket and store in session storage
    addItem(item) {
        // If no item was found, return
        if (!item)
            return;
        // Append the quantity as 1 if none is found
        if (!item.qty)
            item.qty = 1;
        // Append the quantity as an empty string is none is found
        if (!item.desc)
            item.desc = "";
        // If no session storage is available, return
        if (!sessionStorage)
            return;
        // Create an array to store basket items
        var basketItems = [];
        // Check if the session storage already has basket items present
        if (sessionStorage.getItem("basket"))
            basketItems = JSON.parse(sessionStorage.getItem("basket"));
        // Check if an item with the name and description specified already exists
        var basketItem = basketItems.find(function (obj) {
            return obj.name == item.name && obj.desc == item.desc;
        });
        if (basketItem) {
            // Update the quantity on the time
            basketItem.qty += item.qty;
        } else {
            // Create a new item and store in the array
            var addItem = {
                name: item.name,
                desc: item.desc,
                cost: item.cost,
                qty: item.qty
            };
            basketItems.push(addItem);
        }
        // Update the session storage with the new item
        sessionStorage.setItem("basket", JSON.stringify(basketItems));
        // Grab the basket icon and update
        $("#basket-icon").animate({
            width: "+=50px",
            height: "+=50px",
            right: "+=25px",
            bottom: "+=25px"
        }, 200, function () {
            $("#basket-icon").animate({
                width: "-=50px",
                height: "-=50px",
                right: "-=25px",
                bottom: "-=25px"
            }, 200, function () {});
        });
    };

    // Method to load the items onto a display
    loadItems() {
        // If there is no session storage or no session storage basket value, return an empty array
        if (!sessionStorage || !sessionStorage.getItem("basket"))
            return [];
        // Return the basket value from session storage
        return JSON.parse(sessionStorage.getItem("basket"));
    }
    
    // Method to clear the basket
    clear() {
        // If session storage is not available, return
        if (!sessionStorage)
            return;
        // Set the basket item in session storage to an empty array
        sessionStorage.setItem("basket", JSON.stringify([]));
    }
    
}
