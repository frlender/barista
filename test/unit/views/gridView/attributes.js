define([
    '../common/expectViewAttributesFactory'
], function (expectViewAttributesFactory) {
        var attributesToTest = [
          'name',
          'search_val',
          'span_class',
          'legend',
          'no_download',
          'no_slice',
          'no_legend',
          'edit',
          'limit',
          'collection',
          'columns',
          'compile_template',
          'remove',
          'grid',
          'add_scroll_to_top_button',
          'collection',
          'change_slice_button_state',
          'checkscroll',
          'scroll_to_top',
          'show_scroll_to_top_button',
          'hide_scroll_to_top_button',
          'replace_collection',
          'update_collection',
          'clear_collection',
          'resize_div',
          'replace_collection',
          'slice_all_table_data',
          'change_slice_button_state',
          'download_table',
          'open_edit_table',
          'close_edit_table',
          'hide',
          'show'
        ];

      attributesToTest.forEach(function(attribute){
        expectViewAttributesFactory('GridView',attribute);
      });

});
