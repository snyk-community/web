# DADI Web

## Pages

### Overview

DADI Web uses the [express-session](https://github.com/expressjs/session) library to handle sessions. Visit that project's homepage for more detailed information regarding session configuration.

* [Page Specification](#page-specification)
* [Basic Page Configuration](#basic-page-configuration)
* [Advanced Page Configuration](#advanced-page-configuration)
* [Configuration Properties](#configuration-properties)
* [Routing](#routing)
  * [Dynamic route segments](#dynamic-route-segments)
  * [Multi-route pages](#multi-route-pages)
  * [Route constraints](#route-constraints)
* [Caching](#caching)

### Page Specification

A `page` on your website consists of two files within your application's file structure: a Page Specification and a Template.

Page Specifications exist as JSON files in your application's `pages` folder. The location of this folder is configurable, but defaults to `app/pages`.

Template files are stored in the same folder as the page specifications and have a `.dust` extension. Unless the page specification contains an explicit `template` property, the template name should match the page specification name.

```
my-web/
  app/
    datasources/      # datasource specifications
    events/           # event files
    pages/            # page specifications        
      people.json     # page specification file
      people.dust     # page template file
```

#### Basic Page Configuration


```js
{
  "page": {
    "name": "People",
    "description": "A page for displaying People records.",
    "language": "en"
  },
  "datasources": [

  ],
  "events": [

  ]
}
```

#### Advanced Page Configuration

```js
{
  "page": {
    "name": "People",
    "description": "A page for displaying People records.",
    "language": "en"
  },
  "settings": {
    "cache": true,
    "beautify": true,
    "keepWhitespace": true,
    "passFilters": true
  },
  "route": {
    "path": "/people"
  },
  "contentType": "text/html",
  "template": "people.dust",
  "datasources": [
    "allPeople"
  ],
  "events": [
    "processPeopleData"
  ]
}
```

#### Configuration Properties

Property    |   Description        |  Type        | Default         
------------|----------------|------------------|----------------
**page**|        ||
 page.name          || String |
 page.key           || String |
 page.description   || String |
**settings** |   ||
 settings.cache         || Boolean | `false`
 settings.beautify      || Boolean | `false`
 settings.keepWhitespace    || Boolean | If the global config has a setting for `dust.whitespace` that is used as the default, otherwise `true`
 settings.passFilters    || Boolean | `false`
route            || String | `/pageName`
contentType      || String | `"text/html"`
template         || String | `pageName.dust`
datasources      || Array | `[]`
events           || Array | `[]`


### Routing

The `route.path` and `route.paths` properties allow customising the page's route to specify the URL(s) that match the page.

This property allows for an array of URL formats to enable multi-page routing. A value such as `"route": { "path": "/books" }` will be resolved at startup to `"route": { "paths": ["/books"] }`. Both forms are considered valid.

A page's default route is a value matching the page name. For example if the page name is `books` the route property becomes:

```js
"route": {
  	"paths": ["/books"]
}
```

**Note:** DADI Web uses the [Path to Regexp](https://github.com/pillarjs/path-to-regexp) library when parsing routes. More information on parameter usage can be found in the Github repository.

#### Dynamic route segments and named parameters

Routes may contain dynamic segments or named parameters which are resolved from the request URL and can be utilised by the datasources and events attached to the page.

For example a page with the route `/books/:title` will cause the page to be loaded for any request matching this format. DADI Web will extract the `:title` parameter and add it to the `req.params` object, making it available for use in the page's attached datasources and events.

The following URLs all match the above page's route:

URL       | Named Parameters        | Request Parameters         
---------------|----------------------|-----
/books/war-and-peace           |    :title = war-and-peace | ```req.params = { title: "war-and-peace" } ```
/books/sisters-brothers           |    :title = sisters-brothers | ```req.params = { title: "sisters-brothers" } ```

**Example**
```js
"route": {
  "path": "/people/:id"
}
```

> See [Datasource Specification](datasource_specification.md) for more information regarding the use of named parameters.


##### Optional Parameters

Parameters can be made optional by adding a question mark (?).

For example the route `/books/:page?` will match requests in both the following formats:

URL       | Named Parameters                 
:---------------|:---------------------------
/books |
/books/2 | :page = 2


#### Multi-route pages

```js
"route": {
  "paths": ["/people", "/people/:id"]
}
```

#### Route Constraints

In the case of ambiguous routes it is possible to provide DADI Web with a constraint function or datasource to check a matching route against some business logic or database records.

Returning `true` from a constraint instructs DADI Web that this is the correct route.

Returning `false` from a constraint instructs DADI Web to try the next matching route (or return a 404 if there are no further matching routes).

Constraints for ambiguous routes are added as a property in the page specification file:

```js
"route": {
  "path": "/:people",
  "constraint": "nextIfNotPeople"
}
```

#### Using `toPath()`

```js
var app = require('dadi-web');
var page = app.getComponent('person');
var url = page.toPath({ id: '1234' });

// returns "/person/1234"
```

### Templates


### Data
#### Datasources
#### Events

### Caching


### POST

so... all you need to do is handle the request in an event

```js
// this guy has your form data: `req.body`
var query1 = req.body.var1;
var query2 = req.body.var2;
```
