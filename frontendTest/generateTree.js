'use strict'

module.exports = (depth, breadth, leaf) => {
  let tree = {
    branches: []
  }

  function generateBranches(currentDepth) {
    const branch = {
      children: []
    }
    
    for (var i = 1; i <= breadth; i++) {
      if (currentDepth < depth) {
        branch.children.push(generateBranches(currentDepth + 1))
      } else {
        branch.children.push(leaf)
      }
    }
    
    return branch
  }

  return generateBranches(1)  
}
