/**
 * @module View
 */
var path = require('path')

var beautifyHtml = require('js-beautify').html
var dust = require(path.join(__dirname, '/../dust'))
var help = require(__dirname + '/../help')


var React = require('react')
//var ReactDOMServer = require('react-dom/server')
var ReactDOMServer = require('react-dom-stream/server')

var View = function (url, page, json) {
  this.url = url
  this.page = page
  this.json = json
  this.data = {}

  this.pageTemplate = this.page.template.slice(0, this.page.template.indexOf('.'))
}

View.prototype.setData = function (data) {
  this.data = data
}

View.prototype.render = function (req, res) {
  switch (this.data.page.engine) {
    case 'dust':
      this.renderDust(req, res)

      break

    case 'react':
      this.renderReact(req, res)

      break

    case 'riot':
      this.renderRiot(req, res)

      break      
  }
}

const DEPTH = 4
const BREADTH = 10

View.prototype.renderReact = function (req, res) {
  var RecursiveDivs = require(__dirname + '/../../../frontendTest/RecursiveDivs')
  var rootEl = React.createElement(RecursiveDivs, { depth: DEPTH, breadth: BREADTH });
  
  console.time('renderReact (first byte)')
  console.time('renderReact (last byte)')

  var running = false

  ReactDOMServer.renderToString(rootEl)
    .on('end', () => {
      console.timeEnd('renderReact (last byte)')
    })
    .on('data', () => {
      if (running) return
      
      running = true
      console.timeEnd('renderReact (first byte)')
    })
    .pipe(res)
}

View.prototype.renderDust = function (req, res) {
  var tree = require(__dirname + '/../../../frontendTest/generateTree')(DEPTH, BREADTH, 'abcdefghij')
  var running = false

  dust.clearCache()

  console.time('renderDust (first byte)')
  console.time('renderDust (last byte)')
  dust.getEngine().stream(this.pageTemplate, {tree: tree})
    .on('end', () => {
      console.timeEnd('renderDust (last byte)')
    })
    .on('data', () => {
      if (running) return
      
      running = true
      console.timeEnd('renderDust (first byte)')
    })  
    .pipe(res)
}

View.prototype.renderRiot = function (req, res) {
  var tree = require(__dirname + '/../../../frontendTest/generateTree')(DEPTH, BREADTH, 'abcdefghij')

  const riot = require('riot')

  var nodeTag = require(__dirname + '/../../../frontendTest/node.tag')

  const output = riot.render(nodeTag, {end: true})

  dust.getEngine().render('benchmark-riot', {content: output}, (err, out) => {
    res.end(out)
  })
}

// View.prototype.renderDust = function (req, res) {
//   var tree = require(__dirname + '/../../../frontendTest/generateTree')(DEPTH, BREADTH, 'abcdefghij')

//   dust.clearCache()

//   console.time('renderDust')
//   dust.render(this.pageTemplate, {tree: tree}, (err, result) => {
//     console.timeEnd('renderDust')
//     res.end(result)
//   })
// }

// View.prototype.render = function (done) {
//   if (this.json) {
//     // Return the raw data
//     return done(null, this.data)
//   } else {
//     dust.setConfig('whitespace', this.page.keepWhitespace)

//     // Render the compiled template
//     dust.render(this.pageTemplate, this.data, (err, result) => {
//       if (err) {
//         console.log(err)
//         err.statusCode = 500
//         return done(err, null)
//       }

//       if (this.page.beautify) {
//         try {
//           result = beautifyHtml(result)
//         } catch (e) {
//           err = e
//         }
//       }

//       return done(err, result)
//     })
//   }
// }

module.exports = function (url, page, json) {
  return new View(url, page, json)
}

module.exports.View = View
