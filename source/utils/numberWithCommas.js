// # **numberWithCommas**

// a utility function to return a number with commas every three digits
// credit to Elias Zamaria http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
Barista.numberWithCommas = function(x){
    // first check to see if something was passed. if so, convert it
    console.log('x == 0: ' + x == 0);
    if (x == 0) {
      return 0;
    } else {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};
