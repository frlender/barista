// # **GenericMongoModel**

// A Backbone.Model that represents a generic MongoDB object.  All fields in the document
// are passed to the model as normal and a date attribute is set from the _id field of the mongo document
// `pert_model = new GenericMongoModel()`
Barista.Models.GenericMongoModel = Backbone.Model.extend({
    defaults:{
        date: new Date(parseInt(this.get("_id").substring(0,8), 16)*1000)
    }
});
