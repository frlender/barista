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
// 9.  {Number}  **plot_height**  the height of the plot in pixels, defaults to *120*

//		scatter_plot_view = new ScatterPlotView({el: $("target_selector",
//									bg_color:"#ffffff", 
//									fg_color: "#1b9e77",
//									span_class: "span4",
//									scale_by: undefined,
//									x_range: undefined,
//									y_range: undefined,
//									x_log: false,
//									y_log: false,
//									plot_height: 120});

ScatterPlotView = BaristaBaseView.extend({
	// ### initialize
	// overide the default Backbone.View initialize method to handle optional arguments, compile the view
	// template, bind model changes to view updates, and render the view
	initialize: function(){
		// set up x and y range and determine if we need to draw the axes dynamically
		this.x_range = (this.options.x_range !== undefined) ? this.options.x_range : undefined;
		this.y_range = (this.options.y_range !== undefined) ? this.options.y_range : undefined;
		this.dynamic_x_range = (this.x_range == undefined) ? true : false;
		this.dynamic_y_range = (this.y_range == undefined) ? true : false;

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
		var y_data;
		if (this.dynamic_x_range){
			this.x_range = [_.min(this.model.get('x_data')),_.max(this.model.get('x_data'))];
		}
		if (this.dynamic_y_range == true){
			y_data = this.model.get('y_data');
			if (y_data.length > 0 ){
				var min = _.min(y_data)
				var max = _.max(y_data)
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