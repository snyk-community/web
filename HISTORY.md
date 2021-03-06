# Version 1.6.0 / 2016-06-08

This version update adds the ability to use a datasource as the main source of the htaccess style rewrites

Add the following block to configuration, specifying an existing datasource name:
```
rewrites: {
   datasource: "rewrites"
   path: ""
 }
```

# Version 1.5.0 / 2016-06-08

## Cluster support
This version adds support for running in cluster mode to take advantage of multiple core CPUs.

The default configuration _does not_ use cluster mode. To enable, add the following to configuration:

```js
"cluster": true
```

Web will report it is running in cluster mode at startup.

* fix #63: don't use main config options for ds extension

    if no cache config options are provided for a datasource the main
    config settings are used. for a datasource, we need to use .json
    by default, rather than the main config setting

* add 503 server too busy response

# Version 1.4.0 / 2016-05-05

* allow port configuration to be set from environment variable PORT
* fix: bug where an ID parameter from the request URL was added to all subsequent datasource filters
* fix: bug where caching was performed routing, therefore sometimes ignoring routes
* fix: allow datasource configuration to override protocol:
  * Previous versions assumed if the API settings used HTTPS then the datasource calls should too. Fix to allow
   a datasource to specify it's protocol and have that override the API setting.
* add support for HTTPS
* add page template metadata to returned JSON:
  ```
  "page": {
    "name": "movies_news",
    "description": "movies news",
    "language": "en"
  }
  ```

* fix #48: test current URL against returned redirect results:
  * when using a datasource for redirects, ensure that any results
  returned are matched against the URL before redirecting the request

* add config option to force a domain redirect

    this allows a setting in config as below which will force redirecting
    to the specified domain, e.g. useful to redirect a root domain to www.

    ```
    "rewrites": {
      "forceDomain": "www.example.com"
    }
    ```

* fix: allow any format for config setting sessions.cookie.maxAge

    the default for express-session is to use `cookie.maxAge = null`
    which means no "expires" parameter is set so the cookie becomes
    a browser-session cookie.

    When the user closes the browser the cookie (and session) will be removed.

* allow Redis use for session store configuration
* add token wallet path to `paths` configuration blocks
* integration @dadi/passport for token generation/validation
* add protocol option to `api` and `auth` configuration blocks


# Version 1.3.0 / 2016-03-22

## Status endpoint

Adds an endpoint at `/api/status` which returns server/application data in JSON format.

The request must be a POST and the body must have a `clientId` and `secret` that match those stored in the application's config file.

```
POST /api/status HTTP/1.1
Host: www.example.com
Content-Type: application/json

{"clientId": "testClient","secret": "superSecret"}
```

## Partials in subdirectories

Storing partials in subdirectories of the main partials folder previously caused the application crash. Now it doesn't. Thanks @eduardoboucas!

## requestParams type definition

Now allows the ability to specify a type definition of 'Number' on requestParams in a datasource
schema to override default of String. Thanks @mingard!

```
"requestParams": [
  { "param": "author", "field": "authorId", "type": "Number" }
]
```

# Version 1.2.0 / 2016-03-18

* Add: additional routing/rewriting config properties
* Add #37: Global events loader
* Fix #38: replace datasource loader in router
* Fix #36: load events in the order they were specified
* Fix #32: load template from filesystem if Dust cache is_disabled
* Fix #31: define the zlib variable
* Fix #29: refresh endpoint filter on subsequent page loads

# Version 1.1.0 / 2016-03-11

### Cache Invalidation
Version 1.1.0 introduces a cache invalidation endpoint which allows an authorised user to flush the cache
for either a specific path or the entire website. This process clears both page and datasource cache files.

The user must send a POST request to `/api/flush` with a request body containing the path to flush and
a set of credentials that match those held in the configuration file:

**Flush all cache files**
```
POST /api/flush HTTP/1.1
Host: www.example.com

{ "path": "*", "clientId": "testClient", "secret": "superSecret" }
```

