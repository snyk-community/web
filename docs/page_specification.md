
#### Routing


##### Route Constraints


###### Constraint Functions

Constraint functions must be added to `workspace/routes/constraints.js`. In the following example a route has a dynamic parameter `content`. The constraint function `nextIfNewsOrFeatures` will check the value of the `content` parameter and return `false` if it matches "news" or "features.

_workspace/pages/movies.json_

```js
"route": {
	"paths": ["/movies/:content"],
	"constraint": "nextIfNewsOrFeatures"
},
```

_workspace/routes/constraints.js_

```js
module.exports.nextIfNewsOrFeatures = function (req, res, callback) {  
  if (req.params.content === 'news' || req.params.content === 'features' ) {
  	return callback(false);
  }
  else {
  	return callback(true);
  }
};
```

###### Constraint Datasources

An existing datasource can be used as the route constraint. The specified datasource must exist in `workspace/data-sources/`. The following examples have some missing properties for brevity.

_workspace/pages/manufacturer.json_

```js
"route": {
	"paths": ["/:manufacturer"],
	"constraint": "manufacturers"
},
```

_workspace/data-sources/manufacturers.json_

```js
{
	"datasource": {
		"key": "manufacturers",
		"name": "Car manufacturers datasource",
		"source": {
			"type": "remote",
			"protocol": "http",
			"host": "127.0.0.1",
			"port": "3000",
			"endpoint": "1.0/car/manufacturers"
		},
		"count": 1,
		"fields": { "name": 1, "_id": 0 },
		"requestParams": [
			{ "param": "manufacturer", "field": "name" }
		]
	}
}

```

In the above example a request for `http://www.example.com/nissan` will call the `manufacturers` datasource, using the `requestParams` to supply a filter to the endpoint. The request parameter `:manufacturer` will be set to `nissan` and the resulting datasource endpoint will become:

```
http://127.0.0.1:3000/1.0/car/manufacturers?filter={"name":"nissan"}
```

If there is a result for this datasource query, the constraint will return `true`, otherwise `false`.
