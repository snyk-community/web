# DADI Web

## Core Concepts

* [Pages](https://github.com/dadi/web/blob/docs/docs/pages.md)
* [Routing](https://github.com/dadi/web/blob/docs/docs/routing.md)
* [Views](https://github.com/dadi/web/blob/docs/docs/views.md)
  * [Page Templates](https://github.com/dadi/web/blob/docs/docs/views#page-templates.md)
* Creating pages
  * Static Pages
* Data
  * [Datasources](https://github.com/dadi/web/blob/docs/docs/datasources.md)
  * Events
  * Globals
* [Logging](https://github.com/dadi/web/blob/docs/docs/logging.md)
* Middleware
  * Creating middleware
* Security
  * CORS
* [Sessions](https://github.com/dadi/web/blob/docs/docs/sessions.md)
* Caching
* [Development](https://github.com/dadi/web/blob/docs/docs/development.md)
* [Contributing](https://github.com/dadi/web/blob/docs/docs/contributingGuidelines.md)

## Contents

* [Overview](#overview)
* [Datasources](docs/datasource_specification.md)
* [Setup and installation](#setup-and-installation)
* [Configuration](#configuration)
* [Running the demo application](#running-the-demo-application)
* [Running the server](#running-the-server)
* [Further reading](#further-reading)

## TODO
* Add config documentation for new "paths" block, and the deprecated `workspace` default
* Sort out sample public & workspace folders
* Find somewhere for the debug assets
* Ensure demo app runs - perhaps add this to the generator and not the main codebase

## Overview

DADI Web is a high performance schema-less templating layer built on Node.JS and designed in support of API-first development and the principle of COPE.

It can operate as a stand alone platform or in conjunction with [DADI API](https://github.com/dadi/api) as a full stack web application.

DADI Web is part of [DADI](https://github.com/dadi/), a suite of components covering the full development stack, built for performance and scale.

### Component Terminology

#### Page descriptors
These files describe the application's pages and the routes which load them. Datasources and events used by the page are specified within these files.

[TODO] Rosecomb monitors the `workspace` folder for changes and will automatically reload pages and templates when these files change.

New pages can be initialised by simply creating new page descriptor and template files in `workspace/pages/`. A new page descriptor should take the format `{pagename}.json`. It should either reference an existing template file or you can create a new one in `workspace/pages/` with the format `{pagename}.dust`.

Unless a custom route has been specified in the page descriptpr, the new page will be availabe at `http://www.example.com/{pagename}`.


Multiple datasource files (`workspace/datasources/{datasourcename}.json`) can be attached to a page. Each datasource file describes which Serama endpoint to use, which filters to use, how many records to return etc. A full list of options can be found in the [Datasource Specification](datasource_specification.md) document.

###### Error Pages

###### _HTTP 404 Not Found_
To enable a custom 404 Not Found error page, add a page descriptor and template to the pages directory:

```
workspace/pages/404.json
workspace/pages/404.dust
```

404 templates have access to datasource and event data in the same way as standard pages.


### File structure
```  
  dadi/main.js
  workspace/datasources/{datasource name}.json
  workspace/events/{event name}.json
  workspace/pages/{page name}.dust
  workspace/pages/{page name}.json
  workspace/partials/{partial name}.dust
```

### Setup and installation

	[sudo] npm install

### Configuration

#### File structure
```  
  config.js
  config/config.development.json
  config/config.test.json
  config/config.staging.json
  config/config.production.json
```

See [Configuration](docs/configuration.md) for more information and a sample configuration file.

### Running the demo application


  node demo/main.js


### Running the server

[TODO]
Rosecomb expects the Serama API to be running locally on port 3001. Start the Serama server before running Rosecomb.

	npm start


### How it works

The `workspace` directory contains the pages, partials and datasources required to display data retrieved from the Serama API.

Each page is defined in a JSON file specifying the datasources that will retrieve the data for display.

A datasource is a JSON file specifying the API endpoint to connect to along with parameters to use when querying the API.

### Example

If a request is made to `http://localhost:3000/articles` the application takes the `articles` parameter and looks for an `articles.json` page descriptor in `workspace/pages`. Any datasources that page descriptor specifies are loaded from `workspace/datasources` and the data is retrieved from the datasource's API endpoint. In order to render the returned data to the browser, a Dust template must exist in `workspace/pages` with the same name as the requested page, e.g. `articles.dust`.

### Further Reading

The `docs/` directory contains additional documentation on the component parts of the system:

* [Configuration](docs/configuration.md)
* [Events](docs/events.md)
* [Pages](docs/page_specification.md)
* [Page Templates](docs/page_templates.md)
* [Routing](docs/routing.md)
* [Logging](docs/logging.md)

Feel free to contact the dadi core development team on team@bant.am with questions.

### Is something missing?
If you notice something we've missed or could be improved on, please follow this link and submit a pull request to the sails-docs repo. Once we merge it, the changes will be reflected on the website the next time it is deployed.


### Contributing

Very daring.

Any new feature, enhancement or bug fix should be accompanied by unit and/or acceptance tests. Fork, hack, add tests, then send us a pull request :)

## Licence

DADI is a data centric development and delivery stack, built specifically in support of the principles of API first and COPE.

Copyright notice<br />
(C) 2016 DADI+ Limited <support@dadi.tech><br />
All rights reserved

This product is part of DADI.<br />
DADI is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as
published by the Free Software Foundation; either version 2 of
the License, or (at your option) any later version ("the GPL").
**If you wish to use DADI outside the scope of the GPL, please
contact us at info@dadi.co for details of alternative licence
arrangements.**

**This product may be distributed alongside other components
available under different licences (which may not be GPL). See
those components themselves, or the documentation accompanying
them, to determine what licences are applicable.**

DADI is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

The GNU General Public License (GPL) is available at
http://www.gnu.org/copyleft/gpl.html.<br />
A copy can be found in the file GPL distributed with
these files.

This copyright notice MUST APPEAR in all copies of the product!
