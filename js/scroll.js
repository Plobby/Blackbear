// Main function for object initialisation
function init() {
    // Initialise hover events for the button activity
    $("#logobar #logo").hover(function (event) {
        // Add the active class to the background image
        $("#logobar #logo-back").addClass("active");
    }, function (event) {
        // Remove the active class from the background image
        $("#logobar #logo-back").removeClass("active");
    });
    // Bind scroll event to the go button
    $("#logobar #logo").click(function () {
        scrollToElement("#about");
    });
    // Bind scroll event to the home button
    $("#navhome").click(function () {
        scrollToPosition(0);
    });
    // Bind scroll event to the about button
    $("#navabout").click(function () {
        scrollToElement("#about");
    });
    // Bind scroll event to the music button
    $("#navmusic").click(function () {
        scrollToElement("#music");
    });
    // Bind scroll event to the tours button
    $("#navtours").click(function () {
        scrollToElement("#tours");
    });
    // Bind scroll event to the merch button
    $("#navmerch").click(function () {
        scrollToElement("#merch");
    });
    // Bind scroll event to the contact button
    $("#navcontact").click(function () {
        scrollToElement("#contact");
    });
}

// Function for when the page is scrolled
function onScroll(event) {
    var scrollHeight = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollHeight >= ($("#logobar").height() - $("#infobar").height())) {
        if (!$("#infobar").hasClass("solid"))
            $("#infobar").addClass("solid");
        $("#infobar #navlogo").css("flex", "1").css("height", "50px");
    } else {
        $("#infobar #navlogo").css("flex", "0").css("height", "0");
        $("#infobar").removeClass("solid");
    }
}

// Function to scroll the page to an element over a specified time - default 1000ms (1s)
function scrollToElement(selector, time = 1000) {
    $("html, body").animate({
        scrollTop: $(selector).offset().top - $("#infobar").height() + 3
    }, time);
}

// Function to scroll the page to an exact position over a specified time - default 1000ms (1s)
function scrollToPosition(pos, time = 1000) {
    $("html, body").animate({
        scrollTop: pos
    }, time);
}

// Document ready event to call init function
$(document).ready(init);
// Scroll event to format navigation bar appearance
$(document).scroll(onScroll);
