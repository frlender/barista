BubbleView = Backbone.View.extend({
	initialize: function(){
		// set up color options.  default if not specified
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span4";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the vis
		this.render();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.render();} );
	},

	compile_template: function(template_string){
		if (template_string === undefined){
			this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
			template_string = '<div id="' + this.div_string + '" class="' + this.span_class + '" style="height:300px"></div>';
		}
		var compiled_template = Handlebars.compile(template_string);
		this.template_string = template_string;
		this.compiled_template = compiled_template;
		this.$el.append(compiled_template());
	},

	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().duration(1).attr("width",this.width);

		// grab the data from the model
		var data = this.model.get('tree_object').children;

		// set up some data scaling
		var min_count = _.min(_.pluck(data,'count'));
		var max_count = _.max(_.pluck(data,'count'));
		this.data_scale = d3.scale.linear().domain([min_count,max_count])
						.range([5,30]);

		// define the force directed graph layout
		var force = d3.layout.force()
						.nodes(data)
						.size([this.width, this.height])
						.on("tick",tick)
						.charge(function(d){return -Math.pow(self.data_scale(d.count),1.4);})
						.start();

		// draw the initial layout
		this.vis.selectAll("circle").data(force.nodes()).exit().remove();
		this.vis.selectAll("circle").data(force.nodes())
				.enter().append("circle")
				.attr("class",this.div_string + "_circle")
				.attr("fill",this.fg_color)
				.attr("cx", Math.random() * 300)
				.attr("cy", Math.random() * 300)
				.attr("stroke","white")
				.attr("r",function(d){return Math.sqrt(self.data_scale(d.count)/Math.PI);});

		// specify the nodes selection so we don't have to repeat the selection on each tick
		this.nodes = this.vis.selectAll("circle");
		this.nodes.call(force.drag());


		function tick(){
			self.nodes.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;})
				.attr("r",function(d){return self.data_scale(d.count);});

		}
	}
});
// # **CMapFooterView**

// A view that provides the standard Connectivity map page footer for apps built on apps.lincscloud.org
// the view provides standard copyright text and customizable organization name,
// terms and conditions link, and organization logo/link
// basic use:

//		header = new CMapHeaderView({el:"header_target"});

// optional arguments:

// 1.  {string}  **organization**  the name of the organization that claims copyright. Defaults to *Broad Institute*
// 2.  {string}  **terms_url**  The url on which to find terms and conditions. Defaults to *http://lincscloud.org/terms-and-conditions/*
// 3.  {Array}  **logo**  The urls to organization logos to use. Defaults to *['http://coreyflynn.github.io/Bellhop/img/broad_logo_small.png','http://coreyflynn.github.io/Bellhop/img/cmap_logo_small.png']*
// 4.  {Array}  **logo_url**  The urls to organization links to use. Defaults to *['http://www.broadinstitute.org/','http://lincscloud.org/']*
// 5.  {string}  **template**  The path to a handlebars template to use. Defaults to *../templates/CMapFooter.handlebars*

//		header = new CMapFooterView({el:"footer_target", 
//									organization: "Broad Institute",
//									terms_url: "http://lincscloud.org/terms-and-conditions/",
// 									logo: ['../img/broad_logo_small.png','../img/cmap_logo_small.png'],
// 									logo_url: ['http://www.broadinstitute.org/','http://lincscloud.org/'],
//									template: "../templates/CMapFooter.handlebars"});
CMapFooterView = Backbone.View.extend({
	// ### initialize
	// overide the default Backbone.View initialize function to compile a built in template and then render the view
	initialize: function(){
		// store passed parameters as attributes of the view
		this.organization = (this.options.organization !== undefined) ? this.options.organization : "Broad Institute";
		this.terms_url = (this.options.terms_url !== undefined) ? this.options.terms_url : "http://lincscloud.org/terms-and-conditions/";
		this.logo = (this.options.logo !== undefined) ? this.options.logo : ['http://coreyflynn.github.io/Bellhop/img/broad_logo_small.png','http://coreyflynn.github.io/Bellhop/img/cmap_logo_small.png'];
		this.logo_url = (this.options.logo_url !== undefined) ? this.options.logo_url : ['http://www.broadinstitute.org/','http://lincscloud.org/'];
		this.template = (this.options.template !== undefined) ? this.options.template : "../templates/CMapFooter.handlebars";

		// compile the default template for the view
		this.compile_template();

		// render the template
		this.render();
	},

	// ### compile_template
	// use Handlebars to compile the specified template for the view
	compile_template: function(){
		var self = this;
		$.ajax({
			url: this.template,
			dataType: 'html',
			success:function(raw_template){
				self.compiled_template = Handlebars.compile(raw_template);
				// package logos and log_urls into a set of object to iterate over
				var logo_objects = []
				for (var i=0; i < self.logo.length; i++){
					logo_objects.push({logo: self.logo[i], url: self.logo_url[i]});
				}
				self.$el.append(self.compiled_template({organization: self.organization,
												terms_url: self.terms_url,
												logo_objects: logo_objects,
												year: new Date().getFullYear()}));
			}
		});
	}
});
// # **CMapHeaderView**

// A view the provides the standard Connectivity map page header for apps built on apps.lincscloud.org
// the header provides links in the view to navigate back to apps.lincscloud.org as well as links for 
// sharing, settings, and information.  The view accepts as parameters a page title, subtitle, and handlebars template
// basic use:

//		header = new CMapHeaderView({el:"header_target"});

// optional arguments:

// 1.  {string}  **title**  The title of the page. Defaults to *Title*
// 2.  {string}  **subtitle**  The title of the page. Defaults to *Sub Title*
// 3.  {string}  **template**  The path to a handlebars template to use. Defaults to *templates/CMapHeader.handlebars*

//		header = new CMapHeaderView({el:"header_target", 
//									title: "",
//									subtitle: "",
//									template: "templates/CMapHeader.handlebars"});
CMapHeaderView = Backbone.View.extend({
	// ### initialize
	// overide the default Backbone.View initialize function to compile a built in template and then render the view
	initialize: function(){
		// store passed parameters as attributes of the view
		this.title = (this.options.title !== undefined) ? this.options.title : "";
		this.subtitle = (this.options.subtitle !== undefined) ? this.options.subtitle : "";
		this.template = (this.options.template !== undefined) ? this.options.template : "";

		// compile the default template for the view
		this.compile_template();

		// render the template
		this.render();
	},

	// ### compile_template
	// use Handlebars to compile the specified template for the view
	compile_template: function(){
		var self = this;
		$.ajax({
			url: this.template,
			dataType: 'html',
			success:function(raw_template){
				self.compiled_template = Handlebars.compile(raw_template);
				self.$el.append(self.compiled_template({title: self.title,
												subtitle: self.subtitle}));
			}
		});
	}
});


