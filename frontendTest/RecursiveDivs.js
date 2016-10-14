'use strict'

var React = require('react')

const leaf = React.createElement(
  "div",
  null,
  "abcdefghij"
);

var RecursiveDivs = React.createClass({
  render: function () {
    const depth = this.props.depth
    const breadth = this.props.breadth
    const textLength = this.props.textLength

    if (depth <= 0) {
      return leaf;
    }

    let children = [];
    for (let i = 0; i < breadth; i++) {
      children.push(React.createElement(RecursiveDivs, { key: i, depth: depth - 1, breadth: breadth, textLength: textLength }));
    }
    return React.createElement(
      "div",
      null,
      children
    );
  }
})

module.exports = RecursiveDivs