// # **CellMutationDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// Cellular mutation annotations available in the Connectivity Map

// CellMutationDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
	{ CellMutation: 
			{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 4,

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