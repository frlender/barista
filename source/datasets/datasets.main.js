// # **CellHistologyDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Cellular Contexts available in the Connectivity Map

// CellHistologyDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CellHistology:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CellHistology',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline","DIVR"]},"cell_histology":{"$regex":"%QUERY", "$options":"i"}}',
					  '&l=10',
					  '&s={"cell_id":1}'].join(''),

				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its cell_histology and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.cell_histology);
						object_map[element.cell_histology] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						_.extend(datum,{
							type: 'Cell Histology',
							search_column: 'cell_histology',
							color: '#BB4D8A',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);

// # **CellIDDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Cellular Contexts available in the Connectivity Map

// CellIDDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CellID:
			{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CellID',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline","DIVR"]},"cell_id":{"$regex":"%QUERY", "$options":"i"}}',
					  '&l=10',
					  '&s={"cell_id":1}'].join(''),
				
				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its cell_id and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.cell_id);
						object_map[element.cell_id] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						_.extend(datum,{
							type: 'Cell ID',
							search_column: 'cell_id',
							color: '#CC79A7',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);
// # **CellLineageDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Cellular Contexts available in the Connectivity Map

// CellLineageDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CellLineage: 
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CellLineage',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline","DIVR"]},"cell_lineage":{"$regex":"%QUERY", "$options":"i"}}',
					  '&l=10',
					  '&s={"cell_id":1}'].join(''),
				
				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its cell_lineage and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.cell_lineage);
						object_map[element.cell_lineage] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						_.extend(datum,{
							type: 'Cell Lineage',
							search_column: 'cell_lineage',
							color: '#DDA6C4',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);
// # **CellMutationDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Cellular mutation annotations available in the Connectivity Map

// CellMutationDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CellMutation: 
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CellMutation',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline","DIVR"]}}',
					  '&d=mutations'].join(''),
				
				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = response;

					// filter the list based on the query.  self comes from the closure in the view that calls the
					// dataset. It shold be a reference to the view that is consuming the dataset.  That view should
					// have a typeahead elment in it somewhere
					var re = new RegExp($(".typeahead",self.div_string).val(),"i");
					auto_data = _.filter(auto_data,function(mutation){return re.test(mutation);});

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: item
						}
						_.extend(datum,{
							type: 'Cell Mutation',
							search_column: 'mutations',
							color: '#999999',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);
// # **CompoundPertINameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Perturbation IDs available in the Connectivity Map

// CompoundPertINameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CompoundPertIName:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CompoundPertIName',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/pertinfo?',
		            'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}, "pert_type":"trt_cp"}',
		            '&f={"pert_iname":1,"pert_type":1}',
		            '&l=100',
		            '&s={"pert_iname":1}'].join(''),

				dataType: 'jsonp',

				filter: function(response){
					var genetic_types = ["trt_sh","trt_oe","trt_sh.cgs"];
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its pert_iname and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.pert_iname);
						object_map[element.pert_iname] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// add cell lines if required
					// if (self.match_cell_lines){
					// 	auto_data = auto_data.concat(self.cell_lines);
					// }

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						if (genetic_types.indexOf(object_map[item].pert_type) != -1){
							_.extend(datum,{
								type: 'Genetic Reagent',
								color: '#0072B2',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_cp' ){
							_.extend(datum,{
								type: 'Chemical Reagent',
								color: '#E69F00',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_sh.css' ){
							_.extend(datum,{
								type: 'Seed Sequence',
								color: '#009E73',
							});
							datum_list.push(datum);
							return datum_list;
						}else{
							_.extend(datum,{
								type: object_map[item].pert_type,
								color: '#999',
							});
							datum_list.push(datum);
							return datum_list;
						}
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);

// # **GeneticPertINameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Perturbation IDs available in the Connectivity Map

// GeneticPertINameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ GeneticPertIName:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'GeneticPertIName',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/pertinfo?',
		            'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}, "pert_type":{"$in":["trt_sh","trt_oe","trt_sh.cgs","trt_oe.mut"]}}',
		            '&f={"pert_iname":1,"pert_type":1}',
		            '&l=100',
		            '&s={"pert_iname":1}'].join(''),

				dataType: 'jsonp',

				filter: function(response){
					var genetic_types = ["trt_sh","trt_oe","trt_sh.cgs"];
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its pert_iname and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.pert_iname);
						object_map[element.pert_iname] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// add cell lines if required
					// if (self.match_cell_lines){
					// 	auto_data = auto_data.concat(self.cell_lines);
					// }

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						if (genetic_types.indexOf(object_map[item].pert_type) != -1){
							_.extend(datum,{
								type: 'Genetic Reagent',
								color: '#0072B2',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_cp' ){
							_.extend(datum,{
								type: 'Chemical Reagent',
								color: '#E69F00',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_sh.css' ){
							_.extend(datum,{
								type: 'Seed Sequence',
								color: '#009E73',
							});
							datum_list.push(datum);
							return datum_list;
						}else{
							_.extend(datum,{
								type: object_map[item].pert_type,
								color: '#999',
							});
							datum_list.push(datum);
							return datum_list;
						}
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);

// # **JobIDDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// job IDs available in the Connectivity Map

// JobIDDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { JobID:
            {
            // only return 2 items at a time in the autocomplete dropdown
            limit: 2,

            // provide a name for the default typeahead data source
            name: 'JobID',

            // the template to render for all results
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: ['http://api.lincscloud.org/compute_status?',
                      'q={"job_id":{"$regex":"%QUERY", "$options":"i"}}',
                      '&l=10',
                      '&s={"job_id":1}'].join(''),

                dataType: 'jsonp',

                filter: function(response){
                    var datum_list = [];
                    var auto_data = [];
                    var object_map = {};

                    // for each item, pull out its job_id and use that for the
                    // autocomplete value. Build a datum of other relevant data
                    // for use in suggestion displays
                    response.forEach(function(element){
                        auto_data.push(element.job_id);
                        object_map[element.job_id] = element;
                    });

                    // make sure we only show unique items
                    auto_data = _.uniq(auto_data);

                    // build a list of datum objects
                    auto_data.forEach(function(item){
                        var datum = {
                            value: item,
                            tokens: [item],
                            data: object_map[item]
                        }
                        _.extend(datum,{
                            type: 'Job',
                            search_column: 'job_id',
                            color: '#BDBDBD',
                        });
                        datum_list.push(datum);
                    });

                    // return the processed list of datums for the autocomplete
                    return datum_list;
                }
            }
        }
    }
);

// # **JobNameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// job IDs available in the Connectivity Map

// JobNameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { JobName:
            {
            // only return 2 items at a time in the autocomplete dropdown
            limit: 2,

            // provide a name for the default typeahead data source
            name: 'JobName',

            // the template to render for all results
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: ['http://api.lincscloud.org/compute_status?',
                      'q={"params.rpt":{"$regex":"%QUERY", "$options":"i"}}',
                      '&l=10',
                      '&s={"job_id":1}'].join(''),

                dataType: 'jsonp',

                filter: function(response){
                    var datum_list = [];
                    var auto_data = [];
                    var object_map = {};

                    // for each item, pull out its job_id and use that for the
                    // autocomplete value. Build a datum of other relevant data
                    // for use in suggestion displays
                    response.forEach(function(element){
                        auto_data.push(element.params.rpt);
                        object_map[element.params.rpt] = element;
                    });

                    // make sure we only show unique items
                    auto_data = _.uniq(auto_data);

                    // build a list of datum objects
                    auto_data.forEach(function(item){
                        var datum = {
                            value: item,
                            tokens: [item],
                            data: object_map[item]
                        }
                        _.extend(datum,{
                            type: 'Job Name',
                            search_column: 'params.rpt',
                            color: '#77A2A6',
                        });
                        datum_list.push(datum);
                    });

                    // return the processed list of datums for the autocomplete
                    return datum_list;
                }
            }
        }
    }
);