FlatTreeMapView = Backbone.View.extend({

		initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#d9d9d9";
		this.well_color = (this.options.well_color !== undefined) ? this.options.well_color : "#bdbdbd";
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span4";

		// bind render to model changes
		this.listenTo(this.model,'change', this.update_vis);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();
		this.top_svg = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);
		this.vis = this.top_svg.append("g");
		this.vis_overlay = this.top_svg.append("g");

		// render the vis
		this.render();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.render();} );
	},

	compile_template: function(template_string){
		if (template_string === undefined){
			this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
			template_string = '<div id="' + this.div_string + '" class="' + this.span_class + '" style="height:300px"></div>';
		}
		var compiled_template = Handlebars.compile(template_string);
		this.template_string = template_string;
		this.compiled_template = compiled_template;
		this.$el.append(compiled_template());
	},

	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.top_svg.transition().duration(1).attr("width",this.width);

		// define the treemap layout
		this.treemap = d3.layout.treemap()
						.size([this.width,this.height])
						.sticky(false)
						.round(true)
						.sort(function(a,b) { return a.count - b.count; })
						.value(function(d) {return d.count;});

		// grab the data from the model and plot the state of the treemap
		this.data = this.model.get('tree_object');

		// if there are no cildren in the tree_object, dim the view
		if (this.data.children[0] === undefined){
			this.vis.transition().duration(1).attr("opacity",0);
		}else{
			this.vis.transition().duration(500).attr("opacity",1);
		}

		// set up an alpha scaling
		this.min_count = _.min(_.pluck(this.data.children,'count'));
		this.max_count = _.max(_.pluck(this.data.children,'count'));
		this.opacity_map = d3.scale.linear()
							.domain([this.min_count,this.max_count,this.max_count+1])
							.range([0.5,1,0]);

		this.vis.data([this.data]).selectAll("rect").data([]).exit().remove();
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.attr("stroke", "white")
			.attr("stroke-width", 2);
		this.draw_text();

		// add an invisible overlay to catch mouse events
		this.vis_overlay.data([this.data]).selectAll("rect").data([]).exit().remove();
		this.vis_overlay.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",0)
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.attr("count", function(d) {return d.count;})
			.attr("_id", function(d) {return d._id;})
			.on("mousemove", function() { self.fadeIn_popover(d3.mouse(this),d3.select(d3.event.target)); })
			.on("mouseout", function() { self.fadeOut_popover(); });

		// add a div for tooltips
		this.top_svg.selectAll("." + this.div_string + "tooltips").data([]).exit().remove();
		this.popover = this.top_svg.append("foreignObject")
			.attr("class", this.div_string + "tooltips")
			.attr("x", 0)
			.attr("y", 0)
			.attr("opacity",0)
			.attr("width", 600)
			.attr("height", 100)
			.append("xhtml:div")
			.html('<span class="label ' + this.div_string + 'sig_id_label"></span>')
			.append("xhtml:div")
			.html('<span class="label label-inverse  ' + this.div_string + 'pert_desc_label"></span>');

		// add a png export overlay
		this.top_svg.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.top_svg.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export")
			.attr("x",10)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1);})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25);})
			.on("click",function(){self.savePng();});
	},

	update_vis: function(){
		var self = this;
		// grab the data from the model and plot the state of the treemap
		this.data = this.model.get('tree_object');

		// if there are no cildren in the tree_object, dim the view
		if (this.data.children[0] === undefined){
			this.vis.transition().duration(1).attr("opacity",0);
		}else{
			this.vis.transition().duration(500).attr("opacity",1);
		}

		// set up an alpha scaling
		this.min_count = _.min(_.pluck(this.data.children,'count'));
		this.max_count = _.max(_.pluck(this.data.children,'count'));
		this.opacity_map = d3.scale.linear().domain([this.min_count,this.max_count,this.max_count+1])
						.range([0.5,1,0]);

		//add new data if it is there
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.attr("stroke", "white")
			.attr("stroke-width", 2);

		//add new data if it is there
		this.vis_overlay.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",0)
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("count", function(d) {return d.count;})
			.attr("_id", function(d) {return d._id;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.on("mousemove", function() { self.fadeIn_popover(d3.mouse(this),d3.select(d3.event.target)); })
			.on("mouseout", function() { self.fadeOut_popover(); });

		// transition elements
		this.vis.data([this.data]).selectAll("rect")
			.transition().ease("cubic out").duration(500)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;});

		this.vis_overlay.data([this.data]).selectAll("rect")
			.transition().ease("cubic out").duration(500)
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;});

		// exit old elements
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes).exit().remove();
		this.vis_overlay.data([this.data]).selectAll("rect").data(this.treemap.nodes).exit().remove();

		// draw_text on the elements that have room for it
		this.clear_text();
		setTimeout(function(){ self.draw_text(); },500);
	},

	fadeIn_popover: function(point,rect){
		if (point[0] > this.width/2){
			d3.select("." + this.div_string + "tooltips").attr("x", point[0] - 60);
		}else{
			d3.select("." + this.div_string + "tooltips").attr("x", point[0]);
		}

		if (point[1] > this.height/2){
			d3.select("." + this.div_string + "tooltips").attr("y", point[1] - 50);
		}else{
			d3.select("." + this.div_string + "tooltips").attr("y", point[1] + 20);
		}

		d3.select("." + this.div_string + "sig_id_label").text(rect.attr("_id"));
		d3.select("." + this.div_string + "pert_desc_label").text(rect.attr("count"));
		d3.select("." + this.div_string + "tooltips").attr("opacity",1);
	},

	fadeOut_popover: function(){
		d3.select("." + this.div_string + "tooltips").attr("opacity",0);
	},

	clear_text: function(){
		this.vis.data([this.data]).selectAll("text.name").data([]).exit().remove();
		this.vis.data([this.data]).selectAll("text.count").data([]).exit().remove();
	},

	draw_text: function(){
		this.vis.data([this.data]).selectAll("text.name").data([]).exit().remove();
		this.vis.data([this.data]).selectAll("text.name").data(this.treemap.nodes)
			.enter().append("text")
			.attr("class","name")
			.text(function(d) {
				if (d.dy < 20 || d.dx < 80){
					return null;
				}else{
					return d.children ? null : d._id;
				}
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d) {return d.x + d.dx/2;})
			.attr("y", function(d) {return d.y + d.dy/2;})
			.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
			.attr("font-weight","normal")
			.attr("font-size","12pt")
			.attr("fill","white")
			.attr("opacity",0)
			.transition().duration(500).attr("opacity",1);

		this.vis.data([this.data]).selectAll("text.count").data([]).exit().remove();
		this.vis.data([this.data]).selectAll("text.count").data(this.treemap.nodes)
			.enter().append("text")
			.attr("class","name")
			.text(function(d) {
				if (d.dy < 40 || d.dx < 80){
					return null;
				}else{
					return d.children ? null : d.count;
				}
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d) {return d.x + d.dx/2;})
			.attr("y", function(d) {return d.y + d.dy/2 + 20;})
			.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
			.attr("font-weight","normal")
			.attr("font-size","12pt")
			.attr("fill","black")
			.attr("opacity",0)
			.transition().duration(500).attr("opacity",1);
	},

	savePng: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.top_svg.attr("width");
		var height = this.top_svg.attr("height");
		var html_snippet = '<canvas id="tmpCanvas" width="' + width + 'px" height="' + height + 'px"></canvas>';
		$('body').append(html_snippet);

		// dim the png label on the image
		var png_selection = this.top_svg.selectAll("." + this.div_string + "png_export").data([1]);
		var png_opacity = png_selection.attr("opacity");
		png_selection.attr("opacity",0);

		// grab the content of the target svg and place it in the canvas element
		var svg_snippet = this.top_svg.node().parentNode.innerHTML;
		canvg(document.getElementById('tmpCanvas'), '<svg>' + svg_snippet + '</svg>', { ignoreMouse: true, ignoreAnimation: true });

		// save the contents of the canvas to file and remove the canvas element
		var canvas = $("#tmpCanvas")[0];
		var filename = "cmapTreeMap" + new Date().getTime() + ".png";
		if (canvas.toBlob){canvas.toBlob(function(blob){saveAs(blob,filename);})};
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
	}
});
GridView = Backbone.View.extend({
	initialize: function(){
		var self = this;
		// default search value
		this.search_val = "";
		this.search_type = "single";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span12";

		// set up the template to use
		this.template = (this.options.template !== undefined) ? this.options.template : "../templates/CMapBaseGrid.handlebars";

		// set up a default collection and column definition for the grid to operate on
		this.collection = (this.options.collection !== undefined) ? this.options.collection : new PertCollection();
		this.columns = (this.options.columns !== undefined) ? this.options.columns : [{name: "pert_iname", label: "Reagent Name", cell: "string", editable: false},
																						{name: "pert_type_label", label: "Pert Type", cell: HTMLCell, editable: false},
																						{name: "num_inst", label: "Experiments", cell: "integer", editable: false}];

		// build the template
		this.compile_template();

		// build the grid on the template using a clickable row.  If a row is clicked, a grid:RowClick event
		// is fired with the row's model as the passed data.
		// build the clickable row
		var ClickableRow = Backgrid.Row.extend({
			events: {
				"click": "onClick"
			},
			onClick: function () {
				Backbone.trigger("grid:RowClick", this.model);
				$(".cmap-active-grid-row").removeClass("cmap-active-grid-row");
				this.$el.addClass("cmap-active-grid-row");
			}
		});

		// build the grid
		this.grid = new Backgrid.Grid({
			row: ClickableRow,
			columns: this.columns,
			collection: this.collection
		});
		$("#" + this.div_string).append(this.grid.render().$el);

		//bind the table to a function to check for scroll boundaries
		$("#" + this.div_string,this.el).scroll(function(){self.checkscroll()});

		// bind the download text to a function to download the data in the table
		$("#" + this.div_string + "_download",this.el).click(function(){self.download_table()});
	},

	checkscroll: function(){
		var triggerPoint = 100;
		var pos = $("#" + this.div_string).scrollTop() + $("#" + this.div_string).height() + triggerPoint;
		if (!this.collection.isLoading && pos > $("#" + this.div_string)[0].scrollHeight){
			this.collection.skip += 30;
			this.update_collection();
		}
	},

	replace_collection: function(search_val,search_type){
		var self = this;
		this.search_val = (search_val !== undefined) ? search_val : this.search_val;
		this.search_type = (search_type !== undefined) ? search_type : this.search_type;
		$("#" + this.div_string).show();
		$("#" + this.div_string).animate({opacity:1},500);
		this.collection.reset();
		this.collection.skip = 0;
		this.collection.getData(this.search_val,this.search_type);
		this.resize_div();
		this.listenToOnce(this.collection,"add", function(){
			this.trigger("grid:ReplaceCollection");
		});
	},

	update_collection: function(search_val,search_type){
		var self = this;
		this.search_val = (search_val !== undefined) ? search_val : this.search_val;
		this.search_type = (search_type !== undefined) ? search_type : this.search_type;
		$("#" + this.div_string).show();
		$("#" + this.div_string).animate({opacity:1},500);
		this.collection.getData(this.search_val,this.search_type);
		this.resize_div();
	},

	clear_collection: function(){
		var self = this;
		this.collection.skip = 0;
		$("#" + this.div_string).animate({opacity:0},500);
		window.setTimeout(function(){self.collection.reset(); $("#" + this.div_string).hide();},500);
	},

	resize_div: function(){
		var self = this;
		var height = self.collection.length * 30 + 40;
		if (height < 300){
			setTimeout(function(){
				var height = self.collection.length * 30 + 40;
				var height = (height > 300) ? 300 : height;
				
				$("#" + self.div_string).stop();
				$("#" + self.div_string).animate({height:height},500);
			},500);
		}
	},

	compile_template: function(){
		this.div_string = 'backgrid_target' + Math.round(Math.random()*1000000);
		this.raw_template = $.ajax({url:this.template, dataType: 'html', async: false}).responseText;
		this.compiled_template = Handlebars.compile(this.raw_template);
		this.$el.append(this.compiled_template({div_string: this.div_string, span_class: this.span_class}));
	},

	download_table: function(){
		var self = this;
		// indicate we are downloading something
		$("#" + this.div_string + "_download",this.el).html('<font color="#0072B2"><i class="icon-refresh icon-spin"></i> exporting</font>')
		
		// set up api call parameters
		var url = this.collection.url;
		var params = {q: this.collection.q_param,
            l:0,
            s:this.collection.s_param};

        // grab column header names
        var headers = _.pluck(this.columns,'label').join('\t');

        // grab column data names
        var names = _.pluck(this.columns,'name');

        // make a JSON API call to grab data for the table
		$.getJSON(url,params,function(res){
			var lines = [headers];
			res.forEach(function(r){
				var line_data = [];
				// for each data name in the table, grab the data. translate html
				// content to plain text where required
				names.forEach(function(n){
					if (n == "pert_type_label"){
						line_data.push(CMapPertTypeAlias(r["pert_type"]).acronym);
					}else{
						line_data.push(r[n]);
					}
				});
				line_string = line_data.join('\t');
				lines.push(line_string);
			});
			var lines_string = lines.join("\n");
			var blob = new Blob([lines_string], {type: "text/plain;charset=utf-8"});
			var timestamp = new Date().getTime();
			saveAs(blob, "CMapSummaryTable" + timestamp + ".txt");
			$("#" + self.div_string + "_download",self.el).html('<font color="#0072B2"><i class="icon-share"></i> export table</font>');
		});
	},

	// ### show
	// shows the view by brightening the opacity and showing it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the hide animation. defualts to *500*

	//		pert_detail_view.hide(duration);
	hide: function(duration){
		var self = this;
		this.$el.animate({opacity:0},duration);
		setTimeout(function(){self.$el.hide()},duration);
	},

	// ### show
	// shows the view by brightening the opacity and showing it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the show animation. defualts to *500*

	//		pert_detail_view.show(duration);
	show: function(duration){
		this.$el.show();
		this.$el.animate({opacity:1},duration);
	}
});
// # **HTMLCellView**

