// # **BaristaBaseView**
// A Backbone.View the serves as the base view for other views in the barista library.  BaristaBaseView provides common
// functionality for views including standard initialization, redraw, render, template compilation, and png export functions.
// This view by itself will construct a single panel with a png export option, but it is meant to be used as the base view
// that more complex views extend

// basic use:

//		base_view = new BaristaBaseView();

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 3.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"col-lg-12"*
// 4.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*

//		base_view = new BaristaBaseView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "col-lg-12",
//									plot_height: 120});

// to extend BaristaBaseView, use

//		extended_view = BaristaBaseView.extend({
//										...
//										});
Barista.Views.BaristaBaseView = Backbone.View.extend({
	// ### initialize
	// initialize the view.  Views that extend BaristaBaseView should impliment code overiding this method.
	// If extended BaristaBaseViews want to use the built in base_initialize method of BaristaBaseView, they should
	// call it in their redraw method.  As an example:

	//		initialize: function(){
	//					this.base_initialize();
	//					//your code here
	//					}
	//

	initialize: function(){
		this.base_initialize();
	},

	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "BaristaBaseView",

	// ### model
	// default model to Backbone.Model.  This default is only provided to make the view
	// functional as a un-extended standalone.  An appropriate data model should be
	// supplied for all views that extend BaristaBaseView
	model: new Backbone.Model(),

	// ### base_initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view.  This method is provided so it 
	// can be used in view that extend BaristaBaseView
	base_initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the default height for the plot
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : 120;

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "col-lg-12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.update);

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

		return this;
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		var self = this;
		this.div_string = 'barista_view' + Math.round(Math.random()*1000000);
		this.compiled_template = BaristaTemplates.d3_target;
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### render
	// completely render the view. Updates both static and dynamic content in the view.  Views
	// that extend BaristaBaseView should impliment draw code overiding this method.  If extended
	// BaristaBaseViews want to use the built in base_render method of BaristaBaseView, they should
	// call it in their render method.  As an example:

	//		render: function(){
	//					this.base_render();
	//					//your code here
	//					}
	//

	render: function(){
		this.base_render();
		return this;
	},

	// ### base_render
	// completely redraw the view. Updates both static and dynamic content in the view.
	// This method is provided so it can be used in view that extend BaristaBaseView
	base_render: function(){
		// stuff this into a variable for later use
		var self = this;

		// check to see if the container is visible, if not, make it visible, but transparent so we draw it with
		// the proper dimensions
		if (this.$el.is(":hidden")){
			this.$el.animate({opacity:0},1);
			this.$el.show();
		}

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		this.vis.selectAll('.controls_layer').data([]).exit().remove();
		this.controls_layer = this.vis.append("g").attr("class", "controls_layer");

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().attr("width",this.width);
		this.vis.transition().attr("height",this.height);

		// draw the background of the panel
		this.bg_layer.selectAll('.bg_panel').data([]).exit().remove();
		this.bg_layer.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// add a png export overlay
		this.controls_layer.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.controls_layer.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export no_png_export")
			.attr("x",10)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
			.on("click",function(){self.save_png();});

		return this;
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		return this;
	},

	// ### savePng
	// save the current state of the view into a png image
	save_png: function(){
		// do any pre save work that the child class may require
		this.save_png_pre();

		// build a canvas element to store the image temporarily while we save it
		var width = this.width;
		var height = this.height;
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
		var filename = this.name + new Date().getTime() + ".png";
		if (canvas.toBlob){
			canvas.toBlob(function(blob){
				saveAs(blob,filename);
				});
		}
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);

		// do any post save work that the child class may require
		this.save_png_post();
	},

	// ### save_png_pre
	// dummy method that should be overiden if there is any work to do before
	// saving the png image of the view.  For example, removing elements that
	// will not render properly could be done before saving the image.  This
	// function is called as the first step of *save_png*
	save_png_pre: function(){},

	// ### save_png_post
	// dummy method that should be overiden if there is any work to do after
	// saving the png image of the view.  For example, restoring elements that
	// were removed before saving could be done after saving the image.  This
	// function is called as the last step of *save_png*
	save_png_post: function(){},


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
	}
});
// # **BarPlotView**
// A Backbone.View that displays a scatter plot.  the view's model is assumed to have the same defaults
// as specified in **BarPlotModel**

// basic use:

//		bar_plot_view = new BarPlotView();

// optional arguments:

// 1.  {String}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {String}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 3.  {String}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*
// 4.  {Array}  **range**  a two element array specifying the plotting bounds of the plot, defaults to *[min(data),max(data)]*
// 5.  {Bool}  **log**  if set to true, plots the data on a log scale, defaults to *false*
// 6. {Number} **min_lock** if set, locks the minimum of the range at the given value. Ignored if range is set. defaults to *undefined*
// 7. {Number} **max_lock** if set, locks the maximum of the range at the given value. Ignored if range is set. defaults to *undefined*
// 8. {Bool} **min_expand** if set, allows the minimum of the range to expand if data is found below it. defaults to *false*
// 9. {Bool} **max_expand** if set, allows the maximum of the range to expand if data is found above it. defaults to *false*
// 10. {String} **orientation** sets the orientation of the bar plot. options are 'horizontal' or 'vertical'. defaults to *'vertical'*
// 11.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*

//		bar_plot_view = new BarPlotView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									scale_by: undefined,
//									range: undefined,
//									log: false,
//									min_lock: undefined,
//									max_lock: undefined,
//									min_expand: false,
//									max_expand: false,
//									plot_height: 120});

Barista.Views.BarPlotView = Barista.Views.BaristaBaseView.extend({
	// ### model
	// set up the view's default model
	model: new Barista.Models.BarPlotModel(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up x and y range and determine if are going to draw the axes dynamically
		this.range = (this.options.range !== undefined) ? this.options.x_range : undefined;
		this.dynamic_range = (this.range === undefined) ? true : false;

		// set up axis expansion and lock features
		this.min_lock = (this.options.min_lock !== undefined) ? this.options.min_lock : undefined;
		this.max_lock = (this.options.max_lock !== undefined) ? this.options.max_lock : undefined;

		this.min_expand = (this.options.min_expand !== undefined) ? this.options.min_expand : undefined;
		this.max_expand = (this.options.max_expand !== undefined) ? this.options.max_expand : undefined;

		// set up log flag
		this.log = (this.options.log !== undefined) ? this.options.log : false;

		// set up the margin
		this.margin = (this.options.margin !== undefined) ? this.options.margin : 50;

		// set up the orientation
		this.orientation = (this.options.orientation !== undefined) ? this.options.orientation : 'vertical';

		// set up x and y ranges
		this.set_ranges();

		// set up x and y scaling
		this.set_scales();		

		// run BaristaBaseView's base_initialize method to handle boilerplate view construction
		// and initial view rendering
		this.base_initialize();

		// build Axes
		this.build_axes();

	},

	// ### redraw
	// completely redraw the view. Updates both static and dynamic content in the view.
	render: function(){
		this.base_render();
		this.init_plot();
		this.update();
	},

	// ### init_plot
	// initialize the static parts of the view's panel
	init_plot: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up x and y ranges
		this.set_ranges();

		// set up x and y scaling
		this.set_scales();		

		// build Axes
		this.build_axes();

		// style the axis
		this.style_axes();

		// render the bar data
		if (this.orientation === 'horizontal'){
			this.render_horizontal_bars();
		}else{
			this.render_vertical_bars();
		}

		// plot the title
		this.bg_layer.selectAll('.title').data([]).exit().remove();
		this.bg_layer.selectAll('.title').data([1]).enter().append('text')
			.attr("class","title title")
			.attr("x",this.width/2)
			.attr("y",this.margin/2)
			.style("text-anchor","middle")
			.text(this.model.get('title'));
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		var self = this;
		
		// get model data
		this.data = this.model.get('data');
		
		// set up x and y ranges
		this.set_ranges();

		// set up x and y scaling
		this.set_scales();

		// build Axes
		this.build_axes();

		// update the bar data
		if (this.orientation === 'horizontal'){
			this.update_horizontal_bars();
		}else{
			this.update_vertical_bars();
		}
	},

	// ### set_ranges
	// utility function used to get the x and y ranges used in the plot
	set_ranges: function(){
		var data,min,max;
		// calculate the range. If we need to caluclate it dynamically, check the lock and expand
		// parameters for the axis
		if (this.dynamic_range === true){
			data = this.model.get('data');

			// if the data is of length larger than 1, calculate the range, otherwise set the range to [0,0]
			if (data.length > 0 ){
				// check the min lock and expand flags and report the min of the range accordingly
				if (this.min_lock === undefined){
					min = _.min(data);
				}else{
					if (this.min_expand){
						data_min = _.min(data);
						min = (this.min_lock > data_min) ? data_min : this.min_lock;
					}else{
						min = this.min_lock;
					}
				}

				// check the max lock and expand flags and report the max of the range accordingly
				if (this.max_lock === undefined){
					max = _.max(data);
				}else{
					if (this.max_expand){
						data_max = _.max(data);
						max = (this.max_lock < data_max) ? data_max : this.max_lock;
					}else{
						max = this.max_lock;
					}
				}
				this.range = [min,max];
			}else{
				this.range = [0,0];
			}
		}
	},

	// ### set_scales
	// utility function used to get the x and y scales used in the plot
	set_scales: function(){
		if (this.log){
			this.x_scale=d3.scale.log().domain([this.range[0],this.range[1]]).range([this.margin, this.width - this.margin]);
		}else{
			this.x_scale=d3.scale.linear().domain([this.range[0],this.range[1]]).range([this.margin, this.width - this.margin]);
		}
		if (this.log){
			this.y_scale=d3.scale.log().domain([this.range[1],this.range[0]]).range([this.margin, this.height - this.margin]);
		}else{
			this.y_scale=d3.scale.linear().domain([this.range[1],this.range[0]]).range([this.margin, this.height - this.margin]);
		}
	},

	// ### build_axes
	// utility function used to build x and y axes
	build_axes: function(){
		var self = this;

		this.xAxis = d3.svg.axis()
			.scale(this.x_scale)
			.orient("bottom");
		this.yAxis = d3.svg.axis()
			.scale(this.y_scale)
			.orient("left");

		// plot the appropriate axis depending on the orientation of the plot
		this.bg_layer.selectAll('.axis').data([]).exit().remove();
		if (this.orientation === 'horizontal'){
				self.bg_layer.append("g")
					.attr("class", "axis x-axis")
					.attr("transform", "translate(0," + (self.height - self.margin) + ")")
					.call(self.xAxis);
		}else{
			self.bg_layer.append("g")
				.attr("class", "axis y-axis")
				.attr("transform", "translate(" + self.margin + ",0)")
				.call(self.yAxis);
		}
	},

	// ### style axes
	// utility function to apply custom styles to axis components
	style_axes: function(){
		this.vis.selectAll('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");
	},

	// ### render_vertical_bars
	// draws bars in vertical mode
	render_vertical_bars: function(){
		var self = this;
		// get the model's data
		this.data = this.model.get('data');

		// figure out how wide each bar will be
		this.x_domain = this.x_scale.range();
		this.bar_width = (this.x_domain[1] - this.x_domain[0]) / this.data.length;

		// plot the data points
		this.bg_layer.selectAll('.data_bar').data([]).exit().remove();
		this.bg_layer.selectAll('.data_bar').data(this.data).enter().append('rect')
			.attr("class","data_bar")
			.attr("x",function(d,i){return self.bar_width*i + self.margin;})
			.attr("y",this.y_scale(this.range[0]))
			.attr("width",this.bar_width)
			.attr("height",0)
			.attr("opacity",0)
			.attr("stroke","white")
			.attr("fill",this.fg_color);

		// plot the x axis title
		this.bg_layer.selectAll('.x_axis_label').data([]).exit().remove();
		this.bg_layer.selectAll('.x_axis_label').data([1]).enter().append('text')
			.attr("class","x_axis_label axis_label")
			.attr("x",this.width/2)
			.attr("y",this.height-10)
			.style("text-anchor","middle")
			.text(this.model.get('axis_title'));

		// plot the labels if they are there
		var labels = this.model.get('data_labels');
		if (labels.length > 0){
			this.bg_layer.selectAll('.bar_label').data([]).exit().remove();
			this.bg_layer.selectAll('.bar_label').data(labels).enter().append('text')
				.attr('class','bar_label')
				.attr("x",function(d,i){return self.bar_width*i + self.margin + self.bar_width/2;})
				.attr('y',this.height - this.margin)
				.attr('dy','1em')
				.attr('opacity',0)
				.style("text-anchor","middle")
				.text(function(d){return d;});
		}

		// style the axis
		this.style_axes();
	},

	// ### render_horizontal_bars
	// draws bars in horizontal mode
	render_horizontal_bars: function(){
		var self = this;
		// get the model's data
		this.data = this.model.get('data');

		// figure out how tall each bar will be
		this.y_domain = this.y_scale.range();
		this.bar_height = (this.y_domain[1] - this.y_domain[0]) / this.data.length;

		// plot the data points
		this.bg_layer.selectAll('.data_bar').data([]).exit().remove();
		this.bg_layer.selectAll('.data_bar').data(this.data).enter().append('rect')
			.attr("class","data_bar")
			.attr("y",function(d,i){return self.bar_height*i;})
			.attr("x",this.margin + 2)
			.attr("height",this.bar_height)
			.attr("width",0)
			.attr("opacity",0)
			.attr("stroke","white")
			.attr("fill",this.fg_color);

		// plot the x axis title
		this.bg_layer.selectAll('.x_axis_label').data([]).exit().remove();
		this.bg_layer.selectAll('.x_axis_label').data([1]).enter().append('text')
			.attr("class","x_axis_label axis_label")
			.attr("x",this.width/2)
			.attr("y",this.height-10)
			.style("text-anchor","middle")
			.text(this.model.get('axis_title'));
	},

	// ### update_vertical_bars
	// updates the data in the bars in vertical orientation
	update_vertical_bars: function(){
		var self = this;
		// build Axes
		this.build_axes();

		// figure out how wide each bar will be
		this.x_domain = this.x_scale.range();
		this.bar_width = (this.x_domain[1] - this.x_domain[0]) / this.data.length;

		// plot new data points
		var bar_selection = this.bg_layer.selectAll('.data_bar').data(this.data);
		bar_selection.enter().append('rect')
			.attr("class","data_bar")
			.attr("x",function(d,i){return self.bar_width*i + self.margin;})
			.attr("y",this.y_scale(this.range[0]))
			.attr("width",this.bar_width)
			.attr("height",0)
			.attr("opacity",0)
			.attr("stroke","white")
			.attr("fill",this.fg_color);

		// transition points
		bar_selection.transition().duration(500)
			.attr("x",function(d,i){return self.bar_width*i + self.margin;})
			.attr("y",this.y_scale)
			.attr("width",this.bar_width)
			.attr("height",function(d){return self.y_scale(self.range[0]) - self.y_scale(d)})
			.attr("opacity",1);

		// remove excess points 
		bar_selection.exit().remove();

		// update the labels if they are there
		var labels = this.model.get('data_labels');
		if (labels.length > 0){
			var bar_label_selection = this.bg_layer.selectAll('.bar_label').data(labels);
			bar_label_selection.enter().append('text')
				.attr('class','bar_label')
				.attr("x",function(d,i){return self.bar_width*i + self.margin + self.bar_width/2;})
				.attr('y',this.height - this.margin)
				.attr('dy','1em')
				.attr('opacity',0)
				.style("text-anchor","middle")
				.text(function(d){return d;});

			bar_label_selection.transition().duration(500)
				.attr("x",function(d,i){return self.bar_width*i + self.margin + self.bar_width/2;})
				.attr('y',this.height - this.margin)
				.attr('dy','1em')
				.attr('opacity',1);

			bar_label_selection.exit().remove();
		}else{
			this.bg_layer.selectAll('.bar_label').data([]).exit().remove();
		}

		// transition the axes
		this.vis.selectAll('.y-axis').transition().duration(500).call(this.yAxis);
		this.style_axes();
	},

	// ### update_horizontal_bars
	// updates the data in the bars in vertical orientation
	update_horizontal_bars: function(){
		var self = this;
		// figure out how tall each bar will be
		this.y_domain = this.y_scale.range();
		this.bar_height = (this.y_domain[1] - this.y_domain[0]) / this.data.length;

		// plot new data points
		var bar_selection = this.bg_layer.selectAll('.data_bar').data(this.data);
		bar_selection.enter().append('rect')
			.attr("class","data_bar")
			.attr("y",function(d,i){return self.bar_height*i;})
			.attr("x",this.margin + 2)
			.attr("height",this.bar_height)
			.attr("width",0)
			.attr("opacity",0)
			.attr("stroke","white")
			.attr("fill",this.fg_color);

		// transition points
		bar_selection.transition().duration(500)
			.attr("width",this.x_scale)
			.attr("opacity",1);

		// remove excess points 
		bar_selection.exit().remove();

		// transition the axes
		this.vis.selectAll('.x-axis').transition().duration(500).call(this.xAxis);
		this.style_axes();
	}
});
// # **BaristaCardView**
// A Backbone View that displays a card of information wrapped in link.
// The view is meant to be a top level entry point to other pages

