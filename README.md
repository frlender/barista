![barista.js](http://coreyflynn.github.io/Bellhop/img/cmap_broad_logo_small.png)

# **Barista.js**
### Connectivity Map javascript components
------
Barista provides a library of components for working with data provided by the Connectivity Map group at the Broad Institute.  These components are centered around the core structures of Models, Collections, and Views set up in [Backbone.js](http://backbonejs.org/ "Backbone").  The models provide sensible data objects for commonly used data types within Connectivity Map data.  The Collections group those models into common sets of data types.  The Views handle the on-screen display on either Models or Collections.  These components do not depend on each other and are meant to be the building blocks of larger applications that consume Connectivity Map data. 

## **Instalation**
All of barista's dependencies are included in the main barista css and javascript files which we provide via a CDN, so all you need is

			<link href="http://cmap.github.io/barista/barista.main.min.css" rel="stylesheet">

and

			<script src="http://cmap.github.io/barista/barista.main.min.js"></script>

in your HTML and you're all set.

If you want to use only parts of the library or roll your own extensions to it, go right ahead!  Just download the code or fork it and go wild!  We welcome pull requests and feedback. 

## **Models**
Models provide objects that encapsulate information about commonly used data types in Connectivity Map data.  Many models also abstract the logic required to retrieve that information via the Connectivity Map's data APIs. Check out an [example model](http://cmap.github.io/barista/doc/models/CellCountModel.html "Example Model") to get a feel for what models provide

## **Views**

## **Collections**

## **Utils**

## **Developer Documentation**
We've only just given you a peak so far. Want the nuts and bolts? dig into the **[Developer Documentation](http://cmap.github.io/barista/doc)**