// a Backgrid extension that supports display of html content in Backgrid tables.  HTMLCellView defines
// both a Backgrid.Cell subclass (**HTMLCell**) and Backgrid.CellFormatter subclass (**HTMLFormatter**) to
// use with it.  These two components are used together to integrate with Backgrid's existing cell definitions

// in order to use **HTMLCell** and **HTMLFormatter**, specify the cell parameter of a Backgrid column definition
// as **HTMLCell**.  As an example:

//     // set up a default collection and column definition for the grid to operate on
//     this.collection = new PertCollection();
//     this.columns = [{name: "pert_type_label", label: "Pert Type", cell: HTMLCell, editable: false}];
// 
//     // build the template
//     this.compile_template();
// 
//     // build the grid on the template
//     this.grid = new Backgrid.Grid({
//       columns: this.columns,
//       collection: this.collection
//     });


// ## HTMLFormatter
// A formatter that extends Backgrid.CellFormatter to return exactly the raw input value as opposed
// to the string version of the rawinput 
HTMLFormatter = Backgrid.HTMLFormatter = function () {};
HTMLFormatter.prototype = new Backgrid.CellFormatter();
_.extend(HTMLFormatter.prototype, {
  fromRaw: function (rawValue) {
    if (_.isUndefined(rawValue) || _.isNull(rawValue)) return '';
    return rawValue;
  }
});