// # **JobStatusDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// job Statuses available in the Connectivity Map

// JobStatusDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { JobStatus:
            {
            // only return 2 items at a time in the autocomplete dropdown
            limit: 2,

            // provide a name for the default typeahead data source
            name: 'JobStatus',

            // the template to render for all results
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: ['http://api.lincscloud.org/compute_status?',
                      'q={"status":{"$regex":"%QUERY", "$options":"i"}}',
                      '&l=10',
                      '&s={"status":1}'].join(''),

                dataType: 'jsonp',

                filter: function(response){
                    var datum_list = [];
                    var auto_data = [];
                    var object_map = {};

                    // for each item, pull out its status and use that for the
                    // autocomplete value. Build a datum of other relevant data
                    // for use in suggestion displays
                    response.forEach(function(element){
                        auto_data.push(element.status);
                        object_map[element.status] = element;
                    });

                    // make sure we only show unique items
                    auto_data = _.uniq(auto_data);

                    // build a list of datum objects
                    auto_data.forEach(function(item){
                        var datum = {
                            value: item,
                            tokens: [item],
                            data: object_map[item]
                        }
                        _.extend(datum,{
                            type: 'Status',
                            search_column: 'status',
                            color: '#B14A4E',
                        });
                        datum_list.push(datum);
                    });

                    // return the processed list of datums for the autocomplete
                    return datum_list;
                }
            }
        }
    }
);