// basic use:

//		card_view = new BaristaCardView();

// optional arguments:

// 1.  {string}  **url**  the link to navigate to if the card is clicked, defaults to *""*
// 2.  {string}  **title**  the title of the card. defaults to *"title"*
// 3.  {string}  **subtitle**  the subtitle of the card. defaults to *"subtitle"*
// 2.  {string}  **image**  the link to an image to show as the cards main content. defaults to *""*
// 4.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 5.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"col-lg-12"*

//		card_view = new BaristaCardView({el: $("target_selector",
//									url:"",
//									title:"",
//									subtitle:"",
//									fg_color: "#1b9e77",
//									image:"",
//									span_class: "col-lg-12"});
Barista.Views.BaristaCardView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "BaristaCardView",

	// ## model
	// supply a base model for the view.  Overide this if you need to use it for dynamic content
	model: new Backbone.Model(),

	// ## initialize
	// overide the view's default initialize method in order to catch options and 
	// render a custom template
	initialize: function(){
		// set up color options.  default if not specified
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "col-lg-12";

		// set up the url
		this.url = (this.options.url !== undefined) ? this.options.url : "";

		// set up the title
		this.title = (this.options.title !== undefined) ? this.options.title : "Title";

		// set up the subtitle
		this.subtitle = (this.options.subtitle !== undefined) ? this.options.subtitle : "subtitle";

		// set up the image
		this.image = (this.options.image !== undefined) ? this.options.image : "";

		// bind render to model changes
		this.listenTo(this.model,'change', this.update);

		// compile the default template for the view
		this.compile_template();
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		var self = this;
		this.div_string = 'barista_view' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.CMapCard({div_string: this.div_string,
												span_class: this.span_class,
												url: this.url,
												title: this.title,
												subtitle: this.subtitle,
												image: this.image,
												fg_color: this.fg_color}));
	},

	// ### render
	// overide this function if the view needs to do more complex rendering than
	// simple template compilation
	render: function(){

	},

	// ### update
	// overide this function if the view needs to update
	render: function(){

	}
});
// # **BubbleView**
// A Backbone.View that displays a single level tree of data as a bubble plot.  The view should be bound to a 
// model such as a **PertCellBreakdownModel** that captures tree data in a *tree_object* attribute. 

// basic use:

//		bubble_view = new BubbleView({el: $("target_selector")});

// optional arguments:

// 3.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 4.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span4"*

//		bubble_view = new BubbleView({el: $("target_selector"),
//									fg_color: "#1b9e77",
//									span_class: "span4"});

Barista.Views.BubbleView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "BubbleView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.PertCellBreakdownModel(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span4";

		// set up the plot height
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : 120;

		// set up the bubble minimum and maximum scale values
		this.min_val = (this.options.min_val !== undefined) ? this.options.min_val : undefined;
		this.max_val = (this.options.max_val !== undefined) ? this.options.max_val : undefined;

		// set up splitting categories
		this.v_split = (this.options.v_split !== undefined) ? this.options.v_split : undefined;
		this.h_split = (this.options.h_split !== undefined) ? this.options.h_split : undefined;

		// bind render to model changes
		this.listenTo(this.model,'change', this.update);

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

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### render
	// draw the view from scratch
	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();
		this.v_center = this.height / 2;
		this.h_center = this.width / 2;

		// rescale the width of the vis
		this.vis.transition().duration(1).attr("width",this.width);

		// grab the data from the model
		this.data = this.model.get('tree_object').children;

		// set up some data scaling
		var max_count, min_count;
		if (this.max_val !== undefined){
			max_count = this.max_val;
		}else{
			max_count = _.max(_.pluck(this.data,'count'));
		}
		if (this.min_val !== undefined){
			min_count = this.min_val;
		}else{
			min_count = _.min(_.pluck(this.data,'count'));
		}
		this.data_scale = d3.scale.linear().domain([min_count,max_count])
						.range([5,30]);

		// define the force directed graph layout
		this.force = d3.layout.force()
						.nodes(this.data)
						.gravity(0.1)
						.friction(0.9)
						.size([this.width, this.height])
						.on("tick",function(e){tick(e);})
						.charge(function(d){return -Math.pow(self.data_scale(d.count),2)/8;})
						.start();

		// draw the initial layout
		this.vis.selectAll("circle").data(this.force.nodes()).exit().remove();
		this.vis.selectAll("circle").data(this.force.nodes())
				.enter().append("circle")
				.attr("class",this.div_string + "_circle")
				.attr("fill",this.fg_color)
				.attr("v_category",function(d){
					if (self.v_split !== undefined){
						return d[self.v_split];
					}else{
						return null;
					}
				})
				.attr("cx", Math.random() * 300)
				.attr("cy", Math.random() * 300)
				.attr("stroke","white")
				.attr("_id",function(d){return d._id;})
				.attr("r",function(d){return Math.sqrt(self.data_scale(d.count)/Math.PI);});

		// specify the nodes selection so we don't have to repeat the selection on each tick
        this.nodes = this.vis.selectAll("circle");
        this.nodes.call(this.force.drag());

		// reset a damening variable for simulation
		this.damp = 0.1;

		// tick function for use in the force class
		function tick(e){
			self.vertical_split(e.alpha);
			self.nodes.attr("cx", function(d) {return d.x;})
                .attr("cy", function(d) {return d.y;})
                // .attr("r",function(d){return self.data_scale(d.count);});

        }
	},

	// ### vertical_split
	// push bubbles vertically based on an attribute property
	vertical_split: function(alpha){
		var self = this;
		bubble_selection = this.vis.selectAll('circle');
		bubble_selection
			.attr("cy",function(d){
					if (d[self.v_split] == 'up'){
						d.y = d.y + (self.v_center - 10 - d.y) * (self.damp + 0.02) * alpha * 1.1;
					}else{
						d.y = d.y + (self.v_center + 10 - d.y) * (self.damp + 0.02) * alpha * 1.1;
					}
					return(d.y);
			});
	},

	// ### update
	// update the plot with new data
	update: function(){
		// stuff this into a variable for later use
		var self = this;

		// grab the data from the model
		var new_data = this.model.get('tree_object').children;

		// grab the current nodes
		var nodes = this.force.nodes();

		// update the nodes in this.force
		if (this.force.nodes().length <= new_data.length){
			this.force.nodes().forEach(function(o,i){
				_.extend(o,new_data[i]);
				_.extend(o,{x:nodes[i]['x'],y:nodes[i]['y']});
			});
			if (this.force.nodes().length < new_data.length){
				this.force.nodes(this.force.nodes().concat(new_data.slice(this.force.nodes().length,new_data.length)));
			}
		}else{
			this.force.nodes(this.force.nodes().slice(0,new_data.length));
			this.force.nodes().forEach(function(o,i){
				_.extend(o,new_data[i]);
				_.extend(o,{x:nodes[i]['x'],y:nodes[i]['y']});
			});
		}

		// draw the initial layout for new bubbles
		bubble_selection = this.vis.selectAll("circle").data(this.force.nodes());
		bubble_selection.enter()
				.append("circle")
				.attr("class",this.div_string + "_circle")
				.attr("fill",this.fg_color)
				.attr("cx", function(d){return d.x;})
				.attr("cy", function(d){return d.y;})
				.attr("stroke","white")
				.attr("_id",function(d){return d._id;})
				.attr("r",0);

		// transition bubbles
		bubble_selection.transition().duration(500)
				.attr("r",function(d){return self.data_scale(d.count);});

		// remove bubbles with no data
		bubble_selection.exit().remove();

		// start the simulation again
		this.force.start();

		// specify the nodes selection so we don't have to repeat the selection on each tick
        this.nodes = this.vis.selectAll("circle");
        this.nodes.call(this.force.drag());

        // tick function for use in the force class
		function tick(e){
			self.vertical_split(e.alpha);
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
// 5.  {string}  **template**  The path to a handlebars template to use. Defaults to *templates/CMapFooter.handlebars*

//		header = new CMapFooterView({el:"footer_target", 
//									organization: "Broad Institute",
//									terms_url: "http://lincscloud.org/terms-and-conditions/",
// 									logo: ['../img/broad_logo_small.png','../img/cmap_logo_small.png'],
// 									logo_url: ['http://www.broadinstitute.org/','http://lincscloud.org/'],
//									template: "../templates/CMapFooter.handlebars"});
Barista.Views.CMapFooterView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "CMapFooterView",

	// ### initialize
	// overide the default Backbone.View initialize function to compile a built in template and then render the view
	initialize: function(){
		// store passed parameters as attributes of the view
		this.organization = (this.options.organization !== undefined) ? this.options.organization : "Broad Institute";
		this.terms_url = (this.options.terms_url !== undefined) ? this.options.terms_url : "http://lincscloud.org/terms-and-conditions/";
		this.logo = (this.options.logo !== undefined) ? this.options.logo : ['http://coreyflynn.github.io/Bellhop/img/broad_logo_small.png','http://coreyflynn.github.io/Bellhop/img/cmap_logo_small.png'];
		this.logo_url = (this.options.logo_url !== undefined) ? this.options.logo_url : ['http://www.broadinstitute.org/','http://lincscloud.org/'];
		this.template = (this.options.template !== undefined) ? this.options.template : "templates/CMapFooter.handlebars";

		// compile the default template for the view
		this.compile_template();

		// render the template
		this.render();
	},

	// ### compile_template
	// use Handlebars to compile the specified template for the view
	compile_template: function(){
		// grab the template
		this.compiled_template = BaristaTemplates.CMapFooter;

		// package logos and log_urls into a set of object to iterate over
		var logo_objects = []
		for (var i=0; i < this.logo.length; i++){
			logo_objects.push({logo: this.logo[i], url: this.logo_url[i]});
		}
		this.$el.append(this.compiled_template({organization: this.organization,
										terms_url: this.terms_url,
										logo_objects: logo_objects,
										year: new Date().getFullYear()}));
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
Barista.Views.CMapHeaderView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "CMapHeaderView",

	// ### initialize
	// overide the default Backbone.View initialize function to compile a built in template and then render the view
	initialize: function(){
		// store passed parameters as attributes of the view
		this.title = (this.options.title !== undefined) ? this.options.title : "";
		this.subtitle = (this.options.subtitle !== undefined) ? this.options.subtitle : "";
		this.template = (this.options.template !== undefined) ? this.options.template : "templates/CMapHeader.handlebars";

		// compile the default template for the view
		this.compile_template();

		// render the template
		this.render();
	},

	// ### compile_template
	// use Handlebars to compile the specified template for the view
	compile_template: function(){
		var self = this;
		// grab the template
		this.compiled_template = BaristaTemplates.CMapHeader;
		this.$el.append(this.compiled_template({title: this.title,
										subtitle: this.subtitle}));
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
Barista.Views.CellSearchBar = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "PertSearchBar",

	initialize: function(){
		var self = this;

		/**
		determines whether or not the search view will match cell lines for autocomplete

		@property match_cell_lines
		@default true
		@type Boolean
		**/
		// determine whether or not we will match cell line strings in the autocomplete
		this.match_cell_lines = (this.options.match_cell_lines !== undefined) ? this.options.match_cell_lines : true;

		// grab cell_ids and store them as an atribute of the view
		var cellinfo = 'http://api.lincscloud.org/a2/cellinfo?callback=?';
		var params = {q:'{"cell_id":{"$regex":""}}',d:"cell_id"};
		$.getJSON(cellinfo,params,function(res){
			self.cell_lines = res;
			self.render();

			// once the view is rendered, bind a change event to trigger a "search:DidType" event from the view
			var change_callback = function () {
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
				self.trigger("search:DidType",{val: val,search_column: undefined});
			};

			$("#search",self.el).bind('input propertychange change', _.throttle(change_callback,500));

			// bind a search:DidType event to the typeahead events coming out of typeahead.js
			$(".typeahead",self.el).bind('typeahead:selected typeahead:autocompleted', function (obj,datum) {
				var val = datum.value;
				var search_column = datum.search_column;
				self.trigger("search:DidType",{val: val,search_column: search_column});
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
		params = {q: '{"pert_type":{"$in":["trt_cp","trt_sh"]}}',
					f:'{"pert_iname":1}',
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
		this.trigger("search:DidType",{val: new_val,search_column: undefined }); //TODO need to find search column info
	},

	/**
    renders the view
    
    @method render
    **/
	render: function(){
		var self = this;

		// load the template into the view's el tag
		this.$el.append(BaristaTemplates.CMapPertSearchBar());

		$('#search',this.$el).typeahead([{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 5,

			// provide a name for the default typeahead data source
			name: 'Cellular Contexts',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline"]},"cell_id":{"$regex":"%QUERY", "$options":"i"}}',
					  // '&f={"cell_id":1,"cell_type":1}',
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
			},
      {
			// only return 4 items at a time in the autocomplete dropdown
			limit: 5,

			// provide a name for the default typeahead data source
			name: 'Cellular Contexts 2',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline"]},"cell_lineage":{"$regex":"%QUERY", "$options":"i"}}',
					  // '&f={"cell_id":1,"cell_type":1}',
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
							color: '#CC79A7',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
			},
      {
			// only return 4 items at a time in the autocomplete dropdown
			limit: 5,

			// provide a name for the default typeahead data source
			name: 'Cellular Contexts 3',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["core_cline","core_pline"]},"cell_histology":{"$regex":"%QUERY", "$options":"i"}}',
					  // '&f={"cell_id":1,"cell_type":1}',
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
							color: '#CC79A7',
						});
						datum_list.push(datum);
					});

					// return the processed list of datums for the autocomplete
					return datum_list;
				}
			}
		}]);
	}
});