// ## HTMLCell
// An extension of Backgrid.Cell to render raw html content into the target element of the cell
HTMLCell = Backgrid.HTMLCell = Backgrid.Cell.extend({
  className: "html-cell",
  formatter: new HTMLFormatter(),
  render: function () {
    this.$el.html(this.formatter.fromRaw(this.model.get(this.column.get("name"))));
    return this;
  }
});
// # **PertCountView**

// A Backbone.View that shows that number of perturbagens matching a given query.  Optionally, sub-category
// counts are give for the type of perturbagen queried for.  This view is frequently paired with a 
// **PertCountModel** or **CellCountModel**

// basic use:

//		pert_count_view = new PertCountView();

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **well\_color**  the hex color code to use as the backgound of the wells, defaults to *#bdbdbd*
// 3.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 4.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span4"*
// 5.  {string}  **static\_text**  the static text header to use in the view, defaults to *"Reagents"*
// 6.  {array}  **categories**  an array of objects to use as categories to display, defaults to *[]*

//		pert_count_view = new PertCountView({bg_color:"#ffffff", 
//									well_color: "#bdbdbd",
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									static_text: "Reagents",
//									categories: []});


PertCountView = Backbone.View.extend({
	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.well_color = (this.options.well_color !== undefined) ? this.options.well_color : "#bdbdbd";
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span4";

		// set up static text, default if not specified
		this.static_text = (this.options.static_text !== undefined) ? this.options.static_text : "Reagents";

		// set up default categories to display
		this.categories = (this.options.categories !== undefined) ? this.options.categories : [];
		this.category_ids = _.pluck(this.categories,'_id');

		// get categories from model and determine the maximum category count
		// this.categories = this.model.get('pert_types');
		this.max_category_count = _.max(_.pluck(this.categories,'count'));

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the vis
		this.redraw();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.redraw();} );
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(template_string){
		if (template_string === undefined){
			this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
			template_string = '<div id="' + this.div_string + '" class="' + this.span_class + '" style="height:180px"></div>';
		}
		var compiled_template = Handlebars.compile(template_string);
		this.template_string = template_string;
		this.compiled_template = compiled_template;
		this.$el.append(compiled_template());
	},
	redraw: function(){
		this.init_panel();
		this.render();
	},

	init_panel: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().duration(1).attr("width",this.width);

		// draw the background of the panel
		this.vis.selectAll('.bg_panel').data([]).exit().remove();
		this.vis.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// draw the static Text
		this.vis.selectAll('.static_text').data([]).exit().remove();
		this.vis.selectAll('.static_text').data([1])
							.enter().append("text")
							.attr("class","static_text")
							.attr("x",10)
							.attr("y",14)
							.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
							.attr("font-weight","bold")
							.attr("font-size","13pt")
							.attr("fill",this.fg_color)
							.text(this.static_text.toUpperCase());
		// draw the pert count info
		var pert_count = this.model.get('pert_count');
		if (pert_count === undefined){
			pert_count = 0;
		}
		var pert_count_text = this.vis.selectAll('.pert_count').data([]).exit().remove();
		pert_count_text = this.vis.selectAll('.pert_count').data([1])
							.enter().append("text")
							.attr("class","pert_count")
							.attr("x",10)
							.attr("y",55)
							.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
							.attr("font-weight","bold")
							.attr("font-size","36pt")
							.text(pert_count)

		// for each sub-category, draw a bar graph
		this.category_rect_selection = this.vis.selectAll('.category_rect_well');
		this.category_rect_selection.data([]).exit().remove();
		this.category_rect_selection.data(this.categories).enter().append('rect')
			.attr("class","category_rect_well")
			.attr("x",10)
			.attr("y",function(d,i){return i*35 + 80;})
			.attr("height",10)
			.attr("width",function(d){return (self.width - 20);})
			.attr("fill",this.well_color);

		// for each sub-category, draw a bar graph
		this.category_rect_selection = this.vis.selectAll('.category_rect');
		this.category_rect_selection.data([]).exit().remove();
		this.category_rect_selection.data(this.categories).enter().append('rect')
			.attr("class","category_rect")
			.attr("x",10)
			.attr("y",function(d,i){return i*35 + 80;})
			.attr("height",10)
			.attr("width",function(d){return (self.width - 20) * (d.count / self.max_category_count);})
			.attr("fill",this.fg_color);

		// for each sub-category, add a name
		this.vis.selectAll('.category_name').data([]).exit().remove();
		this.vis.selectAll('.category_name').data(this.categories).enter().append("text")
			.attr("class","category_name")
			.attr("x",10)
			.attr("y",function(d,i){return i*35 + 105;})
			.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
			.attr("font-weight","normal")
			.attr("font-size","12pt")
			.text(function(d){return d._id;});

		// for each sub-category, add a value
		this.vis.selectAll('.category_value').data([]).exit().remove();
		this.vis.selectAll('.category_value').data(this.categories).enter().append("text")
			.attr("class","category_value")
			.attr("x",this.width - 10)
			.attr("y",function(d,i){return i*35 + 105;})
			.attr("font-family","'Helvetica Neue',Helvetica,Arial,sans-serif")
			.attr("font-weight","normal")
			.attr("font-size","12pt")
			.attr("text-anchor","end")
			.text("xhtml:div")
			.text(function(d){return d.count.toFixed(0);});
	},

	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// draw the pert count info
		var pert_count = this.model.get('pert_count');
		if (pert_count === undefined){
			pert_count = 0;
		}
		this.vis.selectAll('.pert_count').data([1])
			.transition().duration(500)
			.tween("text", function() {
			    var i = d3.interpolate(this.textContent, pert_count);
			    return function(t) {
			      this.textContent = Math.round(i(t));
			    };
			});

		// transition the updated bars
		pert_count = this.model.get('pert_count');
		this.pert_types = this.model.get("pert_types");
		this.pert_types = _.filter(this.pert_types,function(o){return self.category_ids.indexOf(o._id) != -1;});
		this.categories.forEach(function(e,i,l){
			var ids = _.pluck(self.pert_types,'_id');
			var index = ids.indexOf(e._id);
			if (index != -1){
				self.categories[i].count = self.pert_types[index].count;
			}else{
				self.categories[i].count = 0.00001;
			}
		});
		this.max_category_count = _.max(_.pluck(this.categories,'count'));
		this.max_category_count = (this.max_category_count < 1) ? 1 : this.max_category_count;
		var category_update_selection = this.vis.selectAll('.category_rect').data(this.categories);
		category_update_selection.transition().duration(500)
			.attr("width",function(d){return (self.width - 20) * (d.count / self.max_category_count);});

		// transition the updated category labels
		this.vis.selectAll('.category_value').data(this.categories)
			.transition().duration(500)
			.tween("text", function(d,i) {
				var count = d.count.toFixed(0);
			    var i = d3.interpolate(this.textContent, count);
			    return function(t) {
			      this.textContent = Math.round(i(t));
			    };
			});
		


	}
});
// # **PertDetailView**

