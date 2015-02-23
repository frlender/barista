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
    // set up static text, default if not specified
    this.label = (this.options.label !== undefined) ? this.options.label : 'Signatures';

    // call the the base view initialize function
    this.base_initialize();

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
    this.base_render()
      .renderLabel()
      .renderCount();

    return this;
  },

  /**
   * draw the static label at the top of the view
   * @return {Barista.Views.GenericCountView} a reference to this
   */
  renderLabel: function() {
    this.fg_layer.selectAll('.genericCountViewLabel').data([]).exit().remove();
    this.fg_layer.selectAll('.genericCountViewLabel').data([1])
      .enter().append("text")
      .attr("class","genericCountViewLabel")
      .attr("x",10)
      .attr("y",20)
      .attr("font-family","'Open Sans")
      .attr("font-weight","700")
      .attr("font-size","21px")
      .attr("fill",'#222222')
      .text(this.label);

    return this;
  },

  /**
   * draw the count from scratch
   * @return {Barista.Views.GenericCountView} a reference to this
   */
  renderCount: function() {
    // get the count from the model. If it is undefined, assume it is 0
    var count = this.model.get('count');
    if (typeof(count) !== 'number'){
      count = 0;
    }

    // draw the count
    this.fg_layer.selectAll('.genericCountViewCount').data([]).exit().remove();
    this.fg_layer.selectAll('.genericCountViewCount').data([1])
      .enter().append("text")
      .attr("class","genericCountViewCount")
      .attr("x",10)
      .attr("y",55)
      .attr("font-family","'Open Sans")
      .attr("font-weight","500")
      .attr("font-size","37px")
      .attr("fill",this.fg_color)
      .text(count);

    return this;
  }

});
