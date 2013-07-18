this["BaristaTemplates"] = this["BaristaTemplates"] || {};

this["BaristaTemplates"]["CMapBaseGrid"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"";
  if (stack1 = helpers.div_string) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.div_string; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  if (stack1 = helpers.span_class) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.span_class; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " backgrid-container\" height=\"300\"></div>\n<div class=\"row-fluid\">\n	<p class=\"span2\" style=\"cursor: pointer\" id=\"";
  if (stack1 = helpers.div_string) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.div_string; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "_download\">\n		<font color=\"#0072B2\"><i class=\"icon-share\"></i> export table</font>\n	</p>\n	<span class=\"span10\">\n		<p class=\"pull-right\" style=\"padding-right: 8px\"><span class=\"label\" style=\"background-color: #E69F00\">SMC</span> Small Molecule Compound </p>\n		<p class=\"pull-right\" style=\"padding-right: 8px\"><span class=\"label\" style=\"background-color: #56B4E9\">KD</span> Knock Down </p>\n		<p class=\"pull-right\" style=\"padding-right: 8px\"><span class=\"label\" style=\"background-color: #D55E00\">OE</span> Over Expression </p>\n		\n	</span>\n</div>";
  return buffer;
  });

this["BaristaTemplates"]["CMapFooter"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<a href=\"";
  if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"><img class=\"pull-right cmap-footer-image\" src=\"";
  if (stack1 = helpers.logo) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.logo; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></a>\n	";
  return buffer;
  }

  buffer += "<hr>\n<div class=\"row-fluid\">\n	<p class=\"offset1 span3 pull-left\">&copy ";
  if (stack1 = helpers.year) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.year; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.organization) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.organization; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " all rights reserved</p>\n	<p class=\"span4 cmap-center-text\"><a href=\"";
  if (stack1 = helpers.terms_url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.terms_url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">terms and conditions</a></p>\n	<div class=\"span3\">\n	";
  stack1 = helpers.each.call(depth0, depth0.logo_objects, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n</div>";
  return buffer;
  });

this["BaristaTemplates"]["CMapHeader"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"spacer\" style=\"min-height:10px\"></div>\n\n<div class=\"row-fluid\">	\n	<p class=\"offset1 span3\"><i class=\"icon-home icon-large cmap-header-link\" onclick=\"window.location.href = 'http://apps.lincscloud.org';\"></i></p>\n	<div class=\"span4\">\n		<p class=\"cmap-brand-text cmap-center-text\">the connectivity map</font>\n		<h3 class=\"cmap-title-text cmap-center-text\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h3>\n	</div>\n	<div class=\"span3\">\n		<p class=\"offset1 span3 pull-right\">\n			<i class=\"icon-signout icon-large cmap-header-link\"></i>\n			<i class=\"icon-cog icon-large cmap-header-link\"></i>\n			<i data-toggle=\"modal\" data-target=\"#aboutModal\" class=\"icon-info-sign icon-large cmap-header-link\"></i></p>\n		<!-- <img src=\"../../img/cmap_broad_logo_small.png\" class=\"pull-right\" alt=\"\" style=\"max-height: 49pt; \"> -->\n	</div>\n</div>\n\n<div class=\"row-fluid\">\n	<p class=\"offset1 span10 muted cmap-subhead-text cmap-center-text\">";
  if (stack1 = helpers.subtitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.subtitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</p>\n</div>\n\n  <!-- Modal -->\n<div id=\"aboutModal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"aboutModalLabel\" aria-hidden=\"true\">\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">X</button>\n    <h3 id=\"aboutModalLabel\">About the Connectivity Map</h3>\n  </div>\n  <div class=\"modal-body\">\n    <p>The Connectivity Map (or CMap) is a catalog of gene-expression data collected from human cells treated with chemical compounds and genetic reagents. Computational methods to reduce the number of necessary genomic measurements along with streamlined methodologies enable the current effort to significantly increase the size of the CMap database and along with it, our potential to connect human diseases with the genes that underlie them and the drugs that treat them.</p>\n\n    <p>CMap intends to accelerate the discovery process by systematically revealing connections between genes/compounds discovered in screens and molecular pathways that underlie disease states. The goal is to turn basic discoveries into drugs and diagnostics that have therapeutic impact.</p>\n  </div>\n  <div class=\"modal-footer\">\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n  </div>\n</div>";
  return buffer;
  });

this["BaristaTemplates"]["CMapPertSearchBar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"input-append span10\">\n	<input class=\"span12\" autocomplete=\"off\" type=\"text\" placeholder=\"search gene, compound, or cell type name; separate compound searches with :\" data-provide=\"typeahead\" id=\"search\">\n	<span class=\"add-on\">Search 1,209,824 profiles</span>\n</div>";
  });

this["BaristaTemplates"]["d3_target"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<div id=\"";
  if (stack1 = helpers.div_string) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.div_string; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  if (stack1 = helpers.span_class) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.span_class; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" style=\"height:";
  if (stack1 = helpers.height) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.height; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "px\"></div>\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<div id=\"";
  if (stack1 = helpers.div_string) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.div_string; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"";
  if (stack1 = helpers.span_class) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.span_class; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" style=\"height:120px\"></div>\n";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, depth0.height, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  });