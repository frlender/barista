// # **CMapPertTypeAlias**

// a utility function to convert standard perturbagen type descriptors into 
// more human friendly strings. Given an input type string, an object is 
// returned with field names of 'name' and 'acronym'.  If the passed string
// is not a recoqnized type, the 'name' and 'acronym' fields are set to the 
// passed string


//		var pert_type_object = CMapPertTypeAlias("trt_cp");
//		pert_type_object.name;
//		pert_type_object.acronym;
Barista.CMapPertTypeAlias = function(input_type){
	switch(input_type){
		case "trt_cp":
			return {name: "small molecule compound", acronym: "SMC"};
		case "trt_sh":
			return {name: "knock down", acronym: "KD"};
		case "trt_oe":
			return {name: "over expression", acronym: "OE"};
		case "trt_oe.mut":
			return {name: "variant", acronym: "VAR"};
		case "DOS":
			return {name: "tool compounds", acronym: "DOS"};
		case "BIOA":
			return {name: "drugs and bioactives", acronym: "BIOA"};
		default:
			return {name: input_type, acronym: input_type};
	}
};
// # **arrayAverage**

// a utility function to take the average of an array of numeric values

//		//evaluates to 2
//		var a = arrayAverage([1,2,3]);
Barista.arrayAverage = function arrayAverage (arr){
	return _.reduce(arr, function(memo, num){
		return memo + num;
	}, 0) / arr.length;
};
// # **getEmSizeInPixels**

// a utility function to find the size of 1em for the given element id
Barista.getEmSizeInPixels = function(id) {
    var el = document.body;
    return Number(getComputedStyle(el, "").fontSize.match(/(\d+)px/)[1]);
}
// # **setUserKey**

// a utility function to set a user_key attribute on the Barista object and set up
// ajax calls to api.lincscloud.org to pass that user_key as a parameter

// arguments
// 
// 1.  {string}  **key**  The user_key to use or a path to a JSON file containing a user_key attribute, defaults to *""*
Barista.setUserKey = function(key) {
	// grab the user_key from the url given by string passed in 'key' or set the string itself
	// as user_key if an ajax call to the string fails
	var key_request = $.getJSON(key,{async: false});
	key_request.done(function(res){
		Barista.user_key = res.user_key;
	});
	key_request.fail(function(){
		Barista.user_key = key;
	});

	// configure ajax calls to add the user key parameter on calls to api.lincscloud.org
	key_request.always(function(){
			$.ajaxPrefilter(function( options, originalOptions, jqXHR ){
			var re = new RegExp('api.lincscloud.org');
			if (re.test(options.url)){
				options.data = $.param($.extend(originalOptions.data,{user_key:Barista.user_key}));
			}
		});
	});
};