// # **JobStatusDataset**
// An object that extends Barista.Datasets to specify a backing dataset for
// job Statuses available in the Connectivity Map

// JobStatusDataset is typically not used directly, rather it's content
// is extracted from Barista.Datasets in views such as CMapSearchView

Barista.Datasets = _.extend(Barista.Datasets,
    { JobStatus:
            {
            // only return 6 items at a time in the autocomplete dropdown
            /**
             * only return 6 items at a time in the autocomplete dropdown
             * @type {Number}
             */
            limit: 6,

            // provide a name for the default typeahead data source
            /**
             * provide a name for the default typeahead data source
             * @type {String}
             */
            name: 'JobStatus',

            // the template to render for all results
            /**
             * the template to render for all results
             * @type {String}
             */
            template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

            // use twitter's hogan.js to compile the template for the typeahead results
            /**
             * use twitter's hogan.js to compile the template for the typeahead results
             * @type {[type]}
             */
            engine: Hogan,

            remote: {
                // set the remote data source to use cellinfo with custom query params
                url: '',
                  /**
                    * set the remote data source to use cellinfo with custom query params
                    * @param  {string}  url
                    * @param  {string}  query
                    */ 
                replace: function(url,query){
                    query = (query[0] === "*") ? query.replace("*",".*") : query;
                    return [Barista.APIURL + '/compute_status?',
                          'q={"status":{"$regex":"^' + query + '", "$options":"i"}}',
                          '&l=10',
                          '&s={"status":1}'].join('')
                },

                dataType: 'jsonp',
                /**
                 * add description
                 * @param {string} response 
                 */
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
