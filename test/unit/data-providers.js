var _ = require('underscore')
var fs = require('fs')
var nock = require('nock')
var path = require('path')
var sinon = require('sinon')
var should = require('should')
var Readable = require('stream').Readable
var request = require('supertest')
var zlib = require('zlib')

var api = require(__dirname + '/../../dadi/lib/api')
var Controller = require(__dirname + '/../../dadi/lib/controller')
var datasource = require(__dirname + '/../../dadi/lib/datasource')
var help = require(__dirname + '/../../dadi/lib/help')
var Page = require(__dirname + '/../../dadi/lib/page')
var remoteProvider = require(__dirname + '/../../dadi/lib/providers/remote')
var Server = require(__dirname + '/../../dadi/lib')
var TestHelper = require(__dirname + '/../help')()
var twitterProvider = require(__dirname + '/../../dadi/lib/providers/twitter')
var wordpressProvider = require(__dirname + '/../../dadi/lib/providers/wordpress')

var config = require(path.resolve(path.join(__dirname, '/../../config')))
var controller

describe('Data Providers', function (done) {
  beforeEach(function (done) {
    TestHelper.resetConfig().then(() => {
      TestHelper.disableApiConfig().then(() => {
        done()
      })
    })
  })

  afterEach(function (done) {
    TestHelper.stopServer(function() {})
    done()
  })

  describe('Remote', function (done) {
    it('should return gzipped response if accept header specifies it', function (done) {
      TestHelper.enableApiConfig().then(() => {
        var pages = TestHelper.setUpPages()
        pages[0].datasources = ['car-makes-unchained']

        var text = JSON.stringify({ 'hello': 'world!' })

        zlib.gzip(text, function (_, data) {
          TestHelper.setupApiIntercepts()

          var connectionString = 'http://' + config.get('server.host') + ':' + config.get('server.port')
          var apiConnectionString = 'http://' + config.get('api.host') + ':' + config.get('api.port')

          var scope = nock(apiConnectionString)
          .defaultReplyHeaders({
            'content-encoding': 'gzip'
          })
          .get('/1.0/cars/makes?count=20&page=1&filter=%7B%7D&fields=%7B%22name%22:1,%22_id%22:0%7D&sort=%7B%22name%22:1%7D&cache=false')
          .times(5)
          .reply(200, data)

          var providerSpy = sinon.spy(remoteProvider.prototype, 'processOutput')

          TestHelper.startServer(pages).then(() => {
            var client = request(connectionString)

            client
            .get(pages[0].routes[0].path + '?cache=false')
            .end((err, res) => {
              providerSpy.restore()
              providerSpy.called.should.eql(true)
              providerSpy.firstCall.args[1].should.eql(text)

              done()
            })
          })
        })
      })
    })
  })

  describe('Static', function (done) {
  })

  describe('Twitter', function (done) {
    it('should use the datasource count property when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'twitter', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.count = 10

      var params = ds.provider.buildQueryParams()

      should.exists(params.count)
      params.count.should.eql(10)
      done()
    })

    it('should use the datasource filter property when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'twitter', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.filter = { 'field': 'value' }

      var params = ds.provider.buildQueryParams()

      should.exists(params.field)
      params.field.should.eql('value')
      done()
    })

    it('should only return data matching specified datasource fields when data is an array', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'twitter', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.fields = { 'field1': 1, 'field3': 1 }

      var data = [
        {
          field1: '1',
          field2: '2',
          field3: '3',
          field4: '4'
        },
        {
          field1: '5',
          field2: '6',
          field3: '7',
          field4: '8'
        }
      ]

      var data = ds.provider.processFields(data)
      data.should.eql([ { field1: '1', field3: '3' }, { field1: '5', field3: '7' } ])
      done()
    })

    it('should only return data matching specified datasource fields when data is an object', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'twitter', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.fields = { 'field1': 1, 'field3': 1 }

      var data = {
        field1: '1',
        field2: '2',
        field3: '3',
        field4: '4'
      }

      var data = ds.provider.processFields(data)
      data.should.eql({ field1: '1', field3: '3' })
      done()
    })

    it('should use the auth details in main config if not specifed by the datasource', function(done) {
      var authConfig = {
        twitter: {
          consumerKey: 'key',
          consumerSecret: 'secret',
          accessTokenKey: 'tokenKey',
          accessTokenSecret: 'tokenSecret'
        }
      }

      TestHelper.disableApiConfig().then(() => {
        TestHelper.updateConfig(authConfig).then(() => {
          var pages = TestHelper.setUpPages()
          pages[0].datasources = ['twitter']

          var providerSpy = sinon.spy(twitterProvider.prototype, 'initialise')

          TestHelper.startServer(pages).then(() => {
            providerSpy.restore()

            providerSpy.thisValues[0].consumerKey.should.eql(authConfig.twitter.consumerKey)
            providerSpy.thisValues[0].consumerSecret.should.eql(authConfig.twitter.consumerSecret)
            providerSpy.thisValues[0].accessTokenKey.should.eql(authConfig.twitter.accessTokenKey)
            providerSpy.thisValues[0].accessTokenSecret.should.eql(authConfig.twitter.accessTokenSecret)
            done()
          })
        })
      })
    })

    it('should use the auth details specified in the datasource config', function(done) {
      var authConfig = {
        consumer_key: 'auth.key',
        consumer_secret: 'auth.secret',
        access_token_key: 'auth.tokenKey',
        access_token_secret: 'auth.tokenSecret'
      }

      var dsSchema = TestHelper.getSchemaFromFile(TestHelper.getPathOptions().datasourcePath, 'twitter')
      dsSchema.datasource.auth = authConfig

      sinon.stub(datasource.Datasource.prototype, 'loadDatasource').yields(null, dsSchema)

      TestHelper.disableApiConfig().then(() => {
        var pages = TestHelper.setUpPages()
        pages[0].datasources = ['twitter']

        var providerSpy = sinon.spy(twitterProvider.prototype, 'initialise')

        TestHelper.startServer(pages).then(() => {
          datasource.Datasource.prototype.loadDatasource.restore()
          providerSpy.restore()

          providerSpy.thisValues[0].consumerKey.should.eql(authConfig.consumer_key)
          providerSpy.thisValues[0].consumerSecret.should.eql(authConfig.consumer_secret)
          providerSpy.thisValues[0].accessTokenKey.should.eql(authConfig.access_token_key)
          providerSpy.thisValues[0].accessTokenSecret.should.eql(authConfig.access_token_secret)
          done()
        })
      })
    })

    it('should return data when no error is encountered', function(done) {
      var host = 'https://api.twitter.com:443'
      var path = '/1.1/xxx.json'
      var scope = nock(host).get(path).reply(200, { x: 'y' })

      TestHelper.disableApiConfig().then(() => {
        TestHelper.updateConfig({'allowJsonView': true}).then(() => {
          var pages = TestHelper.setUpPages()
          pages[0].datasources = ['twitter']

          TestHelper.startServer(pages).then(() => {
            var connectionString = 'http://' + config.get('server.host') + ':' + config.get('server.port')
            var client = request(connectionString)

            client
            .get(pages[0].routes[0].path + '?json=true')
            .end((err, res) => {
              should.exist(res.body.twitter)
              res.body.twitter.should.eql({x:'y'})
              done()
            })
          })
        })
      })
    })
  })

  describe('Wordpress', function (done) {
    it('should add query parameters to the endpoint', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'wordpress', TestHelper.getPathOptions(), function () {})

      var req = {
        url: '/posts/one-wet-day',
        params: {
          slug: 'one-wet-day'
        }
      }

      ds.provider.buildEndpoint(req)
      ds.provider.endpoint.should.eql('sites/neversettleblog.wordpress.com/posts/slug:one-wet-day')
      done()
    })

    it('should use the datasource count property when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'wordpress', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.count = 10

      var params = ds.provider.buildQueryParams()

      should.exists(params.count)
      params.count.should.eql(10)
      done()
    })

    it('should use an array of datasource fields when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'wordpress', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.fields = ['field1', 'field2']

      var params = ds.provider.buildQueryParams()
      should.exists(params.fields)
      params.fields.should.eql('field1,field2')
      done()
    })

    it('should use an object of datasource fields when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'wordpress', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.fields = {'field1': 1, 'field2': 1}

      var params = ds.provider.buildQueryParams()
      should.exists(params.fields)
      params.fields.should.eql('field1,field2')
      done()
    })

    it('should use the datasource filter property when querying the API', function(done) {
      var ds = datasource(Page('test', TestHelper.getPageSchema()), 'wordpress', TestHelper.getPathOptions(), function () {})
      ds.schema.datasource.filter = { 'field': 'value' }

      var params = ds.provider.buildQueryParams()

      should.exists(params.field)
      params.field.should.eql('value')
      done()
    })

    it('should use the token specified in main config if no token is specifed by the datasource ')
    it('should use the token specified in the datasource config')

    it('should return data when no error is encountered', function(done) {
      var host = 'https://public-api.wordpress.com'
      var path = '/rest/v1.1/sites/neversettleblog.wordpress.com/posts/slug:$post_slug?fields='
      var scope = nock(host).get(path).reply(200, { x: 'y' })

      TestHelper.disableApiConfig().then(() => {
        TestHelper.updateConfig({'allowJsonView': true}).then(() => {
          var pages = TestHelper.setUpPages()
          pages[0].datasources = ['wordpress']

          TestHelper.startServer(pages).then(() => {
            var connectionString = 'http://' + config.get('server.host') + ':' + config.get('server.port')
            var client = request(connectionString)

            client
            .get(pages[0].routes[0].path + '?json=true')
            .end((err, res) => {
              should.exist(res.body['wordpress-post'])
              res.body['wordpress-post'].should.eql({x:'y'})
              done()
            })
          })
        })
      })
    })
  })
})