**Flush cache files for a specific path**
```
POST /api/flush HTTP/1.1
Host: www.example.com

{ "path": "/books/crime", "clientId": "testClient", "secret": "superSecret" }
```

### Datasource Sort property

The sort property in a datasource schema has been extended to allow a variety of styles.
The sort property can now take one of the following forms:

To sort by the field "name" ascending, as an array of field names:
```
"sort": [{ "field": "name", "order": "asc" }]
```

To sort by the field "name" ascending, as a single field name:
```
"sort": { "field": "name", "order": "asc" }
```

To sort by the field "name" ascending, as a MongoDB-style object:
```
"sort": { "name": 1 }
```

To sort by multiple fields, as a MongoDB-style object:
```
"sort": { "name": 1, "age": -1 }
```

### Datasource filter events

A datasource can now specify a `filterEvent` property. Before the datasource attempts to load data
it will load and run an event file matching the `filterEvent` property. Filter events are identical to normal
event files, but they should return a filter object that the datasource will use when querying the API for data.

**Example filter event: /app/events/datasourceFilterTest.js**
```js
// the `data` parameter contains the data already loaded by
// the page's datasources
var Event = function (req, res, data, callback) {
  var filter = { "x": "1" };
  callback(null, filter);
};

module.exports = function (req, res, data, callback) {
  return new Event(req, res, data, callback);
};

module.exports.Event = Event;
```


# Version 0.5.0 / 2016-01-08

* Cache:
 - Ensure a more unique datasource cache key by including the datasource name as well as the endpoint
 - Ensure a more unique page cache key by including the query as well as the pathname
 - Improve search for loaded component based on request URL
 - Ensure contentType is passed from loaded component (page) settings when returning cached data

* Config:
 - Remove `sentry.enabled` and rely solely on the existence of the `sentry.dsn` property
 - Rationalise included config properties in sample files, most can be handled by the sensible defaults

* Datasource:
 - Add `skip` property to give the option of specifying an offset when querying for API data
 - Use main config api settings when endpoint host or port are not specified by the datasource schema

* Event:
 - Pass 404 errors from event files to the NotFound handler

* Views:
 - Added new `replace` helper, usage: {@replace str="hello.world" search="." replace="-" /}


# Version 0.1.7 / 2015-12-06

* Config:
  - Add config option for socket timeout, defaults to 30 seconds

* Keepalive header added to Serama data & auth requests



# Version 0.1.7 / 2015-11-26


* Server:
  - Error if the configured API can't be reached
  - Simplify middleware loading
* Logging:
  - Simplify error logging
  - Provide configuration for logging to a Sentry server
  - Remove Slack logging option, as this can be done from Sentry
* Config:
  - Provide configuration for logging to a Sentry server

# Version 0.1.6 / 2015-11-12

  * Cache:
    - Don't cache requests that use ?json=true in the querystring
    - Provides better integration with Express patterns
  * Debug:
    - When debug: true is set in config, a debug panel is added to the right side of the page with
      a view of the loaded data and various execution stats. Note this won't work if your data object contains
      Javascript ads with no CDATA declaration.
  * Logging:
    - Locate client IP in request headers when behind a load balancer
    - Fix logging in default error handler
    - Addition of AWS Kinesis and Slack logging options	(see example files or config.js)
    - Don't log to slack in test mode
  * Config:
    - Add support for serving content from virtual directories (see example files or config.js)
    - Add support for Gzip compression (see example files or config.js)
    - Add support for configurable cache control headers (see example files or config.js)
    - Add application name (see example files or config.js)
  * Pages:
    - Extend `toPath` method to cover all routes in a page
    - Addition of new getComponent method on the Server to return a page by key
  * Datasources:
    - Remove json param from query before building filter
  * Tests
    - improve test suite coverage
    - ensure test environment is set before tests run
  * Misc:
    - rename public to sample-public to avoid overwrite when updating
    - check page file extension when reloading to avoid processing swap files
