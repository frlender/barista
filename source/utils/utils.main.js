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
			return {name: "Small Molecule Compound", acronym: "SMC"};
		case "trt_sh":
			return {name: "Knock Down", acronym: "KD"};
		case "trt_oe":
			return {name: "Over Expression", acronym: "OE"};
		case "trt_oe.mut":
			return {name: "Variant", acronym: "VAR"};
		default:
			return {name: input_type, acronym: input_type};
	}
};
// # **arrayAverage**

// a utility function to to take the average of an array of numeric values

//		//evaluates to 2
//		var a = arrayAverage([1,2,3]);
Barista.arrayArverage = function arrayAverage (arr){
	return _.reduce(arr, function(memo, num){
		return memo + num;
	}, 0) / arr.length;
};