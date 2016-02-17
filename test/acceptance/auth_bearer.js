var sinon = require('sinon');
var should = require('should');
var request = require('supertest');
// loaded customised fakeweb module
var fakeweb = require(__dirname + '/../fakeweb');
var http = require('http');
var proxyquire =  require('proxyquire');
var _ = require('underscore');

var Controller = require(__dirname + '/../../dadi/lib/controller');
var Datasource = require(__dirname + '/../../dadi/lib/datasource');
var Page = require(__dirname + '/../../dadi/lib/page');
var api = require(__dirname + '/../../dadi/lib/api');
var Server = require(__dirname + '/../../dadi/lib');
var help = require(__dirname + '/../help');
var libHelp = require(__dirname + '/../../dadi/lib/help');
var config = require(__dirname + '/../../config.js');

var clientHost = 'http://' + config.get('server.host') + ':' + config.get('server.port');
var apiHost = 'http://' + config.get('api.host') + ':' + config.get('api.port');

var token = JSON.stringify({
  "accessToken": "da6f610b-6f91-4bce-945d-9829cac5de71",
  "tokenType": "Bearer",
  "expiresIn": 2592000
});

// console.log();
// console.log('apiHost: ' + apiHost);
// console.log('clientHost: ' + clientHost);

function startServer(done) {

  var options = {
    pagePath: __dirname + '/../app/pages',
    eventPath: __dirname + '/../app/events'
  };

  Server.app = api();
  Server.components = {};

  // create a page
  var name = 'test';
  var schema = help.getPageSchema();
  var page = Page(name, schema);
  var dsName = 'car-makes-unchained';
  var options = help.getPathOptions();

  page.datasources = ['car-makes-unchained'];

  var ds = Datasource(page, dsName, options, function() {} );

  page.template = 'test.dust';
  page.route.paths[0] = '/test';
  page.settings.cache = false;
  page.events = [];
  delete page.route.constraint;

  Server.start(function() {

    setTimeout(function() {

      // create a handler for requests to this page
      var controller = Controller(page, options);

      Server.addComponent({
          key: page.key,
          route: page.route,
          component: controller
      }, false);

      done();
    }, 200);
  });
}

describe('Auth - Datasource', function (done) {

  var auth;

  before(function(done) {

    done();
  });

  beforeEach(function(done) {

    // intercept the api test at server startup
    sinon.stub(libHelp, "isApiAvailable").yields(null, true);

    done();
  });

  afterEach(function(done) {

    libHelp.isApiAvailable.restore();

    http.clear_intercepts();

    done();
  });

  it('should return error if no token was obtained', function (done) {

    config.set('api.enabled', true);

    // first intercept is for the main auth
    http.register_intercept({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/token',
      method: 'POST',
      agent: new http.Agent({ keepAlive: true }),
      headers: { 'Content-Type': 'application/json' },
      body: token
    });

    // second intercept is for the datasource
    http.register_intercept({
      hostname: '127.0.0.1',
      port: 9000,
      path: '/token',
      method: 'POST',
      agent: new http.Agent({ keepAlive: true }),
      headers: { 'Content-Type': 'application/json' }
    });

    delete require.cache['../../dadi/lib/auth'];
    auth = proxyquire('../../dadi/lib/auth', {'http': http});

    delete require.cache['../../dadi/lib/auth/bearer'];
    bearer_auth = proxyquire('../../dadi/lib/auth/bearer', {'http': http});

    startServer(function() {

      setTimeout(function() {

        var client = request(clientHost);
        client
        .get('/test')
        .expect('content-type', 'text/html')
        .expect(500)
        .end(function (err, res) {

          if (err) return done(err);

          (res.text.indexOf("Datasource authentication: No token received, invalid credentials for datasource") > -1).should.eql(true);

          Server.stop(function() {
            setTimeout(function() {
              done();
            }, 200);
          });

        });
      }, 500);

    });

  });

  it('should not error if valid credentials are supplied and a token is returned', function (done) {

    config.set('api.enabled', true);
    config.set('allowJsonView', true);

    // first intercept is for the main auth
    http.register_intercept({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/token',
      method: 'POST',
      agent: new http.Agent({ keepAlive: true }),
      headers: { 'Content-Type': 'application/json' },
      body: token
    });

    // second intercept is for the datasource
    http.register_intercept({
      hostname: '127.0.0.1',
      port: 9000,
      path: '/token',
      method: 'POST',
      agent: new http.Agent({ keepAlive: true }),
      headers: { 'Content-Type': 'application/json' },
      body: token
    });

    var result = JSON.stringify({
      results: [
        {
          makeName: 'Ford'
        }
      ]
    });

    http.register_intercept({
      hostname: '127.0.0.1',
      port: 3000,
      path: 'http://127.0.0.1:3000/1.0/cars/makes?count=20&page=1&filter={}&fields={"name":1,"_id":0}&sort={"name":1}',
      method: 'GET',
      agent: new http.Agent({ keepAlive: true }),
      headers: { Authorization: 'Bearer da6f610b-6f91-4bce-945d-9829cac5de71' },
      body: result
    });

    delete require.cache['../../dadi/lib/auth'];
    auth = proxyquire('../../dadi/lib/auth', {'http': http});

    delete require.cache['../../dadi/lib/auth/bearer'];
    bearer_auth = proxyquire('../../dadi/lib/auth/bearer', {'http': http});

    startServer(function() {

      setTimeout(function() {

        var client = request(clientHost);
        client
        .get('/test?json=true')
        .expect('content-type', 'application/json')
        .expect(200)
        .end(function (err, res) {

          if (err) return done(err);

          var actual = JSON.stringify(res.body['car-makes-unchained']);
          var expected = JSON.stringify(JSON.parse(result));
          actual.should.eql(expected);

          Server.stop(function() {
            setTimeout(function() {
              done();
            }, 200);
          });

        });
      }, 500);

    });

  });

});