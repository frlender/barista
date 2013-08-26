// # **PertDetailModel**

// A Backbone.Model that represents a single perturbagen's description.  The data
// model captures both the short and long description of a single perturbagen that 
// meet a search criteria.

// optional arguments:

// 1.  {String}  **short\_description**  the short description of a perturbagen (pert_iname), defaults to *""*
// 2.  {Number}  **long\_description**  the long description of a perturbagen (pert_desc), defaults to *""*
// 3.  {String}  **gene\_wiki\_link**  the link to a gene's wikipedia link if the perturbagen is a gene, defaults to *""*

// `pert_detail_model = new PertDetailModel()`

Barista.Models.PertDetailModel = Backbone.Model.extend({
  // ### defaults
  // describes the model's default parameters

  // 1.  {String}  **short\_description**  the short description of a perturbagen (pert_iname), defaults to *""*
  // 2.  {Number}  **long\_description**  the long description of a perturbagen (pert_desc), defaults to *""*
  // 3.  {String}  **gene\_wiki\_link**  the link to a gene's wikipedia link if the perturbagen is a gene, defaults to *""*
  defaults: {
    short_description: "",
    long_description: "",
    gene_wiki_link: ""
  },

  // ### initialize
  // Overides the base Model initialize method to fetch data matching an empty string
  //    pert_count_view.initialize();
  initialize: function () {
    this.fetch("");
  },

  // ### fetch
  // fetches new data from the pert_info api.  the short_description and long_description
  // are replaced with new data coming from the api call
  fetch: function(search_string){
    // set up the api parameters to make a regular expression matched query against
    // pert_inames in pertinfo and retrieve the first result's pert_iname and pert_desc
    var pert_info = 'http://api.lincscloud.org/a2/pertinfo?callback=?';
    var params = params = {q:'{"pert_iname":{"$regex":"' + search_string + '", "$options":"i"}}',
                          l:1};

    // run the api request.  If the search string is "", set the short and long
    // description to undefined and trigger a "PertDetailModel:ModelIsNull" event.
    // Otherwise, retrive the pert_iname and pert_desc of the response and set
    // them to the model and trigger a "PertDetailModel:ModelIsNotNull" event
    var self = this;
    var short_description, long_description, num_perts;
    $.getJSON(pert_info,params,function(perts) {
      if (perts == 0 || search_string == ""){
        short_description = undefined;
        long_description = undefined;
        self.trigger("PertDetailModel:ModelIsNull");
      }else{
        short_description = perts[0].pert_iname;
        if (perts[0].gene_title !== undefined){
          long_description = perts[0].gene_title;
          self.set({gene_wiki_link: 'http://en.wikipedia.org/wiki/' + short_description + '_(gene)'});
        }
        if(perts[0].pubchem_cid !== undefined){
          long_description = "PubChem ID: " + perts[0].pubchem_cid;
          self.set({gene_wiki_link: ""});
        }
        self.trigger("PertDetailModel:ModelIsNotNull");
      }
      var t = (new Date()).getTime();
      self.set({short_description: short_description, long_description: long_description, last_update: t});
      self.set(perts[0])
    });
  }
});