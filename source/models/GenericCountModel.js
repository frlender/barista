// # **GenericCountModel**

// A Backbone.Model that represents the count of a set CMap databbase items.  The data model
// captures the total count of perturbagens that meet a search criteria.

// optional arguments:

// 1.  {string}  **search_field**  the document field the model with count over upon fetching data, defaults to *"pert_iname"*
// 2.  {string}  **url**  the url of the api service to fetch data from, defaults to *"http://api.lincscloud.org/a2/pertinfo"*

// `generic_count_model = new GenericCountModel()`
Barista.Models.GenericCountModel = Backbone.Model.extend({

  defaults:{
    count:0,

  },

  initialize:function(attrs){
    this.listenTo(attrs.source,'update',function(){
      if(attrs.source.getCount(attrs.key))
      this.set('count',attrs.source.getCount(attrs.key));
      else this.set('count',0);
    });
  }
});

Barista.Models.GenericSourceModel = Backbone.Model.extend({
  initialize:function(attrs){
    this.url = 'http://10.125.171.42:8080/' + attrs.key;
  },

  getCount:function(inputKey){
    return this.data[inputKey.group][inputKey.name];
  },

  update:function(){
    var self = this;
    $.getJSON(this.url,function(data){
      self.data = data;
      self.trigger('update');
    })
  }
})
