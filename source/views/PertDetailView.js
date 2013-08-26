// # **PertDetailView**

// A Backbone.View that shows the name and short description of a single purturbagen.  This view is
// frequently paired with a PertDetailModel.

//		pert_detail_view = new PertDetailView({el: $("target_selector")});

// optional arguments:

// 1.  {string}  **bg\_color**  the hex color code to use as the backgound of the view, defaults to *#ffffff*
// 2.  {string}  **span\_class**  a bootstrap span class to size the width of the view, defaults to *"span12"*

//		pert_detail_view = new PertDetailView({el: $("target_selector"),
// 												model: PertDetailModel,
// 												bg_color: "#ffffff",
// 												span_class: "span4"});
Barista.Views.PertDetailView = Backbone.View.extend({
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