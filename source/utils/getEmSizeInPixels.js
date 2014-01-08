// # **getEmSizeInPixels**

// a utility function to compute the size of input em to pixels
Barista.getEmSizeInPixels = function(el) {
    return Number(getComputedStyle(el, "").fontSize.match(/(\d+)px/)[1]);
}