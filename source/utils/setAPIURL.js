// # **setAPIURL**

// a utility function to set an APIURL attribute on the Barista object

// arguments
//
// 1.  {string}  **url**  the url for an API endpoint that your would like barista to hit for all API calls. defaults to *"//api.lincscloud.org"*
Barista.setAPIURL = function(url) {
    url = (url !== undefined) ? url : '//api.lincscloud.org';
    Barista.APIURL = url;
};
