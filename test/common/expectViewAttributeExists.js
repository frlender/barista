define([
  'intern!bdd',
  'intern/chai!expect',
], function( bdd, expect){
  return function(remote,viewName,attribute) {
    return remote
      .execute(function(){
        foo = new Barista.Views[viewName]({el:'#target'});
        return foo[attribute];
        })
      .then(function(data){
        expect(data).to.be.true;
      })
  }
});
