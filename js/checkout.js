// Initialise function
function init() {
    // Create a new basket instance and get the items
    var basket = new Basket();
    var items = basket.loadItems();
    // Iterate all items and append the correct html to the parent
    for (var item of items) {
        // Create new div element for the parent and add a class
        var div = $("<div></div>").addClass("basket-item");
        // Create spans for content and append to the div
        $("<span></span>").text(item.name).appendTo(div);
        $("<span></span>").html(item.desc).appendTo(div);
        $("<span></span>").text(item.qty).appendTo(div);
        $("<span></span>").text("£" + (item.qty * item.cost).toFixed(2)).appendTo(div);
        $("#basket-items .basket-container").append(div);
    }
    
    // Bind click event to empty basket button
    $(".empty-basket").click(function (event) {
        // Call the basket clear function
        basket.clear();
        // Select the baskets items to remove them from the DOM
        $("#basket-items .basket-container .basket-item").remove();
    });
}

// Wait for document to be ready
$(document).ready(init);