// # **CompoundDetailView**

// A Backbone.View that shows information about a small molecule compound.  This view is
// frequently paired with a CompoundDetailModel.

//		pert_detail_view = new CompoundDetailView({el: $("target_selector")});

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"col-lg-12"*

//		pert_detail_view = new CompoundDetailView({el: $("target_selector"),
// 												model: CompoundDetailModel,
// 												bg_color: "#ffffff",
// 												span_class: "col-lg-12"});
Barista.Views.CompoundDetailView =Barista.Views.BaristaBaseView.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "CompoundDetailView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.CompoundDetailModel(),
	
	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	initialize: function(){
		// set up the plot height
		this.options.plot_height = 130;

		// initialize the view using the base view's built in method
		this.base_initialize();
	},

	// ### render
	// completely render the view. Updates both static and dynamic content in the view.
	render: function(){
		var self = this;
		// render the base view components
		this.base_render();

		// draw the static index reagent icon
		this.fg_layer.selectAll('.index_text_icon').data([]).exit().remove();
		this.fg_layer.selectAll('.index_text_icon').data([1])
							.enter().append("svg:image")
							.attr("class","index_text_icon")
			                .attr("xlink:href", "http://coreyflynn.github.io/Bellhop/img/CP.png")
							.attr("x",10)
							.attr("y",0)
							.attr("height",40)
							.attr("width",40);

		// draw the static index reagent text
		this.fg_layer.selectAll('.index_text').data([]).exit().remove();
		this.fg_layer.selectAll('.index_text').data([1])
							.enter().append("text")
							.attr("class","index_text")
							.attr("x",60)
							.attr("y",30)
							.attr("fill","#E69F00")
							.attr("font-family","Helvetica Neue")
							.attr("font-size","20pt")
							.text('Small Molecule Compound');

		// (re)draw the pert_iname text
		this.fg_layer.selectAll('.pert_id_text').data([]).exit().remove();
		this.fg_layer.selectAll('.pert_id_text').data([1])
							.enter().append("text")
							.attr("class","pert_id_text")
							.attr("x",10)
							.attr("y",75)
							.attr("font-family","Helvetica Neue")
							.attr("font-weight","bold")
							.attr("font-size","36pt")
							.text(this.model.get('pert_iname'));
		
		// (re)draw the pert_iname
		this.fg_layer.selectAll('.pert_iname_text').data([]).exit().remove();
		this.fg_layer.selectAll('.pert_iname_text').data([1])
							.enter()
							.append("text")
							.attr("class","pert_iname_text")
							.attr("x",10)
							.attr("y",100)
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.text(this.model.get('pert_id'));

		// (re)draw the pert_summary or clear it if there pert_summary is null
		if (this.model.get('pert_summary')){
			this.render_summary({summary_string: this.model.get('pert_summary'),
								 top: 36,
								 bottom: 136,
								 left: this.model.get('pert_iname').length*36*.85});
		}else{
			this.clear_summary();
		}

		// check to see if there is a pubchem id and draw a link for it if there
		// is one
		this.controls_layer.selectAll("." + this.div_string + "pubchem_link").data([]).exit().remove();
		if (this.model.get('pubchem_cid')){
			this.controls_layer.selectAll("." + this.div_string + "pubchem_link").data([1]).enter().append("text")
				.attr("class", this.div_string + "pubchem_link no_png_export")
				.attr("x",this.width - 10)
				.attr("y",this.height - 10)
				.attr("opacity",0.25)
				.attr("text-anchor","end")
				.style("cursor","pointer")
				.text("PubChem")
				.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
				.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
				.on("click", function(){window.location = "http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?cid=" + self.model.get('pubchem_cid')});
		}

		// check to see if there is a wikipedia url and draw a link for it if there
		// is one
		this.controls_layer.selectAll("." + this.div_string + "wiki_link").data([]).exit().remove();
		if (this.model.get('wiki_url')){
			this.controls_layer.selectAll("." + this.div_string + "wiki_link").data([1]).enter().append("text")
				.attr("class", this.div_string + "wiki_link no_png_export")
				.attr("x",this.width - 80)
				.attr("y",this.height - 10)
				.attr("opacity",0.25)
				.attr("text-anchor","end")
				.style("cursor","pointer")
				.text("Wiki")
				.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
				.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
				.on("click", function(){window.location = self.model.get('wiki_url')});
		}

		return this;
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		this.render();
		return this;
	},

	// ### render_summary
	// utility function to break a long summary string into a multiline
	// and draw it at the desired location

	// options

	// 1.  {string}  **summary_string**  the string to be displayed, defaults to *""*
	// 2.  {right}  **right**  the x position to place the **right** edge of text, defaults to *this.width*
	// 3.  {left}  **left**  the x position to place the **left** edge of text, defaults to *this.width - 500*
	// 4.  {top}  **top**  the y position to place the **top** edge of text, defaults to *0*
	// 5.  {bottom}  **bottom**  the y position to place the **bottom** edge of text, defaults to *100*
	render_summary: function(options){
		var self = this;

		// default arguments if they are not present
		summary_string = (options.summary_string !== undefined) ? options.summary_string : "";
		top_edge = (options.top !== undefined) ? options.top : 0;
		bottom_edge = (options.bottom !== undefined) ? options.bottom : 100;
		right_edge = (options.right !== undefined) ? options.right : this.width;
		left_edge = (options.left !== undefined) ? options.left : this.width - 500;

		// clear existing summary
		this.clear_summary();

		// compute the number of lines we have room for
		this.line_height = 15;
		this.num_lines_allowed = Math.floor((bottom_edge - top_edge) / this.line_height);

		// compute the number of characters per line we will allow and how
		// many lines the summary would need if we rendered all of it
		this.line_width = right_edge - left_edge;
		this.num_char = Math.floor(this.line_width / 13 / .75);
		this.num_lines = Math.ceil(summary_string.length / this.num_char);

		// compute the line splits to display in the wiki summary
		this.lines = [];
		for (var i=0; i<this.num_lines; i++){
			if (i < this.num_lines_allowed - 1){
				var l = (summary_string.slice(i*this.num_char,(i+1)*this.num_char).slice(-1) != " " && summary_string.slice(i*this.num_char,(i+1)*this.num_char).slice(this.num_char-1,this.num_char) != "") ? summary_string.slice(i*this.num_char,(i+1)*this.num_char)  + '-': summary_string.slice(i*this.num_char,(i+1)*this.num_char);
				this.lines.push(l);
			}else{
				var l = summary_string.slice(i*this.num_char,(i+1)*this.num_char - 3) + '...';
				this.lines.push(l);
			}
		}

		// draw lines
		self.fg_layer.selectAll('.' + self.div_string + 'summary_text' + i).data(this.lines)
				.enter()
				.append("text")
				.attr("class",self.div_string + "summary_text")
				.attr("x",left_edge)
				.attr("y",function(d,i){return top_edge + 13 + i*15;})
				.attr("font-family","Helvetica Neue")
				.attr("font-size","13pt")
				.attr("fill","#777777")
				// .attr("text-anchor", "middle")
				.text(function(d){return d;});
	},

	// ### clear_summary
	// utility function to clear the pert summary
	clear_summary: function(){
		this.fg_layer.selectAll('.summary_text').data([]).exit().remove();
	},

	
	// ### save_png_pre
	// overide the base views save_png_pre method to clear out the image so we
	// can render the png properly
	save_png_pre: function(){
		// remove the static index reagent icon
		this.fg_layer.selectAll('.index_text_icon').data([]).exit().remove();

		// scoot the inde text to the left
		this.fg_layer.selectAll('.index_text')
			.attr('x',10)
	},

	// ### save_png_post
	// overide the base views save_png_post method to restore the image after
	// saving
	save_png_post: function(){
		// draw the static index reagent icon
		this.fg_layer.selectAll('.index_text_icon').data([]).exit().remove();
		this.fg_layer.selectAll('.index_text_icon').data([1])
							.enter().append("svg:image")
							.attr("class","index_text_icon")
			                .attr("xlink:href", "http://coreyflynn.github.io/Bellhop/img/CP.png")
							.attr("x",10)
							.attr("y",0)
							.attr("height",40)
							.attr("width",40);

		// scoot the inde text to the right
		this.fg_layer.selectAll('.index_text')
			.attr('x',60)
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
Barista.Views.CompoundSearchBar = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "CompoundSearchBar",

	initialize: function(){
		var self = this;
		this.render();

		// once the view is rendered, bind a change event to trigger a "search:DidType" event from the view
		var change_callback = function () {
			var val  = $("#search",self.el).val();
			var type = "";
			/**
			Fired when the text in the view's search box changes

			@event search:DidType
			@param {Object} [msg={val:"",type:""}] an object containing the message of the event
			@param {String} [msg.val=""] the string val of the views search bar at the time of the event
			@param {String} [msg.type=""] the type of message being passed, either "" or "cell". "cell" is passed, if the string matches a cell line and match\_cell\_lines is set
			**/
			self.trigger("search:DidType",{val: val,type: type});
		};

		$("#search",self.el).bind('input propertychange change', _.throttle(change_callback,500));

		// bind a search:DidType event to the typeahead events coming out of typeahead.js
		$(".typeahead",self.el).bind('typeahead:selected typeahead:autocompleted', function (obj,datum) {
			var val = datum.value;
			var type = "single";
			self.trigger("search:DidType",{val: val,type: type});
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
		params = {q: '{"pert_type":"trt_cp"}',
					f:'{"pert_iname":1}',
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
    renders the view
    
    @method render
    **/
	render: function(){
		var self = this;
		// load the template into the view's el tag
		this.$el.append(BaristaTemplates.CMapPertSearchBar());

		$('#search',this.$el).typeahead([{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'Reagents',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/pertinfo?',
					  'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}, "pert_type":"trt_cp"}',
					  '&f={"pert_iname":1,"pert_type":1}',
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

					// build a list of datum objects
					auto_data.forEach(function(item){
						var datum = {
							value: item,
							tokens: [item],
							data: object_map[item]
						};
						if (object_map[item].pert_type === 'trt_cp' ){
							_.extend(datum,{
								type: 'Chemical Reagent',
								color: '#E69F00',
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
		}]);
	}
});
Barista.Views.FlatTreeMapView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "FlatTreeMapView",

		model: new Barista.Models.PertCellBreakdownModel(),

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
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();
		this.top_svg = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);
		this.vis = this.top_svg.append("g");
		// this.vis_overlay = this.top_svg.append("g");

		// render the vis
		this.render();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.render();} );
	},

	compile_template: function(){
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class,
												height: 300}));
	},

	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
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
			this.top_svg.transition().duration(1).attr("opacity",0);
		}else{
			this.top_svg.transition().duration(500).attr("opacity",1);
		}

		// set up an alpha scaling
		this.min_count = _.min(_.pluck(this.data.children,'count'));
		this.max_count = _.max(_.pluck(this.data.children,'count'));
		this.opacity_map = d3.scale.linear()
							.domain([this.min_count,this.max_count,this.max_count+1])
							.range([1,1,0]);

		this.vis.data([this.data]).selectAll("rect").data([]).exit().remove();
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("_id", function(d) {return d._id;})
			.attr("count", function(d) {return d.count;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.attr("stroke", "white")
			.attr("stroke-width", 2);
		this.draw_text();
		this.add_tooltips();

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

		// if there are no children in the tree_object, dim the view
		if (this.data.children[0] === undefined){
			this.top_svg.transition().duration(1).attr("opacity",0);
		}else{
			this.top_svg.transition().duration(500).attr("opacity",1);
		}

		// set up an alpha scaling
		this.min_count = _.min(_.pluck(this.data.children,'count'));
		this.max_count = _.max(_.pluck(this.data.children,'count'));
		this.opacity_map = d3.scale.linear().domain([this.min_count,this.max_count,this.max_count+1])
						.range([1,1,0]);

		//add new data if it is there
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes)
			.enter().append("rect")
			.attr("class",this.div_string + "_cell")
			.attr("fill",this.fg_color)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("_id", function(d) {return d._id;})
			.attr("count", function(d) {return d.count;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;})
			.attr("stroke", "white")
			.attr("stroke-width", 2);

		// transition elements
		this.vis.data([this.data]).selectAll("rect")
			.transition().ease("cubic out").duration(500)
			.attr("opacity",function(d){return self.opacity_map(d.value);})
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {return d.y;})
			.attr("_id", function(d) {return d._id;})
			.attr("count", function(d) {return d.count;})
			.attr("width", function(d) {return d.dx;})
			.attr("height", function(d) {return d.dy;});

		// exit old elements
		this.vis.data([this.data]).selectAll("rect").data(this.treemap.nodes).exit().remove();
		
		// // add tooltips
		// this.add_tooltips();

		// draw_text on the elements that have room for it
		this.clear_text();
		setTimeout(function(){ self.draw_text(); self.add_tooltips();},500);
	},

	add_tooltips: function(){
		// make a selection of all cells in the treemap
		var cell_selection = $('.' + this.div_string + '_cell');
		
		// remove existing tooltips so we don confuse the labels
		cell_selection.each(function(){
			$(this).tooltip('destroy');
		});

		// add new tooltips if there is more than just the base cell in
		// in the treemap (i.e. it is a non-empty dataset)
		if (cell_selection.length > 1){
			cell_selection.each(function(){
				$(this).tooltip({
					placement: 'top',
					container: 'body',
					trigger: 'hover focus',
					title: $(this).attr('_id') + ' : ' + Math.round($(this).attr('count'))
				});
			});
		}
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
			.style("pointer-events","none")
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
			.style("pointer-events","none")
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
Barista.Views.GridView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "GridView",

	initialize: function(){
		var self = this;
		// default search value
		this.search_val = "";
		this.search_type = "single";

		// set up grid options
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "col_lg_12";
		this.legend = (this.options.legend !== undefined) ? this.options.legend : undefined;
		this.no_download = (this.options.no_download !== undefined) ? this.options.no_download : undefined;
		this.no_legend = (this.options.no_legend !== undefined) ? this.options.no_legend : undefined;

		

		// set up a default collection and column definition for the grid to operate on
		this.collection = (this.options.collection !== undefined) ? this.options.collection : new Barista.Collections.PertCollection();
		this.columns = (this.options.columns !== undefined) ? this.options.columns : [{name: "pert_iname", label: "Reagent Name", cell: "string", editable: false},
																						{name: "pert_type_label", label: "Pert Type", cell: Barista.HTMLCell, editable: false},
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
			},
			render: function () {
				// replicate Backgrid.Row's native render method
				this.$el.empty();
				var fragment = document.createDocumentFragment();
				for (var i = 0; i < this.cells.length; i++) {
					fragment.appendChild(this.cells[i].render().el);
				}
				this.el.appendChild(fragment);
				this.delegateEvents();

				// if the row's model is active, highlight it
				if (this.model.get('active_row')){
					this.$el.addClass("cmap-active-grid-row");
				}

				return this;
			}
		});

		// build the grid
		this.grid = new Backgrid.Grid({
			row: ClickableRow,
			columns: this.columns,
			collection: this.collection
		});
		$("#" + this.div_string).append(this.grid.render().$el);

		// add a button to scroll to the top of the grid once it is scroll down
		this.add_scroll_to_top_button();

		//bind the table to a function to check for scroll boundaries
		$("#" + this.div_string,this.el).scroll(function(){self.checkscroll();});

		// bind the download text to a function to download the data in the table
		$("#" + this.div_string + "_download",this.el).click(function(){self.download_table();});
	},

	checkscroll: _.debounce(function(){
		if ($("#" + this.div_string).scrollTop() > 30) {
			this.show_scroll_to_top_button();
		}else{
			this.hide_scroll_to_top_button();
		}

		var triggerPoint = 100;
		var pos = $("#" + this.div_string).scrollTop() + $("#" + this.div_string).height() + triggerPoint;
		if (!this.collection.isLoading && pos > $("#" + this.div_string)[0].scrollHeight){
			this.collection.skip += 30;
			this.update_collection();
		}
	},100),

	// ### add_scroll_to_top_button
	// adds a UI control to scroll the top of the grid
	add_scroll_to_top_button: function(){
		var self = this;
		this.scroll_to_top_button_id = this.div_string + 'scroll_button';
		this.$el.append('<button id="' + this.scroll_to_top_button_id + '" class="cmap_grid_to_top_button">Scroll to Top</button>');
		$("#" + this.scroll_to_top_button_id).click(function(){self.scroll_to_top();});
		this.hide_scroll_to_top_button();
	},

	// ### scroll_to_top
	// scrolls the grid to the top of its container
	// argurments:

	// 1.  {number}  **duration**  the duration of the scroll animation in ms, defaults to *500*
	scroll_to_top: function(duration){
		duration = (duration !== undefined) ? duration : 500;
		$("#" + this.div_string).animate({scrollTop:0},duration);
		this.hide_scroll_to_top_button();
	},

	// ### show_scroll_to_top_button
	// shows the scroll to top button
	// argurments:

	// 1.  {number}  **duration**  the duration of the scroll animation in ms, defaults to *500*
	show_scroll_to_top_button: function(duration){
		duration = (duration !== undefined) ? duration : 500;
		$("#" + this.scroll_to_top_button_id).clearQueue();
		$("#" + this.scroll_to_top_button_id).animate({opacity:1},duration);
	},

	// ### hide_scroll_to_top_button
	// hides the scroll to top button
	// argurments:

	// 1.  {number}  **duration**  the duration of the scroll animation in ms, defaults to *500*
	hide_scroll_to_top_button: function(duration){
		var self= this;
		duration = (duration !== undefined) ? duration : 500;
		$("#" + this.scroll_to_top_button_id).clearQueue();
		$("#" + this.scroll_to_top_button_id).animate({opacity:0},duration);
	},

	replace_collection: function(search_val,search_type,limit){
		var getData_promise;
		var self = this;
		this.search_val = (search_val !== undefined) ? search_val : this.search_val;
		this.search_type = (search_type !== undefined) ? search_type : this.search_type;
		this.limit = (limit !== undefined) ? limit : 30;
		$("#" + this.div_string).show();
		$("#" + this.div_string).animate({opacity:1},500);
		this.collection.reset();
		this.collection.skip = 0;
		self.collection.maxCount = Infinity;
		getData_promise =  this.collection.getData(this.search_val,this.search_type,this.limit);
		this.listenToOnce(this.collection,"add", function(){
			this.trigger("grid:ReplaceCollection");
			this.trigger("grid:Add");
			this.resize_div();
		});
		return getData_promise;
	},

	update_collection: function(search_val,search_type,limit){
		var getData_promise;
		if (this.collection.models.length < this.collection.maxCount){
			var self = this;
			this.search_val = (search_val !== undefined) ? search_val : this.search_val;
			this.search_type = (search_type !== undefined) ? search_type : this.search_type;
			this.limit = (limit !== undefined) ? limit : 30;
			$("#" + this.div_string).show();
			$("#" + this.div_string).animate({opacity:1},500);
			getData_promise = this.collection.getData(this.search_val,this.search_type,this.limit);
			this.resize_div();
			this.listenToOnce(this.collection,"add", function(){
				this.trigger("grid:UpdateCollection");
				this.trigger("grid:Add");
			});
			return getData_promise;
		}
	},

	clear_collection: function(){
		var self = this;
		this.collection.skip = 0;
		$("#" + this.div_string).animate({opacity:0},500);
		window.setTimeout(function(){
			self.collection.reset();
			self.collection.maxCount = Infinity;
			$("#" + this.div_string).hide();
		},500);
	},

	resize_div: function(){
		var self = this;
		var container_height =  $("#" + this.div_string).height();
		setTimeout(function(){
			var data_height = self.collection.length * 30 + 40;
			var target_height = (data_height > 300) ? 300 : data_height;

			$("#" + self.div_string).stop();
			$("#" + self.div_string).animate({height:target_height},500);
		},500);
	},

	compile_template: function(){
		this.div_string = 'backgrid_target' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.CMapBaseGrid({div_string: this.div_string,
													   span_class: this.span_class,
													   legend: this.legend,
													   no_download: this.no_download,
													   no_legend: this.no_legend,
													}));
	},

	download_table: function(){
		var self = this;
		// indicate we are downloading something
		$("#" + this.div_string + "_download",this.el).html('<font color="#0072B2"><i class="icon-refresh icon-spin"></i> exporting</font>');

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
						line_data.push(Barista.CMapPertTypeAlias(r["pert_type"]).acronym);
					}
					if ($(String(r[n])).length === 1){
						line_data.push($(r[n]).text());
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
			saveAs(blob, "CMapTable" + timestamp + ".txt");
			$("#" + self.div_string + "_download",self.el).html('<font color="#0072B2"><i class="icon-share"></i> export table</font>');
		});
	},

	// ### hide
	// hides the view by dimming the opacity and hiding it in the DOM

	// arguments

	// 1.  {number}  **duration**  the time in ms for the hide animation. defualts to *500*

	//		pert_detail_view.hide(duration);
	hide: function(duration){
		var self = this;
		this.$el.animate({opacity:0},duration);
		setTimeout(function(){self.$el.hide();},duration);
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
Barista.HTMLFormatter = Backgrid.HTMLFormatter = function () {};
Barista.HTMLFormatter.prototype = new Backgrid.CellFormatter();
_.extend(Barista.HTMLFormatter.prototype, {
  fromRaw: function (rawValue) {
    if (_.isUndefined(rawValue) || _.isNull(rawValue)) return '';
    return rawValue;
  }
});

// ## HTMLCell
// An extension of Backgrid.Cell to render raw html content into the target element of the cell
Barista.HTMLCell = Backgrid.HTMLCell = Backgrid.Cell.extend({
  className: "html-cell",
  formatter: new Barista.HTMLFormatter(),
  render: function () {
    this.$el.html(this.formatter.fromRaw(this.model.get(this.column.get("name"))));
    return this;
  }
});
// # **HeatmapView**

// A Backbone.View that displays a simple heatmap.  The view is normally paired with 
// a *HeatmapModel*, but works with any model that provides *data*, *rid*, *cid*, and
// *title* attributes.

// optional arguments:

// 1.  {string}  **template**  The handlebars template to use. Defaults to *BaristaTemplates.d3_target*
// 2.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 3.  {string}  **low\_color**  the hex color code to use as lowest value color in the heatmap, defaults to *#0000ff*
// 4.  {string}  **high\_color**  the hex color code to use as highest value color in the heatmap, defaults to *#ff0000*
// 5.  {d3.scale}  **color_scale**  custom color scale to use in the heatmap.  If supplied, low\_color and high\_color are ignored, defaults to *undefined*
// 6.  {d3.scale}  **annot_color_scale**  custom color scale to use in the heatmap annotations. defaults to *undefined* and causes the annotations to be rendered with a standard color scale
// 7.  {Number}  **plot_height**  the height of the heatmap to generate in pixels, defaults to *300*
// 8.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

// example usage:

//		heatmap_view = new HeatmapView({el: $("target_selector"),
//												model: new HeatmapModel(),
//												template: BaristaTemplates.d3_target,
//												bg_color: "#ffffff",
//												low_color: "#0000ff",
//												high_color: "#ff0000",
//												color_scale: undefined,
//												annot_color_scale: undefined,
//												plot_height: 300,
//												span_class: "span12"
//												});

Barista.Views.HeatmapView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "HeatMapView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.HeatmapModel(),

	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.low_color = (this.options.low_color !== undefined) ? this.options.low_color : "#0000ff";
		this.high_color = (this.options.high_color !== undefined) ? this.options.high_color : "#ff0000";
		this.color_scale = (this.options.color_scale !== undefined) ? this.options.color_scale : undefined;
		this.annot_color_scale = (this.options.annot_color_scale !== undefined) ? this.options.annot_color_scale : undefined;

		// set up the defualt plot height
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : 300;
		// set up the default template
		this.template = (this.options.template !== undefined) ? this.options.template : BaristaTemplates.d3_target;

		// set up the default span class
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "#span12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view and draw it for the first time
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the view for the first time
		this.redraw();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.redraw();} );
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		var self = this;
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(this.template({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### redraw
	// completely redraw the view. Updates both static and dynamic content in the view.
	redraw: function(){
		this.init_panel();
		this.render();
	},

	// ### init_panel
	// initialize the static parts of the view's panel
	init_panel: function(){
		// stuff this into a variable for later use
		var self = this;

		// check to see if the container is visible, if not, make it visible, but transparent so we draw it with
		// the proper dimensions
		if (this.$el.is(":hidden")){
			this.$el.animate({opacity:0},1);
			this.$el.show();
		}

		// set up the margin
		this.margin = 50;

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().attr("width",this.width);
		this.vis.transition().attr("height",this.height);

		// draw the background of the panel
		this.bg_layer.selectAll('.bg_panel').data([]).exit().remove();
		this.bg_layer.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// determine the height and width of cells in the heatmap
		if (this.height < this.width){
			this.cell_height = (this.height - this.margin*2) / this.model.get('data').length;
			this.cell_width = (this.height - this.margin*2) / this.model.get('data')[0].length;
		}else{
			this.cell_height = (this.width - this.margin*2) / this.model.get('data').length;
			this.cell_width = (this.width - this.margin*2) / this.model.get('data')[0].length;
		}

		// determine the plot offset to center the plot in its container
		this.x_center = this.width / 2;
		this.x_offset = this.x_center - (this.cell_width * this.model.get('data')[0].length / 2);

		// map the data into a flattened array of objects with array indices and value as attributes
		this.unraveled_data = this.unravel_data(this.model.get('data'));

		// set up the color scale
		if (this.color_scale === undefined){
			var values = _.pluck(this.unraveled_data,'value');
			data_min = _.min(values);
			data_max = _.max(values);
			this.color = d3.scale.linear().domain([data_min,data_max]).range([this.low_color, this.high_color]);
		}else{
			this.color = this.color_scale;
		}

		// set up the annotation color scale
		if (this.annot_color_scale === undefined){
			var values = _.uniq(this.model.get('annots'))
			this.annot_color = d3.scale.category10().domain(values)
		}else{
			this.annot_color = this.annot_color_scale;
		}

		// draw the heatmap cells
		this.fg_layer.selectAll('.heatmap_cell').data([]).exit().remove();
		this.fg_layer.selectAll('.heatmap_cell').data(this.unraveled_data).enter().append('rect')
			.attr('class','heatmap_cell')
			.attr('x',function(d){return self.cell_width*d.i + self.x_offset;})
			.attr('y',function(d){return self.cell_height*d.j + self.margin;})
			.attr('width',this.cell_width)
			.attr('height',this.cell_height)
			.attr('value',function(d){return d.value;})
			.attr('stroke','white')
			.attr('stroke-width',1)
			.attr('fill',function(d){return self.color(d.value);});

		// draw the row labels
		this.fg_layer.selectAll('.heatmap_rid').data([]).exit().remove();
		this.fg_layer.selectAll('.heatmap_rid').data(this.model.get('rid')).enter().append('text')
			.attr('class','heatmap_rid')
			.attr('x',this.x_offset)
			.attr('y',function(d,i){return self.cell_height*i + self.cell_height/2 + self.margin;})
			.attr('text-anchor','end')
			.attr('dx','-.2em')
			.text(function(d){return d;});

		// draw the column labels
		this.fg_layer.selectAll('.heatmap_cid').data([]).exit().remove();
		this.fg_layer.selectAll('.heatmap_cid').data(this.model.get('cid')).enter().append('text')
			.attr('class','heatmap_cid')
			.attr('y',this.margin)
			.attr('x',function(d,i){return self.cell_width*i + self.cell_width/2 + self.x_offset;})
			.attr('text-anchor','middle')
			.attr('dy','-.2em')
			.text(function(d){return d;});

		// draw the annotation categories if they are present
		if (this.model.get('annots') !== undefined){
			this.fg_layer.selectAll('.heatmap_annots').data([]).exit().remove();
			this.fg_layer.selectAll('.heatmap_annots').data(this.model.get('annots')).enter().append('rect')
				.attr('class','heatmap_annots')
				.attr('x',function(d,i){return self.cell_width*i + self.x_offset;})
				.attr('y',function(d){return self.cell_height*(self.model.get('data').length) + self.cell_height/4 + self.margin;})
				.attr('width',this.cell_width)
				.attr('height',this.cell_height/4)
				.attr('value',function(d){return d;})
				.attr('stroke','white')
				.attr('stroke-width',1)
				.attr('fill',function(d){return self.annot_color(d);});

			if (this.model.get('annots_label') !== undefined){
				// draw the annot label if it is there
				this.fg_layer.selectAll('.heatmap_annots_label').data([]).exit().remove();
				this.fg_layer.selectAll('.heatmap_annots_label').data([this.model.get('annots_label')]).append('text')
					.attr('class','heatmap_annots_label')
					.attr('x',this.x_offset)
					.attr('y',function(d){return self.cell_height*(self.model.get('data').length) + self.cell_height/2 + self.margin;})
					.attr('opacity',1)
					.attr('text-anchor','end')
					.attr('dx','-.2em')
					.text(function(d){return d;});
			}
		}

		// set up the y scale
		this.set_scale();

		// build Axis
		this.build_axis();

		// add an axis
		this.fg_layer.append("g")
			.attr("class", "axis y-axis")
			.attr("transform", "translate(" + (this.width - this.margin/2) + ",0)")
			.call(this.yAxis);

		// style the axis
		this.style_axes();

		// add the cells for the look up table
		this.add_lookup_table();

		// add a png export overlay
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export no_png_export")
			.attr("x",this.x_offset)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.attr('text-anchor','end')
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
			.on("click",function(){self.save_png();});
	},

	// ### add look up table
	// adds a simple color lookup table based on the heatmap's color_scale
	add_lookup_table: function(){
		var self, data, scale_range, scale_domain, scale_unit, domain_unit;
		self = this;
		data = d3.range(50);
		scale_range = this.y_scale.range();
		scale_domain = this.y_scale.domain();
		scale_unit = (scale_range[1] - scale_range[0]) / data.length;
		domain_unit = (scale_domain[0] - scale_domain[1]) / data.length;

		this.fg_layer.selectAll('.lut_cell').data(data).enter().append('rect')
			.attr('class','lut_cell')
			.attr('x',self.width - self.margin/2 - 10)
			.attr('y',function(d,i){return i*scale_unit + self.margin;})
			.attr('width',10)
			.attr('height',scale_unit)
			.attr('fill',function(d,i){return self.color(scale_domain[0] - i*domain_unit);});

	},

	// ### set_scale
	// utility function used to get the y scale used in the plot
	set_scale: function(){
			var domain, range_min, range_max, range;
			// get the current data domain from this.color
			domain = this.color.domain();

			// calculate the range for the scale
			range_min = this.margin;
			range_max = this.height - this.margin;
			range = [range_min,range_max];

			// set the y_scale
			this.y_scale=d3.scale.linear().domain([domain[domain.length-1],domain[0]]).range(range);
	},

	// ### build_axis
	// utility function used to build y axis for the look up table
	build_axis: function(){
		this.yAxis = d3.svg.axis()
			.scale(this.y_scale)
			.orient("right");
	},

	// ### style axes
	// utility function to apply custom styles to axis components
	style_axes: function(){
		this.vis.selectAll('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");
	},

	// ### render
	// update the dynamic potions of the view
	render: function(){
		var self = this;
		// determine the height and width of cells in the heatmap
		if (this.height < this.width){
			this.cell_height = (this.height - this.margin*2) / this.model.get('data').length;
			this.cell_width = (this.height - this.margin*2) / this.model.get('data')[0].length;
		}else{
			this.cell_height = (this.width - this.margin*2) / this.model.get('data').length;
			this.cell_width = (this.width - this.margin*2) / this.model.get('data')[0].length;
		}

		// determine the plot offset to center the plot in its container
		this.x_center = this.width / 2;
		this.x_offset = this.x_center - (this.cell_width * this.model.get('data')[0].length / 2);

		// map the data into a flattened array of objects with array indices and value as attributes
		this.unraveled_data = this.unravel_data(this.model.get('data'));

		// set up the color scale
		if (this.color_scale === undefined){
			var values = _.pluck(this.unraveled_data,'value');
			data_min = _.min(values);
			data_max = _.max(values);
			this.color = d3.scale.linear().domain([data_min,data_max]).range([this.low_color, this.high_color]);
		}else{
			this.color = this.color_scale;
		}

		// set up the annotation color scale
		if (this.annot_color_scale === undefined){
			var values = _.uniq(this.model.get('annots'))
			this.annot_color = d3.scale.category10().domain(values)
		}else{
			this.annot_color = this.annot_color_scale;
		}

		// draw the heatmap cells
		var cell_selection = this.fg_layer.selectAll('.heatmap_cell').data(this.unraveled_data);
		cell_selection.enter().append('rect')
			.attr('class','heatmap_cell')
			.attr('x',this.x_center)
			.attr('y',(this.height - this.margin)/2)
			.attr('width',0)
			.attr('height',0)
			.attr('opacity',0)
			.attr('value',function(d){return d.value;})
			.attr('stroke','white')
			.attr('stroke-width',1)
			.attr('fill',function(d){return self.color(d.value);});

		cell_selection.transition().duration(500)
			.attr('x',function(d){return self.cell_width*d.i + self.x_offset;})
			.attr('y',function(d){return self.cell_height*d.j + self.margin;})
			.attr('width',this.cell_width)
			.attr('height',this.cell_height)
			.attr('opacity',1)
			.attr('fill',function(d){return self.color(d.value);});

		cell_selection.exit().remove();

		// draw the row labels
		rid_selection = this.fg_layer.selectAll('.heatmap_rid').data(this.model.get('rid'));
		rid_selection.enter().append('text')
			.attr('class','heatmap_rid')
			.attr('x',this.x_offset)
			.attr('y',(this.height - this.margin)/2)
			.attr('opacity',0)
			.attr('text-anchor','end')
			.attr('dx','-.2em')
			.text(function(d){return d;});

		rid_selection.transition().duration(500)
			.attr('opacity',1)
			.attr('y',function(d,i){return self.cell_height*i + self.cell_height/2 + self.margin;})
			.text(function(d){return d;});

		rid_selection.exit().remove();

		// draw the column labels
		cid_selection = this.fg_layer.selectAll('.heatmap_cid').data(this.model.get('cid'));
		cid_selection.enter().append('text')
			.attr('class','heatmap_cid')
			.attr('y',this.margin)
			.attr('x',this.x_center)
			.attr('opacity',0)
			.attr('text-anchor','middle')
			.attr('dy','-.2em')
			.text(function(d){return d;});

		cid_selection.transition().duration(500)
			.attr('opacity',1)
			.attr('x',function(d,i){return self.cell_width*i + self.cell_width/2 + self.x_offset;})
			.text(function(d){return d;});

		cid_selection.exit().remove();

		// draw the annotation categories if they are present
		if (this.model.get('annots') !== undefined){
			var label_selection = this.fg_layer.selectAll('.heatmap_annots').data(this.model.get('annots'));
			label_selection.enter().append('rect')
				.attr('class','heatmap_annots')
				.attr('x',this.x_center)
				.attr('y',(this.height - this.margin)/2)
				.attr('width',0)
				.attr('height',0)
				.attr('opacity',0)
				.attr('value',function(d){return d;})
				.attr('stroke','white')
				.attr('stroke-width',1)
				.attr('fill',function(d){return self.annot_color(d);});

			label_selection.transition().duration(500)
				.attr('x',function(d,i){return self.cell_width*i + self.x_offset;})
				.attr('y',function(d){return self.cell_height*(self.model.get('data').length) + self.cell_height/4 + self.margin;})
				.attr('width',this.cell_width)
				.attr('height',this.cell_height/4)
				.attr('opacity',1)
				.attr('fill',function(d){return self.annot_color(d);});

			label_selection.exit().remove();

			if (this.model.get('annots_label') !== undefined){
				// draw the annot label if it is there
				label_text_selection = this.fg_layer.selectAll('.heatmap_annots_label').data([this.model.get('annots_label')]);
				label_text_selection.enter().append('text')
					.attr('class','heatmap_annots_label')
					.attr('x',this.x_offset)
					.attr('y',(this.height - this.margin)/2)
					.attr('opacity',0)
					.attr('text-anchor','end')
					.attr('dx','-.2em')
					.text(function(d){return d;});

				label_text_selection.transition().duration(500)
					.attr('opacity',1)
					.attr('y',function(d){return self.cell_height*(self.model.get('data').length) + self.cell_height/2 + self.margin;})
					.text(function(d){return d;});

				label_text_selection.exit().remove();
			}
		}
	},

	// ### unravel_data
	// internal utility function to express 2D array data as a flat data array of objects with array
	// coordinates and data value as attributes.
	unravel_data: function(data){
		unraveled_data = [];
		data.forEach(function(i_e,i){
			i_e.forEach(function(j_e,j){
				unraveled_data.push({i:j, j:i, value:j_e});
			});
		});
		return unraveled_data;
	},

	// ### savePng
	// save the current state of the view into a png image
	save_png: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.width;
		var height = this.height;
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
		var filename = "cmapHeatmapView" + new Date().getTime() + ".png";
		if (canvas.toBlob){canvas.toBlob(function(blob){saveAs(blob,filename);});}
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
	}
});
// # **LDMapView**

// A Backbone.View that displays a simple LDMap.  The view is normally paired with 
// a *HeatMapModel*, but works with any model that provides *data*,*cid*, and
// *title* attributes.

// optional arguments:

// 1.  {string}  **template**  The handlebars template to use. Defaults to *BaristaTemplates.d3_target*
// 2.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 3.  {string}  **low\_color**  the hex color code to use as lowest value color in the LDMap, defaults to *#0000ff*
// 4.  {string}  **high\_color**  the hex color code to use as highest value color in the LDMap, defaults to *#ff0000*
// 5.  {d3.scale}  **color_scale**  custom color scale to use in the LDMap.  If supplied, low\_color and high\_color are ignored, defaults to *undefined*
// 6.  {Number}  **plot_height**  the height of the LDMap to generate in pixels, defaults to *300*
// 7.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

// example usage:

//		LDMap_view = new LDMapView({el: $("target_selector"),
//												model: new HeatmapModel(),
//												template: BaristaTemplates.d3_target,
//												bg_color: "#ffffff",
//												low_color: "#0000ff",
//												high_color: "#ff0000",
//												color_scale: undefined,
//												plot_height: 300,
//												span_class: "span12"
//												});

Barista.Views.LDMapView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "LDMapView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.HeatmapModel(),

	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.low_color = (this.options.low_color !== undefined) ? this.options.low_color : "#0000ff";
		this.high_color = (this.options.high_color !== undefined) ? this.options.high_color : "#ff0000";
		this.color_scale = (this.options.color_scale !== undefined) ? this.options.color_scale : undefined;

		// set up the defualt plot height
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : 300;
		// set up the default template
		this.template = (this.options.template !== undefined) ? this.options.template : BaristaTemplates.d3_target;

		// set up the default span class
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "#span12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view and draw it for the first time
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the view for the first time
		this.redraw();

		// bind window resize events to redraw
		var self = this;
		$(window).resize(function() {self.redraw();} );
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		var self = this;
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(this.template({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### redraw
	// completely redraw the view. Updates both static and dynamic content in the view.
	redraw: function(){
		this.init_panel();
		this.render();
	},

	// ### init_panel
	// initialize the static parts of the view's panel
	init_panel: function(){
		// stuff this into a variable for later use
		var self = this;

		// check to see if the container is visible, if not, make it visible, but transparent so we draw it with
		// the proper dimensions
		if (this.$el.is(":hidden")){
			this.$el.animate({opacity:0},1);
			this.$el.show();
		}

		// set up the margin
		this.margin = 50;

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.ld_cell_layer').data([]).exit().remove();
		this.ld_cell_layer = this.vis.append("g").attr("class", "ld_cell_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().attr("width",this.width);
		this.vis.transition().attr("height",this.height);

		// draw the background of the panel
		this.bg_layer.selectAll('.bg_panel').data([]).exit().remove();
		this.bg_layer.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// determine the height and width of cells in the heatmap
		if (this.height < this.width){
			this.cell_height = (this.height - this.margin) / this.model.get('data').length;
			this.cell_width = (this.height - this.margin) / this.model.get('data')[0].length;
		}else{
			this.cell_height = (this.width - this.margin) / this.model.get('data').length;
			this.cell_width = (this.width - this.margin) / this.model.get('data')[0].length;
		}

		// determine the plot offset to center the plot in its container
		this.x_center = this.width / 2;
		this.x_offset = this.x_center - (this.cell_width * this.model.get('data')[0].length / 2);

		// map the data into a flattened array of objects with array indices and value as attributes
		this.unraveled_data = this.unravel_data(this.model.get('data'));

		// set up the color scale
		if (this.color_scale === undefined){
			var values = _.pluck(this.unraveled_data,'value');
			data_min = _.min(values);
			data_max = _.max(values);
			this.color = d3.scale.linear().domain([data_min,data_max]).range([this.low_color, this.high_color]);
		}else{
			this.color = this.color_scale;
		}

		// draw the LDMap cells
		this.ld_cell_layer.selectAll('.heatmap_cell').data([]).exit().remove();
		this.ld_cell_layer.selectAll('.heatmap_cell').data(this.unraveled_data).enter().append('rect')
			.attr('class','heatmap_cell')
			.attr('x',function(d){return self.cell_width*d.i + self.x_offset;})
			.attr('y',function(d){return self.cell_height*d.j + self.margin;})
			.attr('transform',function(d){
				var x = self.cell_width + self.x_offset;
				var y = self.cell_height + self.margin;
				return 'rotate(45,' + x + ',' + y + ')';
			})
			.attr('width',this.cell_width)
			.attr('height',this.cell_height)
			.attr('value',function(d){return d.value;})
			.attr('stroke','white')
			.attr('stroke-width',1)
			.attr('fill',function(d){return self.color(d.value);});

		// draw the row labels
		this.fg_layer.selectAll('.heatmap_rid').data([]).exit().remove();
		this.fg_layer.selectAll('.heatmap_rid').data(this.model.get('rid')).enter().append('text')
			.attr('class','heatmap_rid')
			.attr('x',this.x_offset)
			.attr('y',function(d,i){return self.diamond_height*i + self.diamond_height/2 + self.margin;})
			.attr('text-anchor','end')
			.attr('dx','-.2em')
			.text(function(d){return d;});

		// add a png export overlay
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([]).exit().remove();
		this.fg_layer.selectAll("." + this.div_string + "png_export").data([1]).enter().append("text")
			.attr("class", this.div_string + "png_export no_png_export")
			.attr("x",this.x_offset)
			.attr("y",this.height - 10)
			.attr("opacity",0.25)
			.attr('text-anchor','end')
			.style("cursor","pointer")
			.text("png")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1).attr("fill","#56B4E9");})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25).attr("fill","#000000");})
			.on("click",function(){self.save_png();});
	},

	// ### render
	// update the dynamic potions of the view
	render: function(){
		var self = this;
		// determine the height and width of cells in the heatmap
		var usable_height = this.height - this.margin;
		this.diamond_height = usable_height / this.model.get('data').length;
		this.cell_height = this.cell_width = Math.sqrt(Math.pow(this.diamond_height,2) / 2);

		// determine the plot offset to center the plot in its container
		this.x_center = this.width / 2;
		this.x_offset = this.x_center - (this.cell_width * this.model.get('data')[0].length / 2);

		// map the data into a flattened array of objects with array indices and value as attributes
		this.unraveled_data = this.unravel_data(this.model.get('data'));

		// set up the color scale
		if (this.color_scale === undefined){
			var values = _.pluck(this.unraveled_data,'value');
			data_min = _.min(values);
			data_max = _.max(values);
			this.color = d3.scale.linear().domain([data_min,data_max]).range([this.low_color, this.high_color]);
		}else{
			this.color = this.color_scale;
		}

		// draw the heatmap cells
		var cell_selection = this.ld_cell_layer.selectAll('.heatmap_cell').data(this.unraveled_data);
		cell_selection.enter().append('rect')
			.attr('class','heatmap_cell')
			.attr('x',this.x_center)
			.attr('y',(this.height - this.margin)/2)
			.attr('width',0)
			.attr('height',0)
			.attr('opacity',0)
			.attr('value',function(d){return d.value;})
			.attr('stroke','white')
			.attr('stroke-width',1)
			.attr('fill',function(d){return self.color(d.value);});

		cell_selection.transition().duration(500)
			.attr('x',function(d){return self.cell_width*d.i + self.x_offset;})
			.attr('y',function(d){return self.cell_height*d.j + self.margin;})
			.attr('transform',function(d){
				var x = self.cell_width + self.x_offset;
				var y = self.cell_height + self.margin;
				return 'rotate(45,' + x + ',' + y + ')';
			})
			.attr('width',this.cell_width)
			.attr('height',this.cell_height)
			.attr('opacity',1)
			.attr('fill',function(d){return self.color(d.value);});

		cell_selection.exit().remove();

		// draw the row labels
		rid_selection = this.fg_layer.selectAll('.heatmap_rid').data(this.model.get('rid'));
		rid_selection.enter().append('text')
			.attr('class','heatmap_rid')
			.attr('x',this.x_offset)
			.attr('y',(this.height - this.margin)/2)
			.attr('opacity',0)
			.attr('text-anchor','end')
			.attr('dy','-.5em')
			.text(function(d){return d;});

		rid_selection.transition().duration(500)
			.attr('opacity',1)
			.attr('x',this.cell_width + this.x_offset)
			.attr('y',function(d,i){return self.diamond_height*i + self.diamond_height/2 + self.margin;})
			.text(function(d){return d;});

		rid_selection.exit().remove();
	},

	// ### unravel_data
	// internal utility function to express 2D array data as a flat data array of objects with array
	// coordinates and data value as attributes.
	unravel_data: function(data){
		unraveled_data = [];
		data.forEach(function(i_e,i){
			i_e.forEach(function(j_e,j){
				if (i < j){
					unraveled_data.push({i:j, j:i, value:j_e});
				}
			});
		});
		return unraveled_data;
	},

	// ### savePng
	// save the current state of the view into a png image
	save_png: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.width;
		var height = this.height;
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
		var filename = "cmapHeatmapView" + new Date().getTime() + ".png";
		if (canvas.toBlob){canvas.toBlob(function(blob){saveAs(blob,filename);});}
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
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
// 4.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"col-lg-4"*
// 5.  {string}  **static\_text**  the static text header to use in the view, defaults to *"Reagents"*
// 6.  {array}  **categories**  an array of objects to use as categories to display, defaults to *[]*

