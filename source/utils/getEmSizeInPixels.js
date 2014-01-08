// # **getEmSizeInPixels**

// a utility function to find the size of 1em for the given element id
Barista.getEmSizeInPixels = function(id) {
    var el = document.getElementById(id);
    return Number(getComputedStyle(el, "").fontSize.match(/(\d+)px/)[1]);
}