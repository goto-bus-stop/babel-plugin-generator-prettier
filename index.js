var prettier = require('prettier')
var has = require('has')

var optionKeys = [
  'printWidth',
  'tabWidth',
  'useTabs',
  'semi',
  'singleQuote',
  'trailingComma',
  'bracketSpacing',
  'jsxBracketSameLine',
  'arrowParens',
  'requirePragma',
  'insertPragma'
]

function print (ast, opts, input) {
  var formatOpts = {
    // By using a custom parser we can use the already parsed AST.
    // This is better than using __debug.formatAST, because this way prettier still handles comments;
    // comments would be lost when using the formatAST API.
    parser: function () {
      return ast
    }
  }

  for (var i = 0; i < optionKeys.length; i++) {
    if (has(opts, optionKeys[i])) {
      formatOpts[optionKeys[i]] = opts[optionKeys[i]]
    }
  }

  var result = prettier.format(input, formatOpts)

  return {
    code: result
  }
}

module.exports = function generatorPrettier (api) {
  api.assertVersion(7)

  return {
    generatorOverride: print
  }
}