//		pert_count_view = new PertCountView({bg_color:"#ffffff", 
//									well_color: "#bdbdbd",
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									static_text: "Reagents",
//									categories: []});


Barista.Views.PertCountView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "PertCountView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.PertCountModel(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.well_color = (this.options.well_color !== undefined) ? this.options.well_color : "#bdbdbd";
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "col-lg-4";

		// set up static text, default if not specified
		this.static_text = (this.options.static_text !== undefined) ? this.options.static_text : "Reagents";

		// set up the default plot height
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : 120;

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
		this.width = $("#" + this.div_string).width();
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
	compile_template: function(){
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### redraw
	// completely redraw the view.
	redraw: function(){
		this.init_panel();
		this.render();
	},

	// ### init_panel
	// initialize the static parts of the view's panel
	init_panel: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
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
							.text(pert_count);

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
			.text(function(d){return Barista.CMapPertTypeAlias(d._id).name;});

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

	render: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
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
		var category_counts = _.pluck(this.pert_types,'count');
		var category_sum = _.reduce(category_counts, function(memo, num){ return memo + num; }, 0);
		this.pert_types.push({_id:'other', count:pert_count - category_sum});
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
	},

	// ### savePng
	// save the current state of the view into a png image
	save_png: function(){
		// build a canvas element to store the image temporarily while we save it
		var width = this.width;
		var height = this.height;
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
		var filename = "BaristaPertCountView" + new Date().getTime() + ".png";
		if (canvas.toBlob){
			canvas.toBlob(function(blob){
				saveAs(blob,filename);
				});
		}
		$('#tmpCanvas').remove();

		// make the png label on the image visible again
		png_selection.attr("opacity",png_opacity);
	}
});
// # **PertDetailView**

