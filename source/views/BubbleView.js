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