// # **P100PertINameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// P100 Perturbation IDs available in the Connectivity Map

// P100PertINameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ P100PertIName:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'P100PertIName',

			// the template to render for all results
			template: '<span class="label" style="background-color: #7bd9e4">P100</span><span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://prefix:8080/p100/v1/profileinfo?',
					  'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}}',
					  '&f={"pert_iname":1}',
					  '&l=100',
					  '&s={"pert_iname":1}'].join(''),
				
				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its pert_iname and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.pert_iname);
						object_map[element.pert_iname] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// add cell lines if required
					// if (self.match_cell_lines){
					// 	auto_data = auto_data.concat(self.cell_lines);	
					// }

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						_.extend(datum,{
							type: 'Chemical Reagent',
							color: '#E69F00',
						});
						datum_list.push(datum);
						return datum_list;
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);
// # **PRISMPertINameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// PRISM Perturbation IDs available in the Connectivity Map

// PRISMPertINameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ PRISMPertIName:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'PRISMPertIName',

			// the template to render for all results
			template: '<span class="label" style="background-color: #8387e6">PRISM</span><span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/prism/v1/profileinfo?',
					  'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}}',
					  '&f={"pert_iname":1}',
					  '&l=100',
					  '&s={"pert_iname":1}'].join(''),
				
				dataType: 'jsonp',

				filter: function(response){
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its pert_iname and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.pert_iname);
						object_map[element.pert_iname] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// add cell lines if required
					// if (self.match_cell_lines){
					// 	auto_data = auto_data.concat(self.cell_lines);	
					// }

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						_.extend(datum,{
							type: 'Chemical Reagent',
							color: '#E69F00',
						});
						datum_list.push(datum);
						return datum_list;
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);
// # **CompoundPertINameDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Perturbation IDs available in the Connectivity Map

// CompoundPertINameDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CompoundPertIName:
			{
			// only return 2 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'CompoundPertIName',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use cellinfo with custom query params
				url: ['http://api.lincscloud.org/a2/pertinfo?',
		            'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}, "pert_type":"trt_cp"}',
		            '&f={"pert_iname":1,"pert_type":1}',
		            '&l=100',
		            '&s={"pert_iname":1}'].join(''),

				dataType: 'jsonp',

				filter: function(response){
					var genetic_types = ["trt_sh","trt_oe","trt_sh.cgs"];
					var datum_list = [];
					var auto_data = [];
					var object_map = {};

					// for each item, pull out its pert_iname and use that for the
					// autocomplete value. Build a datum of other relevant data
					// for use in suggestion displays
					response.forEach(function(element){
						auto_data.push(element.pert_iname);
						object_map[element.pert_iname] = element;
					});

					// make sure we only show unique items
					auto_data = _.uniq(auto_data);

					// add cell lines if required
					// if (self.match_cell_lines){
					// 	auto_data = auto_data.concat(self.cell_lines);
					// }

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						}
						if (genetic_types.indexOf(object_map[item].pert_type) != -1){
							_.extend(datum,{
								type: 'Genetic Reagent',
								color: '#0072B2',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_cp' ){
							_.extend(datum,{
								type: 'Chemical Reagent',
								color: '#E69F00',
							});
							datum_list.push(datum);
							return datum_list;
						}
						if (object_map[item].pert_type === 'trt_sh.css' ){
							_.extend(datum,{
								type: 'Seed Sequence',
								color: '#009E73',
							});
							datum_list.push(datum);
							return datum_list;
						}else{
							_.extend(datum,{
								type: object_map[item].pert_type,
								color: '#999',
							});
							datum_list.push(datum);
							return datum_list;
						}
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
		}
	}
);

// # **ToolIDDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Tool IDs available in the Connectivity Map

// ToolIDDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { ToolID:
            {
            // only return 2 items at a time in the autocomplete dropdown
            limit: 2,

            // provide a name for the default typeahead data source
            name: 'ToolID',

            // the template to render for all results
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: ['http://api.lincscloud.org/compute_status?',
                      'q={"tool_id":{"$regex":"%QUERY", "$options":"i"}}',
                      '&l=10',
                      '&s={"tool_id":1}'].join(''),

                dataType: 'jsonp',

                filter: function(response){
                    var datum_list = [];
                    var auto_data = [];
                    var object_map = {};

                    // for each item, pull out its tool_id and use that for the
                    // autocomplete value. Build a datum of other relevant data
                    // for use in suggestion displays
                    response.forEach(function(element){
                        auto_data.push(element.tool_id);
                        object_map[element.tool_id] = element;
                    });

                    // make sure we only show unique items
                    auto_data = _.uniq(auto_data);

                    // build a list of datum objects
                    auto_data.forEach(function(item){
                        var datum = {
                            value: item,
                            tokens: [item],
                            data: object_map[item]
                        }
                        _.extend(datum,{
                            type: 'Tool',
                            search_column: 'tool_id',
                            color: '#005CF2',
                        });
                        datum_list.push(datum);
                    });

                    // return the processed list of datums for the autocomplete
                    return datum_list;
                }
            }
        }
    }
);

// # **UserIDDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// user IDs available in the Connectivity Map

// UserIDDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { UserID:
            {
            // only return 2 items at a time in the autocomplete dropdown
            limit: 2,

            // provide a name for the default typeahead data source
            name: 'UserID',

            // the template to render for all results
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: ['http://api.lincscloud.org/compute_status?',
                      'q={"user_id":{"$regex":"%QUERY", "$options":"i"}}',
                      '&l=10',
                      '&s={"job_id":1}'].join(''),

                dataType: 'jsonp',

                filter: function(response){
                    var datum_list = [];
                    var auto_data = [];
                    var object_map = {};

                    // for each item, pull out its job_id and use that for the
                    // autocomplete value. Build a datum of other relevant data
                    // for use in suggestion displays
                    response.forEach(function(element){
                        auto_data.push(element.params.rpt);
                        object_map[element.params.rpt] = element;
                    });

                    // make sure we only show unique items
                    auto_data = _.uniq(auto_data);

                    // build a list of datum objects
                    auto_data.forEach(function(item){
                        var datum = {
                            value: item,
                            tokens: [item],
                            data: object_map[item]
                        }
                        _.extend(datum,{
                            type: 'Job Name',
                            search_column: 'params.rpt',
                            color: '#DAA848',
                        });
                        datum_list.push(datum);
                    });

                    // return the processed list of datums for the autocomplete
                    return datum_list;
                }
            }
        }
    }
);
