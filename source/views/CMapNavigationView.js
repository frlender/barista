// # **CMapNavigationView**

// A view the provides the standard Connectivity map application navigation for apps built on apps.lincscloud.org
// basic use:

//		nav = new CMapNavigationView({el:"header_target"});

Barista.Views.CMapNavigationView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "CMapNavigationView",

	// ### initialize
	// overide the default Backbone.View initialize function to compile a built in template and then render the view
	initialize: function(){
        var self = this;

        // store passed parameters as attributes of the view
		this.items = (this.options.items !== undefined) ? this.options.items : ["data synopsis","query"];
        this.links = (this.options.links !== undefined) ? this.options.links : ["/data_synopsis","/query"];


        // wrap the content
        this.wrap_content();

        // build the navigation panel
        this.build_navigation();

	},

    // ### wrap_content
    // wrap all existing content in the elements we need to work
    // the slide out navigation that we are going to build
    wrap_content: function(){
        $("body").children().wrapAll('<div class="cmap-navigation-content"/>');
        $(".cmap-navigation-content").wrapAll('<div class="cmap-navigation-wrapper"/>');
    },

    // ### build navigation
    // build the navigation pane using all reuested menu items and links
    build_navigation: function(){
        var self = this;
        $(".cmap-navigation-content").prepend('<div class="cmap-navigation-menu row"></div>');
        var $el = $(".cmap-navigation-menu");
        this.items.forEach(function(item,i){
			$el.append('<a href="' + self.links[i] + '"class=col-xs-12>' + item + '</a>');
		});
		$el.prepend("<p title='close' class='cmap-header-link class=col-xs-12'>X</p>");
    }
});
