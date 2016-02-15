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

A page's default route is a value matching the page name. For example if the page name is `books` the page will be available in the browser at `/books`. The page specification's route property becomes:

```js
"route": {
  "paths": ["/books"]
}
```

For detailed documentation of routing, see [Routing](https://github.com/dadi/web/blob/docs/docs/routing.md#page-routing).


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
