define([
    '../common/expectViewAttributesFactory'
], function (expectViewAttributesFactory) {
        var attributesToTest = [
          'initialize',
          'name',
          'model',
          'base_initialize',
          'compile_template',
          'render',
          'base_render',
          'update',
          'save_png',
          'save_png_pre',
          'save_png_post',
          'hide',
          'show'
        ];

      attributesToTest.forEach(function(attribute){
        expectViewAttributesFactory('BaristaBaseView',attribute);
      });

});
