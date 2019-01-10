// Array of data to store merch items
var merchItems = [
    {
        id: 1,
        name: "Red Shirt",
        src: "shirt-1.png",
        cost: 19.99
    },
    {
        id: 2,
        name: "Stripe Shirt",
        src: "shirt-2.png",
        cost: 24.99
    },
    {
        id: 3,
        name: "Blackbear Hoodie",
        src: "hoodie-1.png",
        cost: 37.99
    },
    {
        id: 4,
        name: "Joggers",
        src: "sweats-1.png",
        cost: 19.99
    },
    {
        id: 5,
        name: "Socks",
        src: "socks-1.png",
        cost: 8.99
    },
    {
        id: 6,
        name: "Mug",
        src: "mug-1.png",
        cost: 7.99
    },
    {
        id: 7,
        name: "Signed Photo",
        src: "photo-1.png",
        cost: 28.99
    },
    {
        id: 8,
        name: "Lighters",
        src: "lighters-1.png",
        cost: 4.99
    },
    {
        id: 9,
        name: "Phone Case",
        src: "phone-1.png",
        cost: 11.99
    }
]

// Initialise function
function init() {
    // Iterate all merch items and add them to the DOM
    for (var item of merchItems) {
        // Create a new div element and append to the parent container
        var div = $("<div></div>");
        $("#merch-container").append(div);
        // Create a new image tag, apply the source and append to the div
        var img = $("<img>");
        img.attr("src", "../assets/" + item.src);
        div.append(img);
        // Create a new header tag for the image and append to the div
        var name = $("<h1></h1>");
        name.text(item.name);
        div.append(name);
        // Create a new button to allow the item to be purchased
        var button = $("<button></button>");
        button.html("Buy now!<br>£" + item.cost);
        button.data("id", item.id);
        div.append(button);
        // Bind a click event to the button
        button.click(function (e) {
            // Get the button clicked ID data and find in the items array
            var clickId = $(e.target).data("id");
            var clickItem = merchItems.find(function (obj) {
                return obj.id == clickId;
            });
            // Create a new instance of the basket class
            var basket = new Basket();
            basket.addItem(clickItem);
        });
    }
}

// When the document is ready
$(document).ready(init);
