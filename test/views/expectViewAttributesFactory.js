define([
    'intern!bdd',
    'intern/chai!expect',
    'intern/order!barista.main.min.js'
], function (bdd, expect) {
  return function(view,attribute){
      with(bdd){
        /*************************
         * Attributes test suite *
         *************************/
        describe(view, function(){

          it('should have a ' + attribute + ' attribute', function(){
            view = new Barista.Views[view]();
            expect(view[attribute]).to.not.be.undefined;
          });

        });
      }
    }
});