// A Backbone.View that shows the name and short description of a single purturbagen.  This view is
// frequently paired with a PertDetailModel.

//		pert_detail_view = new PertDetailView({el: $("target_selector")});

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

//		pert_detail_view = new PertDetailView({el: $("target_selector"),
//												model: PertDetailModel,
//												bg_color: "#ffffff",
//												span_class: "span4"});
Barista.Views.PertDetailView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "PertDetailView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.PertDetailModel(),
	
	// ### initialize
	// overide the defualt Backbone.View initialize method to bind the view to model changes, bind
	// window resize events to view re-draws, compile the template, and render the view
	
	//		pert_detail_view.initialize();
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";

		// set up the span class
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "#col-lg-12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).width();
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
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class}));
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
		this.width = $("#" + this.div_string).width();
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
							.attr("height",40)
							.attr("width",40)
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
		setTimeout(function(){self.$el.hide();},duration);
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
Barista.Views.PertSearchBar = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "PertSearchBar",

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
			var change_callback = function () {
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
			};

			$("#search",self.el).bind('input propertychange change', _.throttle(change_callback,500));

			// bind a search:DidType event to the typeahead events coming out of typeahead.js
			$(".typeahead",self.el).bind('typeahead:selected typeahead:autocompleted', function (obj,datum) {
				var val = datum.value;
				var type = (datum.type == "Cellular Context") ? "cell" : "single";
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
		params = {q: '{"pert_type":{"$in":["trt_cp","trt_sh"]}}',
					f:'{"pert_iname":1}',
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
    renders the view
    
    @method render
    **/
	render: function(){
		var self = this;
		// load the template into the view's el tag
		this.$el.append(BaristaTemplates.CMapPertSearchBar());

		$('#search',this.$el).typeahead([{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'Cellular Contexts',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/cellinfo?',
					  'q={"lincs_status":{"$in":["profiled","core"]},"cell_id":{"$regex":"%QUERY", "$options":"i"}}',
					  '&f={"cell_id":1,"cell_type":1}',
					  '&l=4',
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
							type: 'Cellular Context',
							color: '#CC79A7',
						});
						datum_list.push(datum);
					});

					// return the processed list of daums for the autocomplete
					return datum_list;
				}
			}
			},
			{
			// only return 4 items at a time in the autocomplete dropdown
			limit: 2,

			// provide a name for the default typeahead data source
			name: 'Reagents',

			// the template to render for all results
			template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

			// use twitter's hogan.js to compile the template for the typeahead results
			engine: Hogan,

			remote: {
				// set the remote data source to use pertinfo with custom query params
				url: ['http://api.lincscloud.org/a2/pertinfo?',
					  'q={"pert_iname":{"$regex":"%QUERY", "$options":"i"}, "pert_type":{"$regex":"^(?!.*c[a-z]s$).*$"}}',
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
						if (self.cell_lines.indexOf(item) != -1){
							_.extend(datum,{
								type: 'Cellular Context',
								color: '#CC79A7',
							});
							datum_list.push(datum);
							return datum_list;
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
					})

					// return the processed list of daums for the autocomplete
					return datum_list;
				}

			}
		}]);
	}
});
// # **ScatterPlotView**
// A Backbone.View that displays a scatter plot.  the view's model is assumed to have the same defaults
// as specified in **ScatterPlotModel**

