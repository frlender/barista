//		Barista.js 0.2.0
//		(c) 2013 Corey Flynn, Broad Institute.
//		For all documentation:
//		http://cmap.github.io/barista

// ### Initial Setup
// build the top level namespace.  All Barista components will be exposed through this object
var Barista = {};

// current version of the library
Barista.VERSION = '0.2.0';

// build objects to be extended for Models, Collections, and Views
Barista.Models = {};
Barista.Collections = {};
Barista.Views = {};

// build an array to contain backing datasets definitions
Barista.Datasets = {};

// configure ajax calls to add the user key parameter on calls to api.lincscloud.org
$.ajaxPrefilter(function( options, originalOptions, jqXHR ){
	var re = new RegExp('api.lincscloud.org');
	if (re.test(options.url)){
		options.data = $.param($.extend(originalOptions.data,{user_key:Barista.user_key}));
	}
});