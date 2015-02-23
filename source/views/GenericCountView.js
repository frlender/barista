/**********************************************************
 * Generic Count View                                     *
 * a view that supports a single label and a single count *
 **********************************************************/

Barista.Views.GenericCountView = Barista.Views.BaristaBaseView.extend({
  /**
   * give the view a name to be used throughout the View's functions when
   * it needs to know what its class name is
   * @type {String}
   */
  name: "GenericCountView",

  /**
   * set up the view's default model
   * @type {Barista.Models.GenericCoutModel}
   */
  // model: new Barista.Models.GenericCountModel(),

  /**
   * overide the default Backbone.View initialize method to handle
   * optional arguments, compile the view template, bind model changes
   * to view updates and render the view
   * @return {Barista.Views.GenericCountView} a reference to this
   */
  initialize: function(){
    // call the the base view initialize function
    this.base_initialize();

    // set up static text, default if not specified
    this.label = (this.options.label !== undefined) ? this.options.label : 'Signatures';

    // bind window resize events to redraw.
    var self = this;
    $(window).resize(function() {self.update();} );

    return this;
  },

  /**
   * completely re-render the view
   * @return {Barista.Views.GenericCountView} a reference to this
   */
  render: function(){
    this.base_render().drawLabel();
  },

  /**
   * draw the static label at the top of the view
   */
  drawLabel: function() {
    var self = this;
    this.fg_layer.selectAll('.genericCountViewLabel').data([]).exit().remove();
    this.fg_layer.selectAll('.genericCountViewLabel').data([1])
      .enter().append("text")
      .attr("class","genericCountViewLabel")
      .attr("x",10)
      .attr("y",14)
      .attr("font-family","'Open Sans")
      .attr("font-weight","500")
      .attr("font-size","1.31463rem")
      .attr("fill",'#222222')
      .text(self.label);
    return this;
  }

});
