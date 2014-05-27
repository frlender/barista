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
		this.options.plot_height = 250;

		// set up the open and closed state heights
		this.open_height = this.options.plot_height;
		this.closed_height = this.options.plot_height;

		// initialize the view using the base view's built in method
		this.base_initialize();
	},

	// ### render
	// completely render the view. Updates both static and dynamic content in the view.
	render: function(){
		// keep track of our scope at this level
		var self = this;

		// render the base view components
		this.base_render();

		// draw compound structure if there is one
		if (this.model.get("structure_url")){
			this.fg_layer.selectAll('.index_text_icon').data([]).exit().remove();
			this.fg_layer.selectAll('.index_text_icon').data([1])
								.enter().append("svg:image")
								.attr("class","index_text_icon")
								.attr("xlink:href", this.model.get("structure_url"))
								.attr("x",this.width - 310)
								.attr("y",0)
								.attr("height",150)
								.attr("width",300)
								.style("cursor","pointer")
								.on("click", function(){window.location = self.model.get('structure_url')});
		}

		// draw the static index reagent text
		this.fg_layer.selectAll('.index_text').data([]).exit().remove();
		this.fg_layer.selectAll('.index_text').data([1])
							.enter().append("text")
							.attr("class","index_text")
							.attr("x",10)
							.attr("y",30)
							.attr("fill","#E69F00")
							.attr("font-family","Helvetica Neue")
							.attr("font-size","20pt")
							.text('Small Molecule Compound');

		// (re)draw the pert_iname text
		this.fg_layer.selectAll('.pert_iname_text').data([]).exit().remove();
		this.fg_layer.selectAll('.pert_iname_text').data([1])
							.enter().append("text")
							.attr("class","pert_iname_text")
							.attr("x",10)
							.attr("y",75)
							.attr("font-family","Helvetica Neue")
							.attr("font-weight","bold")
							.attr("font-size","36pt")
							.text(this.model.get('pert_iname'));

		// (re)draw the pert_id text
		this.fg_layer.selectAll('.pert_id_text').data([]).exit().remove();
		this.fg_layer.selectAll('.pert_id_text').data([1])
							.enter()
							.append("text")
							.attr("class","pert_id_text")
							.attr("x",10)
							.attr("y",100)
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.text(this.model.get('pert_id'));

		// render additional labels
		this.label_y_position = 100;

		// (re)draw the in_summly annotation
		this.render_label_and_value('collection', 'Collection', 'pert_icollection');

		// (re)draw the gold signatures annotation
		this.render_label_and_value('num_sig', 'Signatures', 'num_sig');

		// (re)draw the gold signatures annotation
		this.render_label_and_value('gold_sig', 'Gold Signatures', 'num_gold');

		// (re)draw the gold signatures annotation
		this.render_label_and_value('num_inst', 'Experiments', 'num_inst');

		// (re)draw the in_summly annotation
		this.render_label_and_value('summly', 'In Summly', 'in_summly');


		// set the y position to be below the fold
		this.label_y_position = 250;

		// (re)draw the weight label and weight
		this.render_label_and_value('weight', 'Weight', 'molecular_wt');

		// (re)draw the formula and label
		this.render_label_and_value('formula', 'Formula', 'molecular_formula');

		// (re)draw the formula and label
		this.render_label_and_value('vendor', 'Vendor', 'pert_vendor');

		// (re)draw the InChIKey label and InChIKey
		this.render_label_and_value('inchi_key', 'InChIKey', this.model.get("inchi_key").split("InChIKey=")[1], true);

		// (re)draw the pert_summary or clear it if there pert_summary is null
		if (this.model.get('pert_summary')){
			this.render_summary({summary_string: this.model.get('pert_summary'),
								 top: 186,
								 bottom: 230,
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

		// render a button to allow the user to expand the view to show its full content
		this.controls_layer.selectAll("." + this.div_string + "more_button").data([]).exit().remove();
		this.controls_layer.selectAll("." + this.div_string + "more_button").data([1]).enter()
			.append("rect")
			.attr("x",0)
			.attr("y",this.height - 10)
			.attr("class",this.div_string + "more_button")
			.attr("height",10)
			.attr("width",this.width)
			.attr("opacity",0.25)
			.attr("fill","#BDBDBD")
			.on("mouseover",function(){d3.select(this).transition().duration(500).attr("opacity",1);})
			.on("mouseout",function(){d3.select(this).transition().duration(500).attr("opacity",0.25);})
			.on("click", function(){self.toggle_panel_state});

		return this;
	},

	// ### update
	// update the dynamic potions of the view
	update: function(){
		this.render();
		return this;
	},

	// ### render_label_and_value
	// utility function to draw a standard label and value for that label under
	// the main pert_iname and pert_id text.  If pass_model_field_as_text is true,
	// pass the value in model_field as text instead of serching for it in the model
	render_label_and_value: function(class_name_base, label_text, model_field, pass_model_field_as_text, x_pos_base){
		// set up a local variable to keep our scope straight
		var self = this;

		// make sure that we have a label_y_position set
		this.label_y_position = (this.label_y_position !== undefined) ? this.label_y_position: 100;
		this.label_y_position += 25;

		// make sure that there is a base position for the x_label set
		var x_pos_base = (x_pos_base !== undefined) ? x_pos_base: 10;

		// update the open_height to the total height of all that we have drawn
		this.open_height = (this.options.plot_height < this.label_y_position) ? this.options.plot_height : this.label_y_position;

		// (re)draw the label
		this.fg_layer.selectAll('.' + class_name_base + '_label_text').data([]).exit().remove();
		this.fg_layer.selectAll('.' + class_name_base + '_label_text').data([1])
							.enter()
							.append("text")
							.attr("class",class_name_base + '_label_text')
							.attr("x",x_pos_base)
							.attr("y",this.label_y_position)
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.text(label_text + ':');

		// (re)draw the text
		this.fg_layer.selectAll('.' + class_name_base + '_text').data([]).exit().remove();
		var model_text = '';
		if (pass_model_field_as_text){
			model_text = model_field;
		}else{
			model_text = this.model.get(model_field);
		}
		var x_pos = x_pos_base + this.fg_layer.selectAll('.' + class_name_base + '_label_text').node().getComputedTextLength() + 10;
		this.fg_layer.selectAll('.' + class_name_base + '_text').data([1])
							.enter()
							.append("text")
							.attr("class",class_name_base + '_text')
							.attr("x",x_pos)
							.attr("y",this.label_y_position)
							.attr("font-family","Helvetica Neue")
							.attr("font-size","14pt")
							.attr("fill","#777777")
							.text(model_text);
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
		summary_string = this.model.get("pert_summary");
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

	// ### toggle_panel_state
	// utility to open or close the view
	toggle_panel_state: function(){
		if (this.panel_open){
			this.$el.animate({height:this.options.plot_height},500);
		}else{
			this.$el.animate({height:this.open_height},500);
		}
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
