var fs = require('fs');
var _ = require('underscore');
var log = require(__dirname + '/../log');
var BearerAuthStrategy = require(__dirname + '/../auth/bearer');

var Datasource = function (page, datasource, options, callback) {
  if (page) {
      //throw new Error('Page instance required');
  
    this.page = page;
    this.name = datasource;
    this.options = options || {};

    var self = this;

    this.loadDatasource(function(schema) {
      self.schema = schema;
      self.source = schema.datasource.source;
      
      if (self.source.type === 'static') {
        callback(self);
      }

      self.requestParams = schema.datasource.requestParams || [];
      self.chained = schema.datasource.chained || null;
      self.authStrategy = self.setAuthStrategy();
      self.buildEndpoint(schema, function(endpoint) {
        self.endpoint = endpoint;
        callback(null, self);
      });
    });
  }
};

Datasource.prototype.loadDatasource = function(done) {

  var filepath = this.options.datasourcePath + "/" + this.name + ".json";
  var schema;

  // get the datasource schema
  if (!fs.existsSync(filepath)) {
    throw new Error('Page "' + this.page.name + '" references datasource "' + this.name + '" which can\'t be found in "' + this.options.datasourcePath + '"');
  }
  
  try {
    var body = fs.readFileSync(filepath, {encoding: 'utf-8'});

    schema = JSON.parse(body);
    done(schema);
  }
  catch (err) {
    throw new Error('Error loading datasource schema "' + filepath + '". Is it valid JSON? ' + err);
  }
};

Datasource.prototype.setAuthStrategy = function() {
  
  if (!this.schema.datasource.auth) return null;

//  var authConfig = {};

  // load the auth configuration file
  // var authConfigPath = __dirname + '/../../../config.auth.json';
  // if (fs.existsSync(authConfigPath)) {
  //   try {
  //     var body = fs.readFileSync(authConfigPath, {encoding: 'utf-8'});
  //     authConfig = JSON.parse(body);
  //   }
  //   catch (err) {
  //     throw new Error('Error loading datasource auth config "' + filepath + '". Is it valid JSON? ' + err);
  //   }
  // }
    
  // var authBlock = this.schema.datasource.auth;

  // if (typeof authBlock === 'string' && authConfig[authBlock]) {
  //   this.schema.datasource.auth = authConfig[authBlock];
  // }
  
  return new BearerAuthStrategy(this.schema.datasource.auth);
};

Datasource.prototype.buildEndpoint = function(schema, done) {
  
  if (schema.datasource.source.type === 'static') return;
  
  var self = this;
  var uri = "";

  var protocol = schema.datasource.source.protocol || "http";
  var host = schema.datasource.source.host || "";
  var port = schema.datasource.source.port || "";
  
  uri = [protocol, "://", host, port != "" ? ":" : "", port, "/", schema.datasource.source.endpoint].join("");

  self.processDatasourceParameters(schema, uri, function(endpoint) {
    done(endpoint);
  });
};

Datasource.prototype.processDatasourceParameters = function (schema, uri, done) {

  var query = "?";
  
  var params = [
    {"count": (schema.datasource.count || 0)},
    {"page": (schema.datasource.page || 1)},
    {"search": schema.datasource.search},
    {"filter": schema.datasource.filter || {}},
    {"fields": schema.datasource.fields},
    {"sort": processSortParameter(schema.datasource.sort)}
  ];

  if (schema.datasource.hasOwnProperty('cache')) {
    // pass cache flag to Serama endpoint
    params.push({"cache": schema.datasource.cache});
  }

  params.forEach(function(param) {
    for (key in param) {
      if (param.hasOwnProperty(key) && (typeof param[key] !== 'undefined')) {
        query = query + key + "=" + (_.isObject(param[key]) ? JSON.stringify(param[key]) : param[key]) + "&";
      }
    }

    if (params.indexOf(param) === (params.length-1)) {
      done(uri + query.slice(0,-1));
    }
  });
}

function processSortParameter(obj) {
  var sort = {};
  if (typeof obj !== 'object' || obj === null) return sort;

  _.each(obj, function(value, key) {    
    if (typeof value === 'object' && value.hasOwnProperty('field') && value.hasOwnProperty('order')) {
      sort[value.field] = (value.order === 'asc') ? 1 : -1;
    }
  });

  return sort;
}

module.exports = function (page, datasource, options, callback) {
  return new Datasource(page, datasource, options, callback);
};

module.exports.Datasource = Datasource;