// A Backbone.View that shows the name and short description of a single purturbagen.  This view is
// frequently paired with a PertDetailModel.

//		pert_detail_view = new PertDetailView();

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

//		pert_detail_view = new PertDetailView({el: $("target_selector"),
// 												model: PertDetailModel,
// 												bg_color: "#ffffff",
// 												span_class: "span4"});
PertDetailView = Backbone.View.extend({
	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	
	//		pert_detail_view.initialize();
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the vis
		this.redraw();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.redraw();} );
	},

	// ### compile_template
	// use Handlebars to compile the template for the view

	// arguments:

	// 1.  {string}  **template\_string**  an html string specifying the template to compile and render. defaults to `'<div id="' + this.div_string + '" class="' + this.span_class + '" style="height:180px"></div>'`

	//		pert_detail_view.compile_template(template\_string);
	compile_template: function(template_string){
		if (template_string === undefined){
			this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
			template_string = '<div id="' + this.div_string + '" class="' + this.span_class + '" style="height:120px"></div>';
		}
		var compiled_template = Handlebars.compile(template_string);
		this.template_string = template_string;
		this.compiled_template = compiled_template;
		this.$el.append(compiled_template());
	},

	// ### redraw
	// perform a full redraw of the view, including wiping out all d3 drawn components in the view and 
	// initializing them again from scratch.
	
	//		pert_detail_view.redraw();
	redraw: function(){
		this.init_view();
		this.render();
	},

	// ### init_view
	// set up the view from scratch.  Draw a background panel and place all dynamic content on that panel
	// with defualt values

	//		pert_detail_view.init_view();
	init_view: function(){
		// stuff "this" into a variable for use inside of scoped funcitons
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.attr("width",this.width);

		// draw the background of the panel
		this.vis.selectAll('.bg_panel').data([]).exit().remove();
		this.vis.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// draw the static index reagent icon
		this.vis.selectAll('.index_text_icon').data([]).exit().remove();
		this.vis.selectAll('.index_text_icon').data([1])
							.enter().append("foreignObject")
							.attr("class","index_text_icon")
							.attr("x",10)
							.attr("y",0)
							.attr("height",20)
							.attr("width",20)
							.append("xhtml:div")
							.attr("id",this.div_id + "_index_text")
							.style("background-color",this.bg_color)
							.html('<p class="cmap-subhead-text"><font color="#56B4E9"><i class="icon-map-marker"></i></font><p>');

		// draw the static index reagent text
		this.vis.selectAll('.index_text').data([]).exit().remove();
		this.vis.selectAll('.index_text').data([1])
							.enter().append("text")
							.attr("class","index_text")
							.attr("x",25)
							.attr("y",17)
							.attr("fill","#56B4E9")
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.text('INDEX REAGENT');

		// add a png export overlay
		this.vis.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.vis.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export no_png_export")
			.attr("x",10)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
			.on("click",function(){self.save_png();});

	},

	// ### render
	// render the dynamic content of the view based on the current state of the view's data model

	//		pert_detail_view.render();
	render: function(){
		var self = this;
		// (re)draw a link to the gene's wikipedia article if it is a gene.
		this.vis.selectAll('.' + this.div_string + 'gene_wiki_link').data([]).exit().remove();
		this.vis.selectAll('.gene_wiki_text').data([]).exit().remove();
		
		// check for a link definition for wikipedia.  If there is one, draw a card that
		// displays a link out to the article and the extract of the article.  If there
		// is no link provided, just display the short and long name version of the card
		if (this.model.get('gene_wiki_link') !== ""){

			// set up wikipedia API query parameters
			var params = {action: "query",
							titles: this.model.get("short_description") + "_(gene)",
							prop: "extracts",
							format: "json",
							exchars: 200,
							exlimit: 1,
							exintro: true,
							exsectionformat: "wiki",
							redirects: true,
							explaintext: true};

			// make a query into the wikipedia API to get the article extract.  Once the
			// extract has come back, draw the short description, long description , 
			// the wiki link, and article stub
			$.getJSON('http://en.wikipedia.org/w/api.php?callback=?',params,function(res) {
				
				// (re)draw the short name of the perturbagen
				self.vis.selectAll('.short_description_text').data([]).exit().remove();
				self.vis.selectAll('.short_description_text').data([1])
									.enter().append("text")
									.attr("class","short_description_text")
									.attr("x",10)
									.attr("y",60)
									.attr("font-family","Helvetica Neue")
									.attr("font-weight","bold")
									.attr("font-size","36pt")
									.text(self.model.get('short_description'));

				// (re)draw the long name of the perturbagen
				self.vis.selectAll('.long_description_text').data([]).exit().remove();
				self.vis.selectAll('.long_description_text').data([1])
									.enter()
									.append("text")
									.attr("class","long_description_text")
									.attr("x",10)
									.attr("y",85)
									.attr("font-family","Helvetica Neue")
									.attr("font-size","14pt")
									.text(self.model.get('long_description'));

				// draw the wiki link
				self.vis.selectAll('.' + self.div_string + 'gene_wiki_link').data([1])
									.enter()
									.append("text")
									.attr("class",self.div_string + 'gene_wiki_link no_png_export')
									.attr("x",40)
									.attr("y",self.height - 10)
									.attr("opacity",0.25)
									.style("cursor","pointer")
									.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
									.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
									.on("click", function(){window.location.href = self.model.get("gene_wiki_link")})
									.text('wiki');
			
				// drill into the wikipedia API response and grab the article extract.
				// break it into 50 character lines to display and draw each of those lines.
				// If line breaks fall in the middle of a word, place a dash at the end of
				// the line.  If the extract does not fit on four lines (200 characters),
				// add an ellipsis to the end of the line.
				for (var p in res.query.pages){
					if (res.query.pages.propertyIsEnumerable(p)){
						var extract = res.query.pages[p].extract;
						if (extract !== undefined){
							// compute the line splits to display in the wiki summary
							var lines = ["","","",""];
							lines[0] = (extract.slice(0,50).slice(-1) != " ") ? extract.slice(0,50) + '-': extract.slice(0,50);
							lines[1] = (extract.slice(50,100).slice(-1) != " " && extract.slice(50,100).slice(49,50) != "") ? extract.slice(50,100)  + '-': extract.slice(50,100);
							lines[2] = (extract.slice(100,150).slice(-1) != " " && extract.slice(100,150).slice(49,50) != "") ? extract.slice(100,150)  + '-': extract.slice(100,150);
							lines[3] = (extract.slice(100,150) != "") ? extract.slice(150,200) + ' ...' : "";

							// draw line 1
							self.vis.selectAll('.' + self.div_string + 'gene_wiki_text1').data([1])
									.enter()
									.append("text")
									.attr("class",self.div_string + 'gene_wiki_text1 gene_wiki_text')
									.attr("x",self.width - 425)
									.attr("y",12)
									.attr("font-family","Helvetica Neue")
									.attr("font-size","13pt")
									.attr("fill","#777777")
									.text(lines[0]);

							// draw line 2
							self.vis.selectAll('.' + self.div_string + 'gene_wiki_text2 ').data([1])
									.enter()
									.append("text")
									.attr("class",self.div_string + 'gene_wiki_text2 gene_wiki_text')
									.attr("x",self.width - 425)
									.attr("y",29)
									.attr("font-family","Helvetica Neue")
									.attr("font-size","13pt")
									.attr("fill","#777777")
									.text(lines[1]);

							// draw line 3
							self.vis.selectAll('.' + self.div_string + 'gene_wiki_text3').data([1])
									.enter()
									.append("text")
									.attr("class",self.div_string + 'gene_wiki_text3 gene_wiki_text')
									.attr("x",self.width - 425)
									.attr("y",46)
									.attr("font-family","Helvetica Neue")
									.attr("font-size","13pt")
									.attr("fill","#777777")
									.text(lines[2]);

							// draw line 4
							self.vis.selectAll('.' + self.div_string + 'gene_wiki_text4').data([1])
									.enter()
									.append("text")
									.attr("class",self.div_string + 'gene_wiki_text4 gene_wiki_text')
									.attr("x",self.width - 425)
									.attr("y",64)
									.attr("font-family","Helvetica Neue")
									.attr("font-size","13pt")
									.attr("fill","#777777")
									.text(lines[3]);
						}
					}
				}
			});

		}else{
			// (re)draw the short name of the perturbagen
			this.vis.selectAll('.short_description_text').data([]).exit().remove();
			this.vis.selectAll('.short_description_text').data([1])
								.enter().append("text")
								.attr("class","short_description_text")
								.attr("x",10)
								.attr("y",60)
								.attr("font-family","Helvetica Neue")
								.attr("font-weight","bold")
								.attr("font-size","36pt")
								.text(this.model.get('short_description'));

			// (re)draw the long name of the perturbagen
			this.vis.selectAll('.long_description_text').data([]).exit().remove();
			this.vis.selectAll('.long_description_text').data([1])
								.enter()
								.append("text")
								.attr("class","long_description_text")
								.attr("x",10)
								.attr("y",85)
								.attr("font-family","Helvetica Neue")
								.attr("font-size","14pt")
								.text(this.model.get('long_description'));
		}
	},

	// ### hide
	// hides the view by dimming the opacity and hiding it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the hide animation. defualts to *1*

	//		pert_detail_view.hide(duration);
	hide: function(duration){
		duration = (duration !== undefined) ? duration : 1;
		var self = this;
		this.$el.animate({opacity:0},duration);
		setTimeout(function(){self.$el.hide()},duration);
	},

	// ### show
	// shows the view by brightening the opacity and showing it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the show animation. defualts to *1*

	//		pert_detail_view.show(duration);
	show: function(duration){
		duration = (duration !== undefined) ? duration : 1;
		this.$el.show();
		this.$el.animate({opacity:1},duration);
	},

	// ### savePng
	// save the current state of the view into a png image

	//		pert_detail_view.save_png();
	save_png: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.vis.attr("width");
		var height = this.vis.attr("height");
		var html_snippet = '<canvas id="tmpCanvas" width="' + width + 'px" height="' + height + 'px"></canvas>';
		$('body').append(html_snippet);

		// dim the png label on the image
		var png_selection = this.vis.selectAll(".no_png_export");
		var png_opacity = png_selection.attr("opacity");
		png_selection.attr("opacity",0);

		// grab the content of the target svg and place it in the canvas element
		var svg_snippet = this.vis.node().parentNode.innerHTML;
		canvg(document.getElementById('tmpCanvas'), '<svg>' + svg_snippet + '</svg>', { ignoreMouse: true, ignoreAnimation: true });

		// save the contents of the canvas to file and remove the canvas element
		var canvas = $("#tmpCanvas")[0];
		var filename = "cmapPertDetailView" + new Date().getTime() + ".png";
		if (canvas.toBlob){canvas.toBlob(function(blob){saveAs(blob,filename);})};
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
	}

});
/**
A Backbone.View that exposes a custom search bar.  The search bar provides autocomplete
functionality for Connectivity Map pert\_inames and cell\_ids.  When the user types in the
search view's input, a "search:DidType" event is fired.

@class PertSearchBar
@constructor
@extends Backbone.View
**/
PertSearchBar = Backbone.View.extend({
	initialize: function(){
		var self = this;

		/**
		determines wether or not the search view will match cell lines for autocomplete

		@property match_cell_lines
		@default true
		@type Boolean
		**/
		// determine wether or not we will match cell line strings in the autocomplete
		this.match_cell_lines = (this.options.match_cell_lines !== undefined) ? this.options.match_cell_lines : true;

		// grab cell_ids and store them as an atribute of the view
		var cellinfo = 'http://api.lincscloud.org/a2/cellinfo?callback=?';
		var params = {q:'{"cell_id":{"$regex":""}}',d:"cell_id"};
		$.getJSON(cellinfo,params,function(res){
			self.cell_lines = res;
			self.render();

			// once the view is rendered, bind a change event to trigger a "search:DidType" event from the view
			$("#search",self.el).bind('input propertychange change', function () {
				var val  = $("#search",self.el).val();
				var type = "";
				if (self.cell_lines.indexOf(val) != -1 && self.match_cell_lines){
					type = "cell";
				}

				/**
				Fired when the text in the view's search box changes

				@event search:DidType
				@param {Object} [msg={val:"",type:""}] an object containing the message of the event
				@param {String} [msg.val=""] the string val of the views search bar at the time of the event
				@param {String} [msg.type=""] the type of message being passed, either "" or "cell". "cell" is passed, if the string matches a cell line and match\_cell\_lines is set
				**/
				self.trigger("search:DidType",{val: val,type: type});
			});
		});

	},


	/**
    Gets the current text entered in the view's search bar
    
    @method get_val
    **/
	get_val: function(){
		return $("#search",this.el).val();
	},

	/**
    fills the view's search bar with a random pert_iname and triggers a "search:DidType" event
    
    @method random_val
    **/
	random_val: function(){
		var self = this;
		skip = Math.round(Math.random()*40000);
		var pertinfo = 'http://api.lincscloud.org/a2/pertinfo?callback=?';
		params = {f:'{"pert_iname":1}',
										l:1,
										sk:skip};
		$.getJSON(pertinfo,params,function(res){
			var val = res[0].pert_iname;
			$("#search",this.el).val(val);
			self.trigger("search:DidType",{val: val,type: 'single'});
		});
	},

	set_val: function(new_val){
		$("#search",this.el).val(new_val);
		this.trigger("search:DidType",{val: new_val,type: 'single'});
	},

	/**
     the html template to be used as the views code
     
     @property template
     @default '<div class="input-append span10"><input class="span12" autocomplete="off" type="text" placeholder="search gene, compound, or cell type name; separate compound searches with :" data-provide="typeahead" id="search"><span class="add-on">Search 1,209,824 profiles</span></div>'
     @type String
     **/
	template: function(template_string){
		if (template_string === undefined){
			template_string = '<div class="input-append span10"><input class="span12" autocomplete="off" type="text" placeholder="search gene, compound, or cell type name; separate compound searches with :" data-provide="typeahead" id="search"><span class="add-on">Search 1,209,824 profiles</span></div>';
		}
		var compiled_template = Handlebars.compile(template_string);
		return compiled_template;
	},

	/**
    renders the view
    
    @method render
    **/
	render: function(){
		var self = this;
		// load the template into the view's el tag
		this.$el.html(this.template());

		// configure the typeahead to autocomplete off of RESTful calls to pertinfo
		var auto_data = [];
		var pertinfo = 'http://api.lincscloud.org/a2/pertinfo?callback=?';
		
		// instatiate an object to serve as a pert_iname to pert_type hash
		var object_map = {};

		$('#search',this.$el).typeahead({
			// only return 4 items at a time in the autocomplete dropdown
			items: 4,

			// custom source argument to pull results from pert_info
			source: function(query,process){
			var val = $("#search",this.$el).val();
			return $.getJSON(pertinfo,{q:'{"pert_iname":{"$regex":"' + val + '", "$options":"i"}}',
										f:'{"pert_iname":1,"pert_type":1}',
										l:100,
										s:'{"pert_iname":1}'},
										function(response){
											// for each item, pull out its pert_iname and use that for the
											// autocomplete value. Map its type to the pert_iname for use 
											// in the highlighter function below
											response.forEach(function(element){
												auto_data.push(element.pert_iname);
												object_map[element.pert_iname] = element;
											});

											// make sure we only show unique items
											auto_data = _.uniq(auto_data);

											// add cell lines if required
											if (self.match_cell_lines){
												auto_data = auto_data.concat(self.cell_lines);	
											}

											// return the processed list of data for the autocomplete
											return process(auto_data);
										});
			},

			// custom highlighter argument to display matched types.  
			// Display type aliases for known pert_types.
			highlighter: function(item){
				var genetic_types = ["trt_sh","trt_oe","trt_sh.cgs"]
				if (self.cell_lines.indexOf(item) != -1){
					return '<div><span class="label" style="background-color: #CC79A7">Cellular Context</span>  ' + item  +  '</div>';
				}
				if (genetic_types.indexOf(object_map[item].pert_type) != -1){
					return '<div><span class="label" style="background-color: #0072B2">Genetic Reagent</span>  ' + item  +  '</div>';
				}
				if (object_map[item].pert_type === 'trt_cp' ){
					return '<div><span class="label" style="background-color: #E69F00">Chemical Reagent</span>  ' + item  +  '</div>';
				}
				if (object_map[item].pert_type === 'trt_sh.css' ){
					return '<div><span class="label" style="background-color: #009E73">Seed Sequence</span>  ' + item  +  '</div>';
				}else{
					return '<div><span class="label">' + object_map[item].pert_type + '</span>  ' + item  +  '</div>';
				}
			}

		});
	}
});
// # **TickView**