// basic use:

//		scatter_plot_view = new ScatterPlotView();

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 3.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*
// 4.  {string}  **scale_by**  an attribute in the model's meta data object to scale points by, defaults to *undefined*
// 5.  {Array}  **x_range**  a two element array specifying the x plotting bounds of the plot, defaults to *[min(x_data),max(x_data)]*
// 6.  {Array}  **y_range**  a two element array specifying the y plotting bounds of the plot, defaults to *[min(y_data),max(y_data)]*
// 7.  {Bool}  **x_log**  if set to true, plots the x axis on a log scale, defaults to *false*
// 8.  {Bool}  **y_log**  if set to true, plots the y axis on a log scale, defaults to *false*
// 9. {Number} **x_min_lock** if set, locks the minimum of the x_range at the given value. Ignored if x_range is set. defaults to *undefined*
// 10. {Number} **y_min_lock** if set, locks the minimum of the y_range at the given value. Ignored if y_range is set. defaults to *undefined*
// 11. {Number} **x_max_lock** if set, locks the maximum of the x_range at the given value. Ignored if x_range is set. defaults to *undefined*
// 12. {Number} **y_max_lock** if set, locks the maximum of the y_range at the given value. Ignored if y_range is set. defaults to *undefined*
// 13. {Bool} **x_min_expand** if set, allows the minimum of the x_range to expand if data is found below it. defaults to *false*
// 14. {Bool} **y_min_expand** if set, allows the minimum of the y_range to expand if data is found below it. defaults to *false*
// 15. {Bool} **x_max_expand** if set, allows the maximum of the x_range to expand if data is found above it. defaults to *false*
// 16. {Bool} **y_max_expand** if set, allows the maximum of the y_range to expand if data is found above it. defaults to *false*
// 17.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*

