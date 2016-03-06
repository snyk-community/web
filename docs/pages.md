# DADI Web

## Pages

### Overview

DADI Web uses the [express-session](https://github.com/expressjs/session) library to handle sessions. Visit that project's homepage for more detailed information regarding session configuration.

* [Page Specification](#page-specification)
* [Basic Page Configuration](#basic-page-configuration)
* [Advanced Page Configuration](#advanced-page-configuration)
* [Configuration Properties](#configuration-properties)
* [Routing](#routing)
* [Caching](#caching)
* Static Pages (TODO)
* Error Pages

### Page Specification

A `page` on your website consists of two files within your application's file structure: a Page Specification and a Template.

Page Specifications exist as JSON files in your application's `pages` folder. The location of this folder is configurable, but defaults to `app/pages`.

Template files are stored in the same folder as the page specifications and have a `.dust` extension. Unless the page specification contains an explicit `template` property, the template name should match the page specification name. See [Views](https://github.com/dadi/web/blob/docs/docs/views.md#page-templates) for further documentation.

[TODO] DADI Web monitors the `app` folder for changes and will automatically reload pages and templates when these files change.

```
my-web/
  app/
    datasources/      # datasource specifications
    events/           # event files
    pages/            # page specifications        
      people.dust     # page template file
      people.json     # page specification file
```

#### Basic Page Configuration


```js
{
  "page": {
    "name": "People",
    "description": "A page for displaying People records.",
    "language": "en"
  },
  "datasources": [ ],
  "events": [ ]
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
  "requiredDatasources": [
    "allPeople"
  ],
  "events": [
    "processPeopleData"
  ]  
  "preloadEvents": [
    "geolocate"
  ],
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
requiredDatasources  | An array containing the Datasources that must return data for the page to function. If any of the listed Datasources return no results, a 404 is returned | Array | `[]`
events           || Array | `[]`
preloadEvents    | An array containing the Events that should be executed before the rest of the page's Datasources and Events | Array | `[]`

### Routing

A page's default route is a value matching the page name. For example if the page name is `books` the page will be available in the browser at `/books`. The page specification's route property becomes:

```js
"route": {
  "paths": ["/books"]
}
```

For detailed documentation of routing, see [Routing](https://github.com/dadi/web/blob/docs/docs/routing.md#page-routing).

### Templates

[TODO]

### Data

[TODO]

#### Datasources

[TODO]

#### Required Datasources

[TODO]

#### Preload Events

[TODO]

#### Events

[TODO]

### Caching

[TODO]

For detailed documentation of page caching, see [Page Caching](https://github.com/dadi/web/blob/docs/docs/caching.md#page-caching).

### POST

[TODO]

so... all you need to do is handle the request in an event

```js
// this guy has your form data: `req.body`
var query1 = req.body.var1;
var query2 = req.body.var2;
```


### Error Pages

#### _HTTP 404 Not Found_
To enable a custom 404 Not Found error page, add a page descriptor and template to the pages directory:

```
workspace/pages/404.json
workspace/pages/404.dust
```

404 templates have access to datasource and event data in the same way as standard pages.