// A Backbone.View that displays a Connectivity Map tick view.  The view is must be paired with a CMapTickModel that
// describes the rows to display in the tick view and the scores of the ticks to show for each row.  An 
// example input data object from a CMapTickModel might looks like this:

//			{PC3: [.23,-.28], MCF7: [-0.6]}

// The view will render a row for each key in the data object and a tick for each entry in the array values
// for each row.  The view also renders a title based on the model's title attribute

// optional arguments:

// 1.  {string}  **template**  The path to a handlebars template to use. Defaults to *../templates/CMapFooter.handlebars*
// 2.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#bdbdbd*
// 3.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

// example usage:

//		tick_view = new TickView({el: $("target_selector"),
//												model: new CMapTickModel({data:{PC3: [.23,-.28], MCF7: [-0.6]}, title: "example data"}),
//												template: "../templates/d3_target.handlebars",
//												bg_color: "#bdbdbd",
//												span_class: "span12"
//												});

TickView = Backbone.View.extend({
	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#eeeeee";
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "#span12";
		this.template = (this.options.template !== undefined) ? this.options.template : "../templates/d3_target.handlebars";

		// bind render to model changes
		this.listenTo(this.model,'change', this.redraw);

		// compile the default template for the view and draw it for the first time
		this.compile_template_and_draw();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.redraw();} );
	},

	// ### compile_template_and_draw
	// use Handlebars to compile the template for the view and draw it for the first time

	//		tick_view.compile_template_and_draw();
	compile_template_and_draw: function(){
		var self = this;
		this.isCompiling = true;
		$.ajax({
			url: self.template,
			datatype: "html",
			success: function(raw_template){
				// build the template with a random div id
				self.div_string = 'd3_target' + Math.round(Math.random()*1000000);
				self.compiled_template = Handlebars.compile(raw_template);
				self.$el.append(self.compiled_template({div_string: self.div_string, span_class: self.span_class}));

				// define the location where d3 will build its plot
				self.vis = d3.select("#" + self.div_string).append("svg")
								.attr("width",self.width)
								.attr("height",self.height);

				self.isCompiling = false;
				// draw the plot for the first time
				self.redraw();
			}
		});
	},

	// ### redraw
	// perform a full redraw of the view, including wiping out all d3 drawn components in the view and 
	// initializing them again from scratch.

	//		tick_view.redraw();
	redraw: function(){
		var self = this;
		// set up the panel's width and height via animation
		this.width = $("#" + this.div_string).outerWidth();
		$("#" + this.div_string).animate({height:_.keys(this.model.get('data_object')).length*18 + 50},500);

		// once the height is determined, render the view
		setTimeout(function(){
			self.height = $("#" + self.div_string).outerHeight();
			self.init_view();
			self.render();
		},501);
	},

	// ### init_view
	// set up the view from scratch.  Draw a background panel and place all dynamic content on that panel
	// with defualt values

	//		tick_view.init_view();
	init_view: function(){
		// stuff "this" into a variable for use inside of scoped funcitons
		var self = this;
		
		// check to see if the container is visible, if not, make it visible, but transparent so we draw it with
		// the proper dimensions
		if (this.$el.is(":hidden")){
			this.$el.animate({opacity:0},1);
			this.$el.show();
		}

		// rescale the width of the vis
		this.vis.attr("width",this.width);

		// rescale the height of the vis
		this.vis.attr("height",this.height);

		// set up scaling and margin parameters for the vis
		this.margin = 25;
		this.well_offset = 80;
		this.x_scale=d3.scale.linear().domain([-1,1]).range([this.well_offset + this.margin, this.width - this.margin]);

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		// draw the background of the panel
		this.bg_layer.selectAll('.bg_panel').data([]).exit().remove();
		this.bg_layer.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// build an xAxis
		var xAxis = d3.svg.axis()
			.scale(this.x_scale)
			.orient("bottom");

		// plot the x axis
		this.vis.selectAll('.axis').data([]).exit().remove();
		this.vis.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (this.height - this.margin) + ")")
			.call(xAxis);

		// style the axis
		this.vis.select('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.select('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.select('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");

		// grab data from the model and sort it according to the values in the object
		var data_array = _.pairs(this.model.get('data_object'));
		data_array = data_array.sort(function(a,b){
			if (arrayAverage(a[1]) < arrayAverage(b[1])) return 1;
			if (arrayAverage(a[1]) > arrayAverage(b[1])) return -1;
			return 0;
		});
		var keys = [];
		var values = [];
		data_array.forEach(function(category){
			keys.push(category[0]);
			values.push(category[1]);
		});

		// draw the static index reagent text
		this.fg_layer.selectAll('.title_text').data([]).exit().remove();
		this.fg_layer.selectAll('.title_text').data([1])
							.enter().append("text")
							.attr("class","title_text")
							.attr("x",this.width/2)
							.attr("y",17)
							.attr("fill","#56B4E9")
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.attr("text-anchor","middle")
							.text(this.model.get('title'));

		// draw the static category wells
		this.fg_layer.selectAll('.category_well').data([]).exit().remove();
		this.fg_layer.selectAll('.category_well').data(keys)
							.enter().append("rect")
							.attr("class","category_well")
							.attr("x",this.margin + this.well_offset)
							.attr("y",function(d,i){return 18*i + 23;})
							.attr("height",17)
							.attr("width",this.width - this.margin*2 - this.well_offset)
							.attr("fill", function(d,i){
								if (i%2 == 0){
									return "#bdbdbd";
								}else{
									return "#999999";
								}
							});
		// draw the ticks
		values.forEach(function(value_array,i){
			tick_class = keys[i] + 'tick'
			self.fg_layer.selectAll('.' + tick_class).data([]).exit().remove();
			self.fg_layer.selectAll('.' + tick_class).data(value_array)
								.enter().append("rect")
								.attr("class","tick " + tick_class)
								.attr("x",self.x_scale)
								.attr("y",18*i + 23)
								.attr("height",17)
								.attr("width",3)
								.attr("fill", "#ff0000");
		});

		

		// add a png export overlay
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export no_png_export")
			.attr("x",10)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
			.on("click",function(){self.save_png();});
	},

	// ### render
	// render the dynamic content of the view based on the current state of the view's data model

	//		tick_view.render();
	render: function(){
		// grab data from the model and sort it according to the values in the object
		var data_array = _.pairs(this.model.get('data_object'));
		data_array = data_array.sort(function(a,b){
			if (arrayAverage(a[1]) < arrayAverage(b[1])) return 1;
			if (arrayAverage(a[1]) > arrayAverage(b[1])) return -1;
			return 0;
		});
		var keys = [];
		var values = [];
		data_array.forEach(function(category){
			keys.push(category[0]);
			values.push(category[1]);
		});

		// draw the static category text
		this.fg_layer.selectAll('.category_text').data([]).exit().remove();
		this.category_text_selection = this.fg_layer.selectAll('.category_text').data(keys);
		this.category_text_selection.enter().append("text")
							.attr("class","category_text")
							.attr("x",this.margin)
							.attr("y",function(d,i){return 18*i + 40;})
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.text(function(d){return d;});

		this.category_text_selection.exit().remove();

	},

	// ### hide
	// hides the view by dimming the opacity and hiding it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the hide animation. defualts to *1*

	//		pert_detail_view.hide(duration);
	hide: function(duration){
		duration = (duration !== undefined) ? duration : 1;
		var self = this;
		this.$el.animate({opacity:0},duration);
		var check_interval = setInterval(check_for_compiled_template(),1);
		function check_for_compiled_template(){
			if (!self.isCompiling){
				clearInterval(check_interval);
				self.width = self.width = $("#" + self.div_string).outerWidth();
				setTimeout(function(){self.$el.hide();},duration);
			}
		}
	},

	// ### show
	// shows the view by brightening the opacity and showing it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the show animation. defualts to *1*

	//		pert_detail_view.show(duration);
	show: function(duration){
		duration = (duration !== undefined) ? duration : 1;
		this.$el.show();
		this.$el.animate({opacity:1},duration);
	},

	// ### savePng
	// save the current state of the view into a png image

	//		tick_view.save_png();
	save_png: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.vis.attr("width");
		var height = this.vis.attr("height");
		var html_snippet = '<canvas id="tmpCanvas" width="' + width + 'px" height="' + height + 'px"></canvas>';
		$('body').append(html_snippet);

		// dim the png label on the image
		var png_selection = this.vis.selectAll(".no_png_export");
		var png_opacity = png_selection.attr("opacity");
		png_selection.attr("opacity",0);

		// grab the content of the target svg and place it in the canvas element
		var svg_snippet = this.vis.node().parentNode.innerHTML;
		canvg(document.getElementById('tmpCanvas'), '<svg>' + svg_snippet + '</svg>', { ignoreMouse: true, ignoreAnimation: true });

		// save the contents of the canvas to file and remove the canvas element
		var canvas = $("#tmpCanvas")[0];
		var filename = "cmapTickView" + new Date().getTime() + ".png";
		if (canvas.toBlob){canvas.toBlob(function(blob){saveAs(blob,filename);})};
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
	}

});