//		scatter_plot_view = new ScatterPlotView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									scale_by: undefined,
//									x_range: undefined,
//									y_range: undefined,
//									x_log: false,
//									y_log: false,
//									x_min_lock: undefined,
//									y_min_lock: undefined,
//									x_max_lock: undefined,
//									y_max_lock: undefined,
//									x_min_expand: false,
//									y_min_expand: false,
//									x_max_expand: false,
//									y_max_expand: false,
//									plot_height: 120});

Barista.Views.ScatterPlotView = Barista.Views.BaristaBaseView.extend({
	// ### model
	// set up the view's default model
	model: new Barista.Models.ScatterPlotModel(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up x and y range and determine if are going to draw the axes dynamically
		this.x_range = (this.options.x_range !== undefined) ? this.options.x_range : undefined;
		this.y_range = (this.options.y_range !== undefined) ? this.options.y_range : undefined;
		this.dynamic_x_range = (this.x_range === undefined) ? true : false;
		this.dynamic_y_range = (this.y_range === undefined) ? true : false;

		// set up axis expansion and lock features
		this.x_min_lock = (this.options.x_min_lock !== undefined) ? this.options.x_min_lock : undefined;
		this.y_min_lock = (this.options.y_min_lock !== undefined) ? this.options.y_min_lock : undefined;
		this.x_max_lock = (this.options.x_max_lock !== undefined) ? this.options.x_max_lock : undefined;
		this.y_max_lock = (this.options.y_max_lock !== undefined) ? this.options.y_max_lock : undefined;

		this.x_min_expand = (this.options.x_min_expand !== undefined) ? this.options.x_min_expand : undefined;
		this.y_min_expand = (this.options.y_min_expand !== undefined) ? this.options.y_min_expand : undefined;
		this.x_max_expand = (this.options.x_max_expand !== undefined) ? this.options.x_max_expand : undefined;
		this.y_max_expand = (this.options.y_max_expand !== undefined) ? this.options.y_max_expand : undefined;

		// set up x and y log flags
		this.x_log = (this.options.x_log !== undefined) ? this.options.x_log : false;
		this.y_log = (this.options.y_log !== undefined) ? this.options.y_log : false;

		// set up the scale_by parameter
		this.scale_by = (this.options.scale_by !== undefined) ? this.options.scale_by : undefined;

		// set up the margin
		this.margin = 50;

		// set up x and y ranges
		this.set_ranges();

		// set up x and y scaling
		this.set_scales();		

		// build Axes
		this.build_axes();

		// run BaristaBaseView's base_initialize method to handle boilerplate view construction
		// and initial view rendering
		this.base_initialize();
	},

	// ### redraw
	// completely redraw the view. Updates both static and dynamic content in the view.
	render: function(){
		this.base_render();
		this.init_plot();
		this.update();
	},

	// ### init_plot
	// initialize the static parts of the view's panel
	init_plot: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up x and y ranges
		this.set_ranges();

		// set up x and y scaling
		this.set_scales();		

		// build Axes
		this.build_axes();

		// plot the axes
		this.bg_layer.selectAll('.axis').data([]).exit().remove();
		this.bg_layer.append("g")
			.attr("class", "axis x-axis")
			.attr("transform", "translate(0," + (this.height - this.margin) + ")")
			.call(this.xAxis);

		this.bg_layer.append("g")
			.attr("class", "axis y-axis")
			.attr("transform", "translate(" + this.margin + ",0)")
			.call(this.yAxis);

		// style the axes
		this.vis.selectAll('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");

		// build a scaling function
		this.set_scaling_function();

		// plot the data points
		this.x_data = this.model.get('x_data');
		this.y_data = this.model.get('y_data');
		this.bg_layer.selectAll('.data_point').data([]).exit().remove();
		this.bg_layer.selectAll('.data_point').data(this.x_data).enter().append('circle')
			.attr("class","data_point")
			.attr("cx",this.x_scale(0))
			.attr("cy",this.y_scale(0))
			.attr("opacity",0.5)
			.attr("r",0)
			.attr("fill",this.fg_color);

		// plot the x axis title
		this.bg_layer.selectAll('.x_axis_label').data([]).exit().remove();
		this.bg_layer.selectAll('.x_axis_label').data([1]).enter().append('text')
			.attr("class","x_axis_label axis_label")
			.attr("x",this.width/2)
			.attr("y",this.height-10)
			.style("text-anchor","middle")
			.text(this.model.get('x_axis_title'));

		// plot the y axis label
		this.bg_layer.selectAll('.y_axis_label').data([]).exit().remove();
		this.bg_layer.selectAll('.y_axis_label').data([1]).enter().append('text')
			.attr("class","y_axis_label axis_label")
			// .attr("transform", "rotate(-90)")
			.attr("y", this.margin)
			.attr("x", this.margin + 2)
			.attr("dy","1em")
			.style("text-anchor","left")
			.text(this.model.get('y_axis_title'));

		// plot the title
		this.bg_layer.selectAll('.title').data([]).exit().remove();
		this.bg_layer.selectAll('.title').data([1]).enter().append('text')
			.attr("class","title title")
			.attr("x",this.width/2)
			.attr("y",this.margin/2)
			.style("text-anchor","middle")
			.text(this.model.get('title'));
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
	var self = this;
	
	// get model data
	this.x_data = this.model.get('x_data');
	this.y_data = this.model.get('y_data');
	
	// set up x and y ranges
	this.set_ranges();

	// set up x and y scaling
	this.set_scales();

	// build Axes
	this.build_axes();

	// build a scaling function
	this.set_scaling_function();

	// plot the data points, appending where required
	this.points_selection = this.bg_layer.selectAll('.data_point').data(this.x_data);
	this.points_selection.enter().append('circle')
		.attr("class","data_point")
		.attr("cx",this.x_scale(0))
		.attr("cy",this.y_scale(0))
		.attr("opacity",0.5)
		.attr("r",0)
		.attr("fill",this.fg_color);

	// transition points
	this.points_selection.transition().duration(500)
		.attr("cx",this.x_scale)
		.attr("cy",function(d,i){return self.y_scale(self.y_data[i]);})
		.attr("r",function(d,i){
		if (self.scale_by === undefined){
			return 10;
		}else{
			return self.dot_scaler(self.scale_data[i]);
		}});

	// remove excess points 
	this.points_selection.exit().remove();

	// transition the axes
	this.vis.selectAll('.x-axis').transition().duration(500).call(this.xAxis);
	this.vis.selectAll('.y-axis').transition().duration(500).call(this.yAxis);
	this.style_axes();
	},

	// ### set_ranges
	// utility function used to get the x and y ranges used in the plot
	set_ranges: function(){
		var x_data,y_data,min,max;
		// calculate the x_range. If we need to caluclate it dynamically, check the lock and expand
		// parameters for the axis
		if (this.dynamic_x_range === true){
			x_data = this.model.get('x_data');

			// if the data is of length larger than 1, calculate the range, otherwise set the range to [0,0]
			if (x_data.length > 0 ){
				// check the min lock and expand flags and report the min of the range accordingly
				if (this.x_min_lock === undefined){
					min = _.min(x_data);
				}else{
					if (this.x_min_expand){
						data_min = _.min(x_data);
						min = (this.x_min_lock > data_min) ? data_min : this.x_min_lock;
					}else{
						min = this.x_min_lock;
					}
				}

				// check the max lock and expand flags and report the max of the range accordingly
				if (this.x_max_lock === undefined){
					max = _.max(x_data);
				}else{
					if (this.x_max_expand){
						data_max = _.max(x_data);
						max = (this.x_max_lock < data_max) ? data_max : this.x_max_lock;
					}else{
						max = this.x_max_lock;
					}
				}
				this.x_range = [min,max];
			}else{
				this.x_range = [0,0];
			}
		}

		// calculate the y_range. If we need to caluclate it dynamically, check the lock and expand
		// parameters for the axis
		if (this.dynamic_y_range === true){
			y_data = this.model.get('y_data');

			// if the data is of length larger than 1, calculate the range, otherwise set the range to [0,0]
			if (y_data.length > 0 ){
				// check the min lock and expand flags and report the min of the range accordingly
				if (this.y_min_lock === undefined){
					min = _.min(y_data);
				}else{
					if (this.y_min_expand){
						data_min = _.min(y_data);
						min = (this.y_min_lock > data_min) ? data_min : this.y_min_lock;
					}else{
						min = this.y_min_lock;
					}
				}

				// check the max lock and expand flags and report the max of the range accordingly
				if (this.y_max_lock === undefined){
					max = _.max(y_data);
				}else{
					if (this.y_max_expand){
						data_max = _.max(y_data);
						max = (this.y_max_lock < data_max) ? data_max : this.y_max_lock;
					}else{
						max = this.y_max_lock;
					}
				}
				this.y_range = [min,max];
			}else{
				this.y_range = [0,0];
			}
		}
	},

	// ### set_scales
	// utility function used to get the x and y scales used in the plot
	set_scales: function(){
		if (this.x_log){
			this.x_scale=d3.scale.log().domain([this.x_range[0],this.x_range[1]]).range([this.margin, this.width - this.margin]);
		}else{
			this.x_scale=d3.scale.linear().domain([this.x_range[0],this.x_range[1]]).range([this.margin, this.width - this.margin]);
		}
		if (this.y_log){
			this.y_scale=d3.scale.log().domain([this.y_range[1],this.y_range[0]]).range([this.margin, this.height - this.margin]);
		}else{
			this.y_scale=d3.scale.linear().domain([this.y_range[1],this.y_range[0]]).range([this.margin, this.height - this.margin]);
		}
	},

	// ### build_axes
	// utility function used to build x and y axes
	build_axes: function(){
		this.xAxis = d3.svg.axis()
			.scale(this.x_scale)
			.orient("bottom");
		this.yAxis = d3.svg.axis()
			.scale(this.y_scale)
			.orient("left");
	},

	// ### set_scaling_function
	// utility function to compute a radius scaling funciton to use in plots
	set_scaling_function: function(){
		var self = this;
		if (this.scale_by !== undefined){
			this.scale_data = this.model.get('meta_data')[this.scale_by];
			var size_min = Math.sqrt(_.min(this.scale_data)/Math.PI);
			var size_max = Math.sqrt(_.max(this.scale_data)/Math.PI);
			this.size_scale=d3.scale.linear().domain([size_min,size_max]).range([5, 20]);
			this.dot_scaler = function(val){
				r = Math.sqrt(val/Math.PI);
				return self.size_scale(r);
			};
		}
	},

	// ### style axes
	// utility function to apply custom styles to axis components
	style_axes: function(){
		this.vis.selectAll('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");
	}
});
// **TagListView**
// A Backbone.View that displays a list of objects in a collection as tags.  The tags are drawn
// as rounded rectangles with text inside.  The text corresponds to the cid attributes in the
// collection by defaul, but can be customized to display other fields if required

// basic use

//		tag_list_view = new TagListView();

// optional arguments

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *white*
// 3.  {string}  **tag\_color**  the hex color code to use as the tag color of the view, defaults to *gray*
// 4.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"col-lg-12"*
// 5.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*
// 6.  {string}  **display_field**  the model attribute to display for each model in the view's colleciton.  defualts to *'cid'*

//		tag_list_view = new TagListView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "white",
//									tag_color: "gray",
//									span_class: "col-lg-12",
//									plot_height: 120,
//									display_attribute: "cid"});

Barista.Views.TagListView = Barista.Views.BaristaBaseView.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "TagListView",

	// ### model
	// set of the default model for the view
	model: new Backbone.Model(),

	// ### collection
	// set up a default collection for the view to work with
	collection: new Backbone.Collection(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// initialize the base view
		this.base_initialize();
		
		// set up a display attribute 
		this.display_attribute = (this.options.display_attribute !== undefined) ? this.options.display_attribute : 'cid';

		// set up a tag color to use 
		this.tag_color = (this.options.tag_color !== undefined) ? this.options.tag_color : 'black';

		// clear built in listeners
		this.stopListening();

		// add listeners for the collection and trigger an update when it changes
		this.listenTo(this.collection,'add', this.update);
		this.listenTo(this.collection,'remove', this.update);
		this.listenTo(this.collection,'reset', this.update);
		this.listenTo(this.collection,'sort', this.update);
	},

	// ### render
	// completely render the view. Updates both static and dynamic content in the view.
	render: function(){
		var self = this;
		// call BaristaBaseView's render function first so we can layer on top of it
		this.base_render();

		// add a text element for each item in the collection
		this.x_offsets = [5];
		this.row_number = 0;
		this.y_offsets = [];
		this.lengths = [];
		this.tags = [];
		this.collection.models.forEach(function(model){
			self.tags.push(model.get(self.display_attribute));
		});
		this.fg_layer.selectAll('.tag_list_text').data([]).exit().remove();
		this.fg_layer.selectAll('.tag_list_text').data(this.tags).enter().append('text')
			.attr("class","tag_list_text")
			.text(function(d){return d;})
			.attr("x",function(d,i){
				self.lengths.push(this.getComputedTextLength() + 15);
				var current_x_offset = self.x_offsets[i];
				if (current_x_offset + self.lengths[i] > self.width){
					self.x_offsets[i] = 5;
					self.x_offsets.push(self.lengths[i] + self.x_offsets[i]);
					self.row_number += 1;
				}else{
					self.x_offsets.push(self.lengths[i] + self.x_offsets[i]);
				}
				self.y_offsets.push((self.row_number * 1.5 + 1));
				return self.x_offsets[i];
			})
			.attr("y",function(d,i){return self.y_offsets[i] + 'em';})
			.attr("opacity",1)
			.attr("fill",this.fg_color);

		this.bg_layer.selectAll('.tag_list_rect').data([]).exit().remove();
		this.bg_layer.selectAll('.tag_list_rect').data(this.tags).enter().append('rect')
			.attr("class","tag_list_rect")
			.attr("x",function(d,i){return self.x_offsets[i] - 5;})
			.attr("y",function(d,i){return (self.y_offsets[i] - 1) + 'em';})
			.attr("rx",4)
			.attr("ry",4)
			.attr('width',function(d,i){return self.lengths[i] - 4;})
			.attr('height','1.2em')
			.attr("opacity",1)
			.attr("fill",this.tag_color);
		return this;
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		var self = this;
		// call BaristaBaseView's render function first so we can layer on top of it
		this.base_render();
		
		// add a text element for each item in the collection
		this.x_offsets = [5];
		this.row_number = 0;
		this.y_offsets = [];
		this.lengths = [];
		this.tags = [];
		this.collection.models.forEach(function(model){
			self.tags.push(model.get(self.display_attribute));
		});
		this.fg_layer.selectAll('.tag_list_text').data([]).exit().remove();
		this.fg_layer.selectAll('.tag_list_text').data(this.tags).enter().append('text')
			.attr("class","tag_list_text")
			.text(function(d){return d;})
			.attr("x",function(d,i){
				self.lengths.push(this.getComputedTextLength() + 15);
				var current_x_offset = self.x_offsets[i];
				if (current_x_offset + self.lengths[i] > self.width){
					self.x_offsets[i] = 5;
					self.x_offsets.push(self.lengths[i] + self.x_offsets[i]);
					self.row_number += 1;
				}else{
					self.x_offsets.push(self.lengths[i] + self.x_offsets[i]);
				}
				self.y_offsets.push((self.row_number * 1.5 + 1));
				return self.x_offsets[i];
			})
			.attr("y",function(d,i){return self.y_offsets[i] + 'em';})
			.attr("opacity",1)
			.attr("fill",this.fg_color);

		this.bg_layer.selectAll('.tag_list_rect').data([]).exit().remove();
		this.bg_layer.selectAll('.tag_list_rect').data(this.tags).enter().append('rect')
			.attr("class","tag_list_rect")
			.attr("x",function(d,i){return self.x_offsets[i] - 5;})
			.attr("y",function(d,i){return (self.y_offsets[i] - 1) + 'em';})
			.attr("rx",4)
			.attr("ry",4)
			.attr('width',function(d,i){return self.lengths[i] - 4;})
			.attr('height','1.2em')
			.attr("opacity",1)
			.attr("fill",this.tag_color);
		return this;
	},
});


