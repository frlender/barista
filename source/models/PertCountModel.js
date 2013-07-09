// # **PertCountModel**

// A Backbone.Model that represents the count of a set of perturbagens.  The data model
// captures both the total count of perturbagens that meet a search criteria and the count
// of each annotation category for the set of perturbagens.

// optional arguments:

// 1.  {string}  **type_string**  the string of pert_types that will be search upon fetching data, defaults to *'["trt_sh","trt_oe"]'*

// `pert_count_model = new PertCountModel({type_string: '["trt_sh","trt_oe"]'})`

PertCountModel = Backbone.Model.extend({
  // ### defaults
  // describes the model's default parameters

  // 1.  {String}  **type_string**  the string of pert_types that will be search upon fetching data, defaults to *'["trt_sh","trt_oe"]'*
  // 2.  {Number}  **pert\_count**  the number of perturbagens matching an api query, defaults to *0*
  // 3.  {Array}  **pert\_types**  an array of objects representing pert\_type categories to keep track of, defaults to *[{}}]*
  // 4.  {Date}  **last\_update**  a timestamp of the latest model update, defaults to the current time
  defaults: {
    "type_string": '["trt_sh","trt_oe"]',
    "pert_count": 0,
    "pert_types": [{}],
    "last_update": (new Date()).getTime()
  },

  // ### initialize
  // Overides the base Model initialize method to fetch data matching an empty string
  initialize: function () {
    this.fetch("");
  },

  // ### fetch
  // fetches new data from the pert_info api.  the count and pert_types data
  // is replaced with new data coming from the api call
  fetch: function(search_string,search_type){
    // depending on the type of query we are making, set up the q param for the api call.
    // if we are doing a single query, match that query as a regular expression. If we are
    // doing a multi query, match exact names. If we are doing a cell line query, only match
    // cell\_ids
    var pert_info = 'http://api.lincscloud.org/a2/pertinfo?callback=?';
    var params = {};
    if (search_type === "multi") {
      search_string = '["' + search_string.split(":").join('","') + '"]';
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$in":' + search_string + '}}',c:true};
    }
    if (search_type === "single" || search_type === undefined){
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$regex":"' + search_string + '","$options":"i"}}',c:true};
    }
    if (search_type === "cell") {
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$regex":"","$options":"i"},"cell_id":"' + search_string + '"}', c:true};
    }

    // run the api request
    var self = this;
    var num_perts;
    $.getJSON(pert_info,params,function(perts) {
      if (perts === 0){
        num_perts = 0;
      }else{
        num_perts = perts.count;
      }
      var t = (new Date()).getTime();
      self.set({pert_count: num_perts, pert_types: [{}], last_update: t});
    });
  }
});