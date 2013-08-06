![barista.js](http://coreyflynn.github.io/Bellhop/img/cmap_broad_logo_small.png)

# **Barista.js**
### Connectivity Map javascript components

Barista provides a library of components for working with data provided by the Connectivity Map group at the Broad Institute.  These components are centered around the core structures of Models, Collections, and Views set up in [Backbone.js](http://backbonejs.org/ "Backbone").  The models provide sensible data objects for commonly used data types within Connectivity Map data.  The Collections group those models into common sets of data types.  The Views handle the on-screen display of either Models or Collections.  These components do not depend on each other and are meant to be the building blocks of larger applications that consume Connectivity Map data. 

## **Installation**
All of barista's dependencies are included in the main barista css and javascript files which we provide via a CDN, so all you need is

`<link href="http://cmap.github.io/barista/barista.main.min.css" rel="stylesheet">`

and

`<script src="http://cmap.github.io/barista/barista.main.min.js"></script>`

in your HTML and you're all set.

If you want to use only parts of the library or roll your own extensions to it, go right ahead!  Just download the code or fork it and go wild!  We welcome pull requests and feedback. 

## **Models**
Models provide objects that encapsulate information about commonly used data types in Connectivity Map data.  Many models also abstract the logic required to retrieve that information via the Connectivity Map's data APIs. Check out an [example model](http://cmap.github.io/barista/doc/models/CellCountModel.html "Example Model") to get a feel for what models provide

## **Collections**
Collections build on top of models.  A Collection represents a group of models that will be operated on as a whole. As an example, rather than handling a set of [PertModels](http://cmap.github.io/barista/doc/models/PertModel.html "PertModel") indivudually it is convient to use a [PertCollection](http://cmap.github.io/barista/doc/collections/PertCollection.html "PertCollection").  This allows you to interact with the models as a set instead of handling them one at a time. Certain views such as the [GridView](http://cmap.github.io/barista/doc/views/GridView.html "GridView") are built on top of collections

## **Views**
Views handle the display of data that is exposed in models and collections. A given model or collection could be used in multiple different views provided that the view is able to consume the data that it needs from the paired model or collection.  Views also handle much of the controller behavior in a typical MVC framework.  Think of the views as handling all rendering and UI responsibilities. If the User sees it, it is built through a view.  Views also transparently respond to changes in the underlying data model as it changes.   

## **Utils**
There are a small set of utility functions that do not fit cleanly as a model, collection, or view.  Think of these as mechanisms through which we abstract away mundane processing of data.  For example, the function [CMapPertTypeAlias](http://cmap.github.io/barista/doc/utils/CMapTypeAlias.html "CMapPertTypeAlias") returns an object of standard names and acronyms when given a Connectivity Map perturbagen type

## **Developer Documentation**
Want the nuts and bolts? dig in!

[Developer Documentation >](http://cmap.github.io/barista/doc)

