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
// 6.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*
// 7.  {string}  **template**  The path to a handlebars template to use. Defaults to *../templates/d3_target.handlebars*

//		scatter_plot_view = new ScatterPlotView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									scale_by: undefined,
//									x_range: undefined,
//									y_range: undefined,
//									plot_height: 120,
//									template: "templates/d3_target.handlebars",});

ScatterPlotView = Backbone.View.extend({
	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up color options.  default if not specified
		this.bg_color = (this.options.bg_color !== undefined) ? this.options.bg_color : "#ffffff";
		this.fg_color = (this.options.fg_color !== undefined) ? this.options.fg_color : "#1b9e77";

		// set up x and y range
		this.x_range = (this.options.x_range !== undefined) ? this.options.x_range : undefined;
		this.y_range = (this.options.y_range !== undefined) ? this.options.y_range : undefined;

		// set up the scale_by parameter
		this.scale_by = (this.options.scale_by !== undefined) ? this.options.scale_by : undefined;

		// set up the default height for the plot
		this.plot_height = (this.options.plot_height !== undefined) ? this.options.plot_height : undefined;

		// set up the handlebars template to use
		this.template = (this.options.template !== undefined) ? this.options.template : "templates/d3_target.handlebars";

		// set up the span size
		this.span_class = (this.options.span_class !== undefined) ? this.options.span_class : "span12";

		// bind render to model changes
		this.listenTo(this.model,'change', this.render);

		// compile the default template for the view
		this.compile_template_and_draw();

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
				self.$el.append(self.compiled_template({div_string: self.div_string,
														span_class: self.span_class,
														height: self.plot_height}));

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

		// set up scaling and margin parameters for the vis
		this.margin = 50;
		if (this.x_range === undefined){
			this.x_range = [_.max(this.model.get('x_data')),_.max(this.model.get('x_data'))];
		}
		if (this.y_range === undefined){
			this.y_range = [_.max(this.model.get('y_data')),_.max(this.model.get('y_data'))];
		}
		this.x_scale=d3.scale.linear().domain([this.x_range[0],this.x_range[1]]).range([this.margin, this.width - this.margin]);
		this.y_scale=d3.scale.linear().domain([this.y_range[1],this.y_range[0]]).range([this.margin, this.height - this.margin]);

		// set up drawing layers
		this.vis.selectAll('.bg_layer').data([]).exit().remove();
		this.bg_layer = this.vis.append("g").attr("class", "bg_layer");

		this.vis.selectAll('.fg_layer').data([]).exit().remove();
		this.fg_layer = this.vis.append("g").attr("class", "fg_layer");

		// set up the panel's width and height
		this.width = $("#" + this.div_string).outerWidth();
		this.height = $("#" + this.div_string).outerHeight();

		// rescale the width of the vis
		this.vis.transition().duration(1).attr("width",this.width);

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

		this.bg_layer.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + this.margin + ",0)")
			.call(yAxis);

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
			.attr("transform", "rotate(-90)")
			.attr("y", this.margin/2)
			.attr("x", - this.height/2)
			.style("text-anchor","middle")
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

	// ### render
	// update the dynamic potions of the view
	render: function(){
	// build a scaling function
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

	// plot the data points
	this.x_data = this.model.get('x_data');
	this.y_data = this.model.get('y_data');
	this.points_selection = this.bg_layer.selectAll('.data_point').data(this.x_data);
	this.points_selection.enter().append('circle')
		.attr("class","data_point")
		.attr("cx",this.x_scale(0))
		.attr("cy",this.y_scale(0))
		.attr("opacity",0.5)
		.attr("r",0)
		.attr("fill",this.fg_color);

		this.points_selection.transition().duration(500)
			.attr("cx",this.x_scale)
			.attr("cy",function(d,i){return self.y_scale(self.y_data[i]);})
			.attr("r",function(d,i){
			if (self.scale_by === undefined){
				return 10;
			}else{
				return self.dot_scaler(self.scale_data[i]);
			}});

		this.points_selection.exit().remove();
	}
});