// Variable to store the number of items currently loaded
var loaded = 5;
var max = 0;
var step = 5;

// Main init function
function init() {
    // Select tour date buttons and apply click event
    $(".tour-item button").click(function(event) {
        // Get the parent container
        var parent = $(event.target).parent().parent();
        // Create a new object to store the basket item
        var item = {
            name: "Ticket",
            desc: "",
            cost: 54.99,
            qty: 1
        }
        // Append the date and location to the description
        item.desc += parent.children(":nth-child(1)").text();
        item.desc += "<br>" + parent.children(":nth-child(2)").html();
        // Create a new basket instance and add the item
        var basket = new Basket();
        basket.addItem(item);
    });
    // Select all the tour date items
    var tourDates = $(".tour-item");
    // Assign the maximum length
    max = tourDates.length;
    // Check if there is more images to load
    if (max > 5) {
        // Remove all elements excluding the first 5
        tourDates.slice(5).detach();
        // Bind the tour load event
        $("#tour-load").click(function (event) {
            // If there are more to be loaded
            if (loaded < max) {
                // Work out the number of images to load
                var toLoad = (max - loaded < step ? max - loaded : step);
                // Append the tour dates to the list and increment the currently loaded amount counter
                tourDates.slice(loaded + 1, loaded + 1 + toLoad).css("opacity", 0).appendTo("#tour-list").animate({
                    opacity: 1
                }, 1000);
                loaded += toLoad;
            }
            // Remove the button if no more tour dates are present
            if (loaded >= max)
                $("#tour-load").detach();
        });
    } else {
        // Remove the button as no more are present
        $("#tour-load").detach();
    }
}

// Call the init function when the document is ready
$(document.body).ready(init);