// # **TickView**

// A Backbone.View that displays a Connectivity Map tick view.  The view is must be paired with a CMapTickModel that
// describes the rows to display in the tick view and the scores of the ticks to show for each row.  An 
// example input data object from a CMapTickModel might looks like this:

//			{PC3: [.23,-.28], MCF7: [-0.6]}

// The view will render a row for each key in the data object and a tick for each entry in the array values
// for each row.  The view also renders a title based on the model's title attribute

// optional arguments:

// 1.  {string}  **template**  The path to a handlebars template to use. Defaults to *../templates/d3_target.handlebars*
// 2.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#bdbdbd*
// 3.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

// example usage:

//		tick_view = new TickView({el: $("target_selector"),
//												model: new CMapTickModel({data:{PC3: [.23,-.28], MCF7: [-0.6]}, title: "example data"}),
//												template: "../templates/d3_target.handlebars",
//												bg_color: "#bdbdbd",
//												span_class: "span12"
//												});

Barista.Views.TickView = Backbone.View.extend({
	// ### name
	// give the view a name to be used throughout the View's functions when it needs to know what its class name is
	name: "TickView",

	// ### model
	// set up the view's default model
	model: new Barista.Models.TickModel(),

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
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.compiled_template = BaristaTemplates.d3_target;
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class}));

		// define the location where d3 will build its plot
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		this.isCompiling = false;
		// draw the plot for the first time
		this.redraw();
	},

	// ### redraw
	// perform a full redraw of the view, including wiping out all d3 drawn components in the view and 
	// initializing them again from scratch.

	//		tick_view.redraw();
	redraw: function(){
		var self = this;
		// set up the panel's width and height via animation
		this.width = $("#" + this.div_string).width();
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
			if (Barista.arrayAverage(a[1]) < Barista.arrayAverage(b[1])) return 1;
			if (Barista.arrayAverage(a[1]) > Barista.arrayAverage(b[1])) return -1;
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
			if (Barista.arrayAverage(a[1]) < Barista.arrayAverage(b[1])) return 1;
			if (Barista.arrayAverage(a[1]) > Barista.arrayAverage(b[1])) return -1;
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
				self.width = $("#" + self.div_string).width();
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

// # **ViolinPlotView**
// A Backbone.View that displays a single scatter plot.  the view's model is assumed to have the same defaults
// as specified in **ScatterPlotModel**

// basic use:

//		violin_plot_view = new ViolinPlotView();

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **fg\_color**  the hex color code to use as the foreground color of the view, defaults to *#1b9e77*
// 3.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*
// 4.  {Array}  **x_range**  a two element array specifying the x plotting bounds of the plot, defaults to *[min(x_data),max(x_data)]*
// 5.  {Array}  **y_range**  a two element array specifying the y plotting bounds of the plot, defaults to *[min(y_data),max(y_data)]*
// 6.  {Bool}  **x_log**  if set to true, plots the x axis on a log scale, defaults to *false*
// 7.  {Bool}  **y_log**  if set to true, plots the y axis on a log scale, defaults to *false*
// 8.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*

//		violin_plot_view = new ViolinPlotView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									scale_by: undefined,
//									x_range: undefined,
//									y_range: undefined,
//									x_log: false,
//									y_log: false,
//									plot_height: 120});
Barista.Views.ViolinPlotView = Barista.Views.BaristaBaseView.extend({
	// ### model
	// set up the view's default model
	model: new Barista.Models.ScatterPlotModel(),

	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up x and y range
		this.x_range = (this.options.x_range !== undefined) ? this.options.x_range : undefined;
		this.y_range = (this.options.y_range !== undefined) ? this.options.y_range : undefined;

		// set up x and y log flags
		this.x_log = (this.options.x_log !== undefined) ? this.options.x_log : false;
		this.y_log = (this.options.y_log !== undefined) ? this.options.y_log : false;

		// set up the scale_by parameter
		this.scale_by = (this.options.scale_by !== undefined) ? this.options.scale_by : undefined;

		// run BaristaBaseView's base_initialize method to handle boilerplate view construction
		// and initial view rendering
		this.base_initialize();

		// set up the default height for the plot
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : undefined;

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.update);

		// compile the default template for the view
		this.compile_template();

		// define the location where d3 will build its plot
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();
		this.vis = d3.select("#" + this.div_string).append("svg")
						.attr("width",this.width)
						.attr("height",this.height);

		// render the vis
		this.render();

		// bind window resize events to render
		var self = this;
		$(window).resize(function() {self.render();} );
	},

	// ### compile_template
	// use Handlebars to compile the template for the view
	compile_template: function(){
		var self = this;
		this.div_string = 'd3_target' + Math.round(Math.random()*1000000);
		this.compiled_template = BaristaTemplates.d3_target;
		this.$el.append(BaristaTemplates.d3_target({div_string: this.div_string,
												span_class: this.span_class,
												height: this.plot_height}));
	},

	// ### render
	// completely render the view. Updates both static and dynamic content in the view.
	render: function(){
		this.base_render();
		this.init_plot();
		this.update();
	},

	// ### init_plot
	// initialize the static parts of the view's panel
	init_plot: function(){
		// stuff this into a variable for later use
		var self = this;

		// set up the margin
		this.margin = 50;

		// set up x and y ranges
		if (this.x_range === undefined){
			this.x_range = [_.min(this.model.get('x_data')),_.max(this.model.get('x_data'))];
		}
		if (this.y_range === undefined){
			this.y_range = [_.min(this.model.get('y_data')),_.max(this.model.get('y_data'))];
		}

		// set up scaling
		if (this.x_log){
			this.x_scale=d3.scale.log().domain([this.x_range[0],this.x_range[1]]).range([this.margin, this.width - this.margin]);
		}else{
			this.x_scale=d3.scale.linear().domain([this.x_range[0],this.x_range[1]]).range([this.margin, this.width - this.margin]);
		}
		if (this.y_log){
			this.y_scale=d3.scale.log().domain([this.y_range[1],this.y_range[0]]).range([this.margin, this.height - this.margin]);
		}else{
			this.y_scale=d3.scale.linear().domain([this.y_range[1],this.y_range[0]]).range([this.margin, this.height - this.margin]);
		}

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		// set up the panel's width and height
		this.width = $("#" + this.div_string).width();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().attr("width",this.width);
		this.vis.transition().attr("height",this.height);

		// draw the background of the panel
		this.bg_layer.selectAll('.bg_panel').data([]).exit().remove();
		this.bg_layer.selectAll('.bg_panel').data([1]).enter().append('rect')
			.attr("class","bg_panel")
			.attr("height",this.height)
			.attr("width",this.width)
			.attr("fill",this.bg_color);

		// build an Axes
		var xAxis = d3.svg.axis()
			.scale(this.x_scale)
			.orient("bottom");
		var yAxis = d3.svg.axis()
			.scale(this.y_scale)
			.orient("left");

		// plot the axes
		this.bg_layer.selectAll('.axis').data([]).exit().remove();
		this.bg_layer.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (this.height - this.margin) + ")")
			.call(xAxis);

		// style the axes
		this.vis.selectAll('.axis').selectAll("path")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("line")
			.style("fill","none")
			.style("stroke","black")
			.style("shape-rendering", "crispEdges");

		this.vis.selectAll('.axis').selectAll("text")
			.style("font-family","sans-serif")
			.style("font-size","11px");

		// define an area generator for use in plotting data
		this.upper_area_generator = d3.svg.area()
			.x(function(d) { return self.x_scale(d.x); })
			.y0(this.y_scale(0))
			.y1(function(d) { return self.y_scale(d.y); })
			.interpolate('basis');
		this.lower_area_generator = d3.svg.area()
			.x(function(d) { return self.x_scale(d.x); })
			.y0(this.y_scale(0))
			.y1(function(d) { return self.y_scale(d.y * -1); })
			.interpolate('basis');

		// grab data from the model and package it such that we can iterate over it
		// and generate an area. The packaged data will be sorted by the x_data attribute
		this.x_data = this.model.get('x_data');
		this.y_data = this.model.get('y_data');
		this.path_data = [];
		this.x_data.forEach(function(x,i){ self.path_data.push({x: x, y: self.y_data[i]});});
		this.path_data.sort(this.path_data_sorter);

		// plot the data
		this.bg_layer.selectAll('.upper_violin').data([]).exit().remove();
		this.bg_layer.selectAll('.upper_violin').data([1]).enter().append('path')
			.attr("class","upper_violin")
			.attr("opacity",0.5)
			.attr("fill",this.fg_color)
			.attr('d',this.upper_area_generator(this.path_data));
		this.bg_layer.selectAll('.lower_violin').data([]).exit().remove();
		this.bg_layer.selectAll('.lower_violin').data([1]).enter().append('path')
			.attr("class","lower_violin")
			.attr("opacity",0.5)
			.attr("fill",this.fg_color)
			.attr('d',this.lower_area_generator(this.path_data));


		// plot the x axis title
		this.bg_layer.selectAll('.x_axis_label').data([]).exit().remove();
		this.bg_layer.selectAll('.x_axis_label').data([1]).enter().append('text')
			.attr("class","x_axis_label axis_label")
			.attr("x",this.width/2)
			.attr("y",this.height-10)
			.style("text-anchor","middle")
			.text(this.model.get('x_axis_title'));

		// plot the title
		this.bg_layer.selectAll('.title').data([]).exit().remove();
		this.bg_layer.selectAll('.title').data([1]).enter().append('text')
			.attr("class","title title")
			.attr("x",this.width/2)
			.attr("y",this.margin/2)
			.style("text-anchor","middle")
			.text(this.model.get('title'));

	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		var self = this;
		// grab data from the model and package it such that we can iterate over it
		// and generate an area. The packaged data will be sorted by the x_data attribute
		this.x_data = this.model.get('x_data');
		this.y_data = this.model.get('y_data');
		this.path_data = [];
		this.x_data.forEach(function(x,i){ self.path_data.push({x: x, y: self.y_data[i]});});
		this.path_data.sort(this.path_data_sorter);

		// transition the data
		var upper = this.bg_layer.selectAll('.upper_violin');
		upper.transition().duration(500).attr('d',this.upper_area_generator(this.path_data));

		var lower = this.bg_layer.selectAll('.lower_violin');
		lower.transition().duration(500).attr('d',this.lower_area_generator(this.path_data));
	},

	// ### path data sorter
	// internal method used to sort path_data list elements by the x attribute
	path_data_sorter: function(a,b) {
		if (a.x < b.x){
			return -1;
		}else{
			return 1;
		}
	}
});
