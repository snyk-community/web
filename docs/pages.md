## Pages

### Creating pages

#### Basic Page Configuration

##### app/pages/person.json
```json
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

##### app/pages/person.json
```json
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

Property    |   | Description        |  Type        | Default         |  Example
------------|----|------------|------------------|----------------|---------
**page**|        ||||
 | name          ||||
 | key           ||||
 | description   ||||
**settings** |   ||||
 | cache         ||||
 | beautify      ||||
 | keepWhitespace    ||||
| passFilters    ||||
route            |||||
contentType      |||||
template         |||||
datasources      |||||
events           |||||


### Routes

#### Dynamic route segments

```json
"route": {
  "path": "/people/:id"
}
```

#### Multi-route pages

```json
"route": {
  "paths": ["/people", "/people/:id"]
}
```

#### Constraints for ambiguous routes

```json
